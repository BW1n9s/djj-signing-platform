// Lark Webhook 处理器 / Lark webhook handler
// POST /lark/webhook — 处理 URL 验证、消息事件、卡片回调
// Handles URL verification, message events, and card action callbacks
'use strict';

const express = require('express');
const router = express.Router();

const { sendMessage, sendCard } = require('./client');
const { searchDeliveryEmails, parseEmailToDeliveryData } = require('../gmail/search');
const { buildDriverSigningUrl } = require('../delivery/buildLink');

// 等待用户选择邮件的内存状态表
// In-memory table for pending email selections
// key: open_id  value: { emails: [...], createdAt: number }
const pendingSelections = new Map();

// POST /lark/webhook
// 飞书要求：即使处理出错也必须返回 200，否则会重复推送
// Lark requires 200 even on errors, or it will retry delivery
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    // --- URL 验证 (challenge) / URL verification ---
    // v1 格式 / v1 format
    if (body.type === 'url_verification') {
      return res.json({ challenge: body.challenge });
    }
    // v2 格式 / v2 format
    if (body.schema === '2.0' && body.header?.event_type === 'url_verification') {
      return res.json({ challenge: body.event?.challenge });
    }

    // --- Verification Token 校验 / Token validation ---
    const token = body.token ?? body.header?.token;
    if (process.env.LARK_VERIFICATION_TOKEN && token !== process.env.LARK_VERIFICATION_TOKEN) {
      console.warn('[webhook] Verification token mismatch — request ignored');
      return res.status(200).json({ ok: false });
    }

    // 先返回 200，再异步处理事件，避免超时触发重试
    // Return 200 immediately, then process async to avoid timeout retries
    res.json({ ok: true });
    await handleEvent(body);
  } catch (err) {
    console.error('[webhook] Unhandled error:', err.message);
    // 如果还没发送响应，补发 200 / Send 200 if not already sent
    if (!res.headersSent) res.json({ ok: true });
  }
});

// POST /lark/card-action
// 处理卡片按钮点击回调（需在飞书后台配置 Card Request URL）
// Handles card button click callbacks (configure Card Request URL in Lark console)
router.post('/card-action', async (req, res) => {
  // 飞书卡片回调要求立即返回，可带 toast 提示
  // Lark card callback requires immediate response; optional toast message
  res.json({ toast: { type: 'info', content: '处理中… / Processing…' } });

  try {
    const body = req.body;
    const action = body.action;
    // 不同飞书版本 open_id 位置不同 / open_id location varies by Lark version
    const open_id =
      body.open_id ??
      body.user_info?.open_id ??
      body.operator?.open_id;

    if (!open_id || action?.value?.action !== 'select_email') return;

    const { index } = action.value;
    const state = pendingSelections.get(open_id);

    if (!state) {
      await sendMessage(open_id, '会话已过期，请重新发送消息触发搜索。\nSession expired — please send a new message to search again.');
      return;
    }

    const email = state.emails[parseInt(index, 10)];
    if (!email) {
      await sendMessage(open_id, '选择无效，请重试。\nInvalid selection — please try again.');
      return;
    }

    pendingSelections.delete(open_id);
    await processSelectedEmail(open_id, email);
  } catch (err) {
    console.error('[card-action]', err.message);
  }
});

// ─── 私有函数 / Private functions ────────────────────────────────────────────

async function handleEvent(body) {
  // 解析事件类型和数据，兼容 v1 / v2 格式
  // Parse event type and data, compatible with v1 and v2 formats
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

  // 解析消息文本 / Parse message text
  let text = '';
  try {
    text = JSON.parse(message.content)?.text ?? '';
  } catch {
    return;
  }

  const lower = text.toLowerCase();
  const isDeliveryTrigger = /delivery|送货|order|签字|picking|booking|confirmation/.test(lower);

  if (!isDeliveryTrigger) {
    await sendMessage(open_id, HELP_TEXT);
    return;
  }

  await sendMessage(open_id, '正在搜索邮件，请稍候…\nSearching emails, please wait…');

  let emails;
  try {
    emails = await searchDeliveryEmails();
  } catch (err) {
    console.error('[handleEvent] Gmail search error:', err.message);
    await sendMessage(open_id, `❌ Gmail 搜索失败：${err.message}\n请检查 Gmail OAuth2 配置是否正确。`);
    return;
  }

  if (!emails || emails.length === 0) {
    await sendMessage(open_id, '未找到最近 30 天内的送货相关邮件。\nNo delivery-related emails found in the last 30 days.');
    return;
  }

  if (emails.length === 1) {
    await processSelectedEmail(open_id, emails[0]);
    return;
  }

  // 多封邮件：发送选择卡片（最多显示 5 封）
  // Multiple emails: send selection card (up to 5 shown)
  const topEmails = emails.slice(0, 5);
  pendingSelections.set(open_id, { emails: topEmails, createdAt: Date.now() });

  // 30 分钟后自动清理，防止内存泄漏 / Auto-clean after 30 min to prevent memory leaks
  setTimeout(() => pendingSelections.delete(open_id), 30 * 60 * 1000);

  await sendCard(open_id, buildSelectionCard(topEmails));
}

async function processSelectedEmail(open_id, email) {
  let data;
  try {
    data = await parseEmailToDeliveryData(email);
  } catch (err) {
    console.error('[processSelectedEmail] Parse error:', err.message);
    await sendMessage(open_id, `❌ 邮件解析失败：${err.message}`);
    return;
  }

  const signingUrl = buildDriverSigningUrl(data);

  const summary = [
    '✅ 已提取送货信息 / Delivery info extracted:',
    data.invoice_no     ? `📄 发票号 Invoice No:    ${data.invoice_no}`     : null,
    data.customer_name  ? `👤 客户 Customer:        ${data.customer_name}`  : null,
    data.delivery_address ? `📍 地址 Address:        ${data.delivery_address}` : null,
    '',
    '🔗 司机签字链接 / Driver signing link:',
    signingUrl,
    '',
    '请将此链接发给司机完成签字。签字完成后 PDF 将自动发送至 anita@djjequipment.com.au',
    'Share this link with the driver to complete signing. The PDF will be emailed to Anita automatically.'
  ].filter(line => line !== null).join('\n');

  await sendMessage(open_id, summary);
}

function buildSelectionCard(emails) {
  const elements = [
    {
      tag: 'div',
      text: {
        tag: 'plain_text',
        content: `找到 ${emails.length} 封相关邮件，请选择要处理的订单：\nFound ${emails.length} matching emails — select an order to process:`
      }
    },
    { tag: 'hr' }
  ];

  emails.forEach((email, index) => {
    elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `**${index + 1}.** ${email.subject || '（无主题）'}\n📅 ${email.date || ''}\n📧 ${email.from || ''}`
      },
      extra: {
        tag: 'button',
        text: { tag: 'plain_text', content: `选择 #${index + 1}` },
        type: 'primary',
        value: { action: 'select_email', index, message_id: email.id }
      }
    });
    if (index < emails.length - 1) elements.push({ tag: 'hr' });
  });

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '📦 送货订单邮件 / Delivery Order Emails' },
      template: 'blue'
    },
    elements
  };
}

const HELP_TEXT = `你好！我可以帮你搜索送货订单并生成司机签字链接。

发送包含以下关键词的消息即可触发 / Send a message with any of these keywords:
• delivery / 送货
• order / 订单
• 签字
• picking / booking / confirmation`;

module.exports = router;
