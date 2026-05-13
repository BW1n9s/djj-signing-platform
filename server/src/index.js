// DJJ Signing Platform — Cloudflare Workers 入口 / CF Workers entry point
// 框架: Hono  部署: wrangler deploy（从仓库根目录运行）
// Framework: Hono  Deploy: wrangler deploy (run from repo root)
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import larkRouter from './lark/webhook.js';
import { sendSignedPDF } from './delivery/mailer.js';
import { sendMessage, sendCard } from './lark/client.js';
import { sendPDFToLark } from './lark/sendFile.js';
import { uploadPDFToDrive } from './lark/driveUpload.js';
import { sendSignedCard } from './lark/signedCard.js';

const app = new Hono();

// 全局 CORS（前端静态页需要跨域访问）
// Global CORS — required by the static frontend
app.use('*', cors());

// 挂载 Lark 路由 / Mount Lark routes (/lark/webhook, /lark/card-action)
app.route('/lark', larkRouter);

// POST /delivery/signed
// 前端签字完成后调用：发送 PDF 邮件 + 通过 Lark 通知操作员
// Called by frontend after signing: send PDF email + notify operator via Lark
app.post('/delivery/signed', async (c) => {
  const env = c.env;
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const { to, subject, filename, pdfDataUrl, data, open_id } = body;

  try {
    await sendSignedPDF(env, { to, subject, filename, pdfDataUrl, data });

    if (open_id) {
      const lines = [
        '✅ PDF 已发送至 anita@djjequipment.com.au',
        data?.invoice_no    ? `📄 发票号：${data.invoice_no}`    : null,
        data?.customer_name ? `👤 客户：${data.customer_name}` : null,
      ].filter(Boolean);
      await sendMessage(env, open_id, lines.join('\n'));
    }

    return c.json({ ok: true });
  } catch (err) {
    console.error('[/delivery/signed]', err.message);
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// POST /delivery/pdf-to-lark
// 签字完成后将 PDF 发回操作员的 Lark 对话
// After signing, sends the PDF back to the operator's Lark chat
app.post('/delivery/pdf-to-lark', async (c) => {
  const env = c.env;
  let body;
  try { body = await c.req.json(); } catch { return c.json({ ok: false, error: 'Invalid JSON' }, 400); }
  const { open_id, pdfDataUrl, filename, data } = body;
  if (!open_id || !pdfDataUrl) return c.json({ ok: false, error: 'Missing open_id or pdfDataUrl' }, 400);
  try {
    const commaIdx = pdfDataUrl.indexOf(',');
    const base64 = commaIdx !== -1 ? pdfDataUrl.slice(commaIdx + 1) : pdfDataUrl;
    const caption = [
      '✅ 签字已完成 / Delivery order signed',
      data?.invoice_no    ? `📄 发票号 Invoice: ${data.invoice_no}`    : null,
      data?.customer_name ? `👤 客户 Customer: ${data.customer_name}` : null,
      data?.driver_name   ? `🚛 司机 Driver: ${data.driver_name}`     : null,
    ].filter(Boolean).join('\n');
    await sendPDFToLark(env, { open_id, pdfBase64: base64, filename, caption });
    return c.json({ ok: true });
  } catch (err) {
    console.error('[/delivery/pdf-to-lark]', err.message);
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// POST /signed
// 三种文档通用：上传 PDF 到飞书云盘 + 发卡片给操作员
// kind = 'delivery' | 'dispatch' | 'rental'
app.post('/signed', async (c) => {
  const env = c.env;
  let body;
  try { body = await c.req.json(); } catch { return c.json({ ok: false, error: 'Invalid JSON' }, 400); }

  const { kind, open_id, pdfDataUrl, filename, data } = body;
  if (!open_id || !pdfDataUrl) {
    return c.json({ ok: false, error: 'Missing open_id or pdfDataUrl' }, 400);
  }

  try {
    const commaIdx = pdfDataUrl.indexOf(',');
    const base64 = commaIdx !== -1 ? pdfDataUrl.slice(commaIdx + 1) : pdfDataUrl;
    const file_token = await uploadPDFToDrive(env, { pdfBase64: base64, filename });
    console.log('[/signed] uploaded file_token:', file_token, 'kind:', kind, 'open_id:', open_id);
    // Send card first (notification with metadata), then PDF file directly to chat
    await sendSignedCard(env, { open_id, file_token, kind: kind || 'delivery', data });
    await sendPDFToLark(env, { open_id, pdfBase64: base64, filename, caption: '' });
    return c.json({ ok: true, file_token });
  } catch (err) {
    console.error('[/signed]', err.message);
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// POST /request-sig-card
// Called by the frontend when a rental form opens but the user has no registered signature.
// Sends a Lark card with a registration link. Rate-limited to once per 10 minutes per user.
app.post('/request-sig-card', async (c) => {
  const env = c.env;
  let body;
  try { body = await c.req.json(); } catch { return c.json({ ok: false, error: 'Invalid JSON' }, 400); }
  const { open_id } = body;
  if (!open_id) return c.json({ ok: false, error: 'Missing open_id' }, 400);

  try {
    if (env.SIG_KV) {
      const cooldown = await env.SIG_KV.get(`sig_req:${open_id}`);
      if (cooldown) return c.json({ ok: true, sent: false, reason: 'cooldown' });
    }
    const base = env.SIGNING_BASE_URL || 'https://bw1n9s.github.io/djj-signing-platform/app/index.html';
    const regUrl = `${base}?open_id=${encodeURIComponent(open_id)}#/register-sig`;
    await sendCard(env, open_id, buildSigRequestCard(regUrl));
    if (env.SIG_KV) await env.SIG_KV.put(`sig_req:${open_id}`, '1', { expirationTtl: 600 });
    return c.json({ ok: true, sent: true });
  } catch (err) {
    console.error('[/request-sig-card]', err.message);
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// POST /save-sig
// Called by the #/register-sig page to store a user's personal signature in KV.
app.post('/save-sig', async (c) => {
  const env = c.env;
  let body;
  try { body = await c.req.json(); } catch { return c.json({ ok: false, error: 'Invalid JSON' }, 400); }
  const { open_id, dataUrl, name } = body;
  if (!open_id || !dataUrl || !name) return c.json({ ok: false, error: 'Missing fields' }, 400);
  if (!env.SIG_KV) return c.json({ ok: false, error: 'SIG_KV not configured' }, 503);

  try {
    await env.SIG_KV.put(`sig:${open_id}`, JSON.stringify({ dataUrl, name, savedAt: Date.now() }));
    await env.SIG_KV.delete(`sig_req:${open_id}`);
    return c.json({ ok: true });
  } catch (err) {
    console.error('[/save-sig]', err.message);
    return c.json({ ok: false, error: err.message }, 500);
  }
});

function buildSigRequestCard(regUrl) {
  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '✍️ 请注册您的签名 · Register Your Signature' },
      template: 'blue',
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '您打开了一份租赁协议，但尚未注册个人签名。\n请点击下方按钮完成注册，之后可在表单上一键自动签署。\n\nYou opened a Rental Agreement without a registered signature.\nTap below to register — then you can auto-sign forms with one tap.',
        },
      },
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [{
          tag: 'button',
          text: { tag: 'plain_text', content: '✍️ 注册签名 · Register Signature' },
          type: 'primary',
          url: regUrl,
        }],
      },
    ],
  };
}

// GET /user-sig?open_id=xxx
// Returns the stored personal signature for a user (set by sending an image to the bot)
app.get('/user-sig', async (c) => {
  const open_id = c.req.query('open_id');
  if (!open_id) return c.json({ ok: false, error: 'Missing open_id' }, 400);
  if (!c.env.SIG_KV) return c.json({ ok: true, found: false });
  try {
    const sig = await c.env.SIG_KV.get(`sig:${open_id}`, 'json');
    if (!sig) return c.json({ ok: true, found: false });
    return c.json({ ok: true, found: true, name: sig.name, dataUrl: sig.dataUrl });
  } catch (err) {
    console.error('[/user-sig]', err.message);
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// 健康检查 / Health check
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// CF Workers 标准导出格式 / CF Workers standard export format
export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};
