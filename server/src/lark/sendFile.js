import { getTenantAccessToken } from './client.js';

const LARK_BASE = 'https://open.feishu.cn/open-apis';

export async function sendPDFToLark(env, { open_id, pdfBase64, filename, caption }) {
  const token = await getTenantAccessToken(env);

  const binaryStr = atob(pdfBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

  const form = new FormData();
  form.append('file_type', 'pdf');
  form.append('file_name', filename);
  form.append('file', new Blob([bytes], { type: 'application/pdf' }), filename);

  const uploadResp = await fetch(`${LARK_BASE}/im/v1/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const uploadData = await uploadResp.json();
  if (uploadData.code !== 0) throw new Error(`[Lark] File upload failed: ${uploadData.msg}`);
  const file_key = uploadData.data.file_key;

  const msgResp = await fetch(`${LARK_BASE}/im/v1/messages?receive_id_type=open_id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receive_id: open_id,
      msg_type: 'file',
      content: JSON.stringify({ file_key }),
    }),
  });
  const msgData = await msgResp.json();
  if (msgData.code !== 0) throw new Error(`[Lark] Send file failed: ${msgData.msg}`);

  if (caption) {
    await fetch(`${LARK_BASE}/im/v1/messages?receive_id_type=open_id`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receive_id: open_id,
        msg_type: 'text',
        content: JSON.stringify({ text: caption }),
      }),
    });
  }

  return file_key;
}
