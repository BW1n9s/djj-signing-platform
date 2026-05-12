// 发送签字后 PDF 邮件 / Send signed PDF email via Gmail API
'use strict';

const { google } = require('googleapis');
const { getOAuth2Client } = require('../gmail/auth');

const DEFAULT_TO = 'anita@djjequipment.com.au';
const GMAIL_USER = () => process.env.GMAIL_USER || 'me';

/**
 * 通过 Gmail API 发送签字后的 PDF 邮件
 * Send signed PDF via Gmail API
 *
 * @param {object} opts
 * @param {string} [opts.to]         收件人（默认 anita@djjequipment.com.au）
 * @param {string} [opts.subject]    邮件主题
 * @param {string} [opts.filename]   PDF 文件名
 * @param {string}  opts.pdfDataUrl  base64 data URL（data:application/pdf;base64,...）
 * @param {object} [opts.data]       签字表单数据，用于正文摘要
 */
async function sendSignedPDF({ to, subject, filename, pdfDataUrl, data }) {
  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: 'v1', auth });

  const recipient = to || DEFAULT_TO;
  const emailSubject = subject || buildSubject(data);
  const pdfFilename = filename || `delivery-order-${data?.invoice_no || Date.now()}.pdf`;

  // 澳大利亚东部时间签字时间 / Signing timestamp in Australian Eastern Time
  const signedAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

  // 将 data URL 中的 base64 部分转换为 Buffer / Strip data URL prefix and decode base64
  const base64Data = pdfDataUrl.replace(/^data:application\/pdf;base64,/, '');
  const pdfBuffer = Buffer.from(base64Data, 'base64');

  // RFC 2822 邮件正文 / RFC 2822 email body
  const bodyText = [
    'Dear Anita,',
    '',
    'Please find the signed delivery order attached.',
    '',
    `Invoice No:        ${data?.invoice_no || 'N/A'}`,
    `Customer:          ${data?.customer_name || 'N/A'}`,
    `Delivery Address:  ${data?.delivery_address || 'N/A'}`,
    `Driver Name:       ${data?.driver_name || 'N/A'}`,
    `Signed At:         ${signedAt} (AEST)`,
    '',
    'This email was sent automatically by the DJJ Signing Platform.',
    '',
    'Regards,',
    'DJJ Equipment Signing System'
  ].join('\n');

  // 构建 multipart/mixed MIME 邮件 / Build multipart/mixed MIME message
  const boundary = `djj_${Date.now()}_boundary`;

  const rawParts = [
    `To: ${recipient}`,
    `Subject: ${emailSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
    '',
    `--${boundary}`,
    `Content-Type: application/pdf; name="${pdfFilename}"`,
    'Content-Transfer-Encoding: base64',
    `Content-Disposition: attachment; filename="${pdfFilename}"`,
    '',
    // 每 76 字符换行，符合 MIME 规范 / Wrap at 76 chars per MIME spec
    pdfBuffer.toString('base64').replace(/(.{76})/g, '$1\n').trimEnd(),
    '',
    `--${boundary}--`
  ];

  const rawEmail = rawParts.join('\n');

  // Gmail API 要求 URL-safe base64 编码 / Gmail API requires URL-safe base64
  const encodedEmail = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: GMAIL_USER(),
    requestBody: { raw: encodedEmail }
  });

  console.log(`[mailer] PDF sent to ${recipient} — ${emailSubject}`);
}

function buildSubject(data) {
  const parts = ['Signed Delivery Order'];
  if (data?.invoice_no) parts.push(`– Invoice ${data.invoice_no}`);
  if (data?.customer_name) parts.push(`– ${data.customer_name}`);
  return parts.join(' ');
}

module.exports = { sendSignedPDF };
