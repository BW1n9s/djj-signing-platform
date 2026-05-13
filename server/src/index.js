// DJJ Signing Platform — Cloudflare Workers 入口 / CF Workers entry point
// 框架: Hono  部署: wrangler deploy（从仓库根目录运行）
// Framework: Hono  Deploy: wrangler deploy (run from repo root)
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import larkRouter from './lark/webhook.js';
import { sendSignedPDF } from './delivery/mailer.js';
import { sendMessage } from './lark/client.js';
import { sendPDFToLark } from './lark/sendFile.js';

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
    const base64 = pdfDataUrl.replace(/^data:application\/pdf;base64,/, '');
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

// 健康检查 / Health check
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// CF Workers 标准导出格式 / CF Workers standard export format
export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};
