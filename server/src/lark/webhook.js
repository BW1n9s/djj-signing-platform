// Lark Webhook 路由 / Lark webhook router
// POST /lark/webhook      — 事件接收 + URL 验证
// POST /lark/card-action  — 卡片按钮点击回调
import { Hono } from 'hono';
import { sendMessage, sendCard, getTenantAccessToken } from './client.js';
import { searchDeliveryEmails, parseEmailToDeliveryData } from '../gmail/search.js';
import { buildDriverSigningUrl } from '../delivery/buildLink.js';

const router = new Hono();

// 等待用户选择邮件的内存状态（同一 Worker 实例内有效）
// Pending email selection state — valid within one Worker instance
// 注意：CF Workers 多实例场景下不共享此状态（需 KV/Durable Objects 才能跨实例）
// Note: not shared across Worker instances; use KV/Durable Objects for production HA
const pendingSelections = new Map();
const SELECTION_TTL = 30 * 60_000; // 30 分钟 / 30 minutes

const pendingSigs = new Map(); // open_id → { dataUrl, expiresAt }
const SIG_TTL = 5 * 60_000;   // 5 minutes to reply with name

// POST /lark/webhook
// 飞书要求：必须立即返回 200，否则会重试推送
// Lark requires 200 immediately or it will retry
router.post('/webhook', async (c) => {
  const env = c.env;
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false }, 400);
  }

  // --- URL 验证 (challenge) / URL Verification ---
  // v1 格式 / v1 format
  if (body.type === 'url_verification') {
    return c.json({ challenge: body.challenge });
  }
  // v2 格式 / v2 format
  if (body.schema === '2.0' && body.header?.event_type === 'url_verification') {
    return c.json({ challenge: body.event?.challenge });
  }

  // --- Verification Token 校验 / Token validation ---
  const token = body.token ?? body.header?.token;
  if (env.LARK_VERIFICATION_TOKEN && token !== env.LARK_VERIFICATION_TOKEN) {
    console.warn('[webhook] Verification token mismatch — request ignored');
    return c.json({ ok: false });
  }

  // 立即返回 200，用 waitUntil 异步处理，避免超时触发 Lark 重试
  // Return 200 immediately; use waitUntil for async processing to avoid timeouts
  const ctx = c.executionCtx;
  if (ctx?.waitUntil) {
    ctx.waitUntil(handleEvent(env, body));
  } else {
    // 本地 wrangler dev 回退 / Fallback for local wrangler dev
    handleEvent(env, body).catch(console.error);
  }

  return c.json({ ok: true });
});

// POST /lark/card-action
// 飞书卡片按钮点击回调（需在飞书后台设置 Card Request URL）
// Card button click callback (configure Card Request URL in Lark console)
router.post('/card-action', async (c) => {
  const env = c.env;
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ toast: { type: 'error', content: 'Invalid request' } });
  }

  // 飞书验证 Card Request URL 时发送 challenge，必须原样返回
  // Lark sends a challenge when verifying the Card Request URL — echo it back
  if (body.challenge) {
    return c.json({ challenge: body.challenge });
  }

  const ctx = c.executionCtx;
  if (ctx?.waitUntil) {
    ctx.waitUntil(handleCardAction(env, body));
  } else {
    handleCardAction(env, body).catch(console.error);
  }

  // 立即返回 toast 提示 / Return toast prompt immediately
  return c.json({ toast: { type: 'info', content: '处理中… / Processing…' } });
});

// ─── 私有函数 / Private functions ─────────────────────────────────────────────

async function handleCardAction(env, body) {
  try {
    const action = body.action;
    const open_id =
      body.open_id ??
      body.user_info?.open_id ??
      body.operator?.open_id;

    if (!open_id || action?.value?.action !== 'select_email') return;

    const index = parseInt(action.value.index ?? 0, 10);
    const state = pendingSelections.get(open_id);

    // 检查状态是否过期（懒清理 / lazy cleanup）
    if (!state || Date.now() - state.createdAt > SELECTION_TTL) {
      pendingSelections.delete(open_id);
      await sendMessage(env, open_id,
        '会话已过期，请重新发送消息触发搜索。\nSession expired — please send a new message.'
      );
      return;
    }

    const email = state.emails[index];
    if (!email) {
      await sendMessage(env, open_id, '选择无效，请重试。\nInvalid selection — please try again.');
      return;
    }

    pendingSelections.delete(open_id);
    await processSelectedEmail(env, open_id, email);
  } catch (err) {
    console.error('[card-action]', err.message);
  }
}

async function handleEvent(env, body) {
  try {
    // 兼容 v1 / v2 两种格式 / Support both v1 and v2 event formats
    let eventType, event;
    if (body.schema === '2.0') {
      eventType = body.header?.event_type;
      event = body.event;
    } else {
      eventType = body.event?.type;
      event = body.event;
    }

    if (eventType !== 'im.message.receive_v1') return;

    const message = event?.message;
    const open_id = event?.sender?.sender_id?.open_id;
    if (!message || !open_id) return;

    // 只处理私聊消息 / Only handle direct (p2p) messages
    if (message.chat_type !== 'p2p') return;

    // ── Image message → signature registration ──────────────────────────────
    if (message.msg_type === 'image') {
      await handleImageMessage(env, open_id, message);
      return;
    }

    // ── Text message ────────────────────────────────────────────────────────
    let text = '';
    try {
      text = JSON.parse(message.content)?.text ?? '';
    } catch {
      return;
    }

    // If user previously sent a signature image, they're now providing their name
    const pendingSig = pendingSigs.get(open_id);
    if (pendingSig) {
      if (Date.now() < pendingSig.expiresAt) {
        const name = text.trim();
        if (name) {
          pendingSigs.delete(open_id);
          if (env.SIG_KV) {
            await env.SIG_KV.put(
              `sig:${open_id}`,
              JSON.stringify({ dataUrl: pendingSig.dataUrl, name, savedAt: Date.now() })
            );
            await sendMessage(env, open_id,
              `✅ 签名已保存为「${name}」。\n下次打开租赁协议时，"自动签署 (${name})" 按钮将使用您的个人签名。\n\n✅ Signature saved as "${name}".\nNext time you open a Rental Agreement the "Auto-sign (${name})" button will use your personal signature.`
            );
          } else {
            await sendMessage(env, open_id,
              '❌ 签名存储尚未配置，请联系管理员设置 KV 存储。\n❌ Signature storage not configured — ask an admin to set up KV.'
            );
          }
          return;
        }
      } else {
        pendingSigs.delete(open_id);
      }
    }

    // ── Normal keyword routing ───────────────────────────────────────────────
    const isDeliveryTrigger = /delivery|送货|picking|booking|confirmation/i.test(text);
    const isRentalTrigger   = /rental|hire|rent|叉车|租赁|协议/i.test(text);

    if (isRentalTrigger) {
      await handleRentalTrigger(env, open_id);
      return;
    }

    if (isDeliveryTrigger) {
      await sendMessage(env, open_id, '正在搜索邮件，请稍候…\nSearching emails, please wait…');

      let emails;
      try {
        emails = await searchDeliveryEmails(env);
      } catch (err) {
        console.error('[handleEvent] Gmail search error:', err.message);
        await sendMessage(env, open_id,
          `❌ Gmail 搜索失败：${err.message}\n请检查 Gmail OAuth2 配置是否正确。`
        );
        return;
      }

      if (!emails || emails.length === 0) {
        await sendMessage(env, open_id,
          '未找到最近 30 天内的送货相关邮件。\nNo delivery emails found in the last 30 days.'
        );
        return;
      }

      if (emails.length === 1) {
        await processSelectedEmail(env, open_id, emails[0]);
        return;
      }

      // 多封邮件：发送选择卡片（最多 5 封）/ Multiple emails: send selection card (up to 5)
      const topEmails = emails.slice(0, 5);
      pendingSelections.set(open_id, { emails: topEmails, createdAt: Date.now() });
      await sendCard(env, open_id, buildSelectionCard(topEmails));
    } else {
      await sendCard(env, open_id, buildStartCard(env.SIGNING_BASE_URL, open_id));
    }
  } catch (err) {
    console.error('[handleEvent]', err.message);
  }
}

async function processSelectedEmail(env, open_id, email) {
  let data;
  try {
    data = await parseEmailToDeliveryData(email);
  } catch (err) {
    await sendMessage(env, open_id, `❌ 邮件解析失败：${err.message}`);
    return;
  }

  const dataWithOpenId = { ...data, open_id };
  const signingUrl = buildDriverSigningUrl(dataWithOpenId, env);

  const summary = [
    '✅ 已提取送货信息 / Delivery info extracted:',
    data.invoice_no       ? `📄 发票号 Invoice No:    ${data.invoice_no}`       : null,
    data.customer_name    ? `👤 客户 Customer:        ${data.customer_name}`    : null,
    data.delivery_address ? `📍 地址 Address:         ${data.delivery_address}` : null,
    '',
    '🔗 司机签字链接 / Driver signing link:',
    signingUrl,
    '',
    '请将此链接发给司机完成签字。签字完成后 PDF 将自动发回此对话。',
    'Share this link with the driver. The signed PDF will be sent back here automatically.',
  ].filter(line => line !== null).join('\n');

  await sendMessage(env, open_id, summary);
}

function buildSelectionCard(emails) {
  const elements = [
    {
      tag: 'div',
      text: {
        tag: 'plain_text',
        content: `找到 ${emails.length} 封相关邮件，请选择要处理的订单：\nFound ${emails.length} matching emails — select an order:`,
      },
    },
    { tag: 'hr' },
  ];

  emails.forEach((email, index) => {
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${index + 1}.** ${email.subject || '（无主题）'}\n📅 ${email.date || ''}\n📧 ${email.from || ''}`,
      },
      extra: {
        tag: 'button',
        text: { tag: 'plain_text', content: `选择 #${index + 1}` },
        type: 'primary',
        value: { action: 'select_email', index, message_id: email.id },
      },
    });
    if (index < emails.length - 1) elements.push({ tag: 'hr' });
  });

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📦 送货订单邮件 / Delivery Order Emails' },
      template: 'blue',
    },
    elements,
  };
}

async function handleRentalTrigger(env, open_id) {
  await sendCard(env, open_id, buildStartCard(env.SIGNING_BASE_URL, open_id));
}

function buildStartCard(signingBaseUrl, open_id) {
  const base = signingBaseUrl ||
    'https://bw1n9s.github.io/djj-signing-platform/app/index.html';
  const q = `?open_id=${encodeURIComponent(open_id)}`;

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: 'DJJ Signing Platform' },
      template: 'blue',
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '点击下方按钮开始签署叉车租赁协议。\nTap the button below to open the Forklift Rental Agreement.',
        },
      },
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '🏗 叉车租赁协议 · Rental Agreement' },
            type: 'primary',
            url: `${base}${q}#/rental`,
          },
        ],
      },
    ],
  };
}

async function handleImageMessage(env, open_id, message) {
  try {
    let imageKey;
    try { imageKey = JSON.parse(message.content)?.image_key; } catch {}
    if (!imageKey) {
      await sendMessage(env, open_id, '无法读取图片，请重试。\nCould not read the image, please try again.');
      return;
    }

    const token = await getTenantAccessToken(env);
    const resp = await fetch(
      `https://open.larksuite.com/open-apis/im/v1/messages/${message.message_id}/resources/${imageKey}?type=image`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!resp.ok) throw new Error(`Image download HTTP ${resp.status}`);

    const buffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const contentType = resp.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${contentType};base64,${base64}`;

    pendingSigs.set(open_id, { dataUrl, expiresAt: Date.now() + SIG_TTL });

    await sendMessage(env, open_id,
      '已收到您的签名图片 ✓\n请回复您的姓名（将显示在签署按钮上）。\n\nGot your signature image ✓\nPlease reply with your name — it will appear on the auto-sign button.'
    );
  } catch (err) {
    console.error('[handleImageMessage]', err.message);
    await sendMessage(env, open_id, `❌ 处理图片失败：${err.message}\nFailed to process image.`);
  }
}

export default router;
