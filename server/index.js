// DJJ Signing Platform — Express 入口 / Express entry point
'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// PDF payload 可以很大，设置 50MB 限制 / PDF payloads can be large
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const larkRouter = require('./lark/webhook');
const { sendSignedPDF } = require('./delivery/mailer');
const { sendMessage } = require('./lark/client');

// 挂载 Lark 路由 / Mount Lark routes
app.use('/lark', larkRouter);

// POST /delivery/signed
// 前端签字完成后调用此接口，发送 PDF 邮件并通知操作员
// Called by the frontend after signing; sends PDF email and notifies the operator
app.post('/delivery/signed', async (req, res) => {
  const { to, subject, filename, pdfDataUrl, data, open_id } = req.body;

  try {
    await sendSignedPDF({ to, subject, filename, pdfDataUrl, data });

    if (open_id) {
      const notify = [
        '✅ PDF 已发送至 anita@djjequipment.com.au',
        data?.invoice_no ? `📄 发票号：${data.invoice_no}` : null,
        data?.customer_name ? `👤 客户：${data.customer_name}` : null
      ].filter(Boolean).join('\n');
      await sendMessage(open_id, notify);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[/delivery/signed]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 健康检查 / Health check
app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => console.log(`[server] Listening on port ${PORT}`));
