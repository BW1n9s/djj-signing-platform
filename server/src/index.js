// DJJ Signing Platform — Cloudflare Workers 入口 / CF Workers entry point
// 框架: Hono  部署: wrangler deploy（从仓库根目录运行）
// Framework: Hono  Deploy: wrangler deploy (run from repo root)
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import larkRouter from './lark/webhook.js';
import { sendSignedPDF } from './delivery/mailer.js';
import { sendMessage } from './lark/client.js';

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

// 健康检查 / Health check
app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

// CF Workers 标准导出格式 / CF Workers standard export format
export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
};
