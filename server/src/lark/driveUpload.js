import { getTenantAccessToken } from './client.js';

const LARK_BASE = 'https://open.larksuite.com/open-apis';

export function driveFileUrl(file_token) {
  return `https://applink.larksuite.com/client/drive/open?token=${file_token}&type=file`;
}

export async function uploadPDFToDrive(env, { pdfBase64, filename }) {
  const binaryStr = atob(pdfBase64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
  return uploadFileToDrive(env, { filename, mimeType: 'application/pdf', bytes });
}

export async function uploadFileToDrive(env, { filename, mimeType, bytes }) {
  const token = await getTenantAccessToken(env);

  const form = new FormData();
  form.append('file_name', filename);
  form.append('parent_type', 'explorer');
  // No parent_node — always upload to bot's own My Space
  form.append('size', String(bytes.length));
  form.append('file', new Blob([bytes], { type: mimeType }), filename);

  const resp = await fetch(`${LARK_BASE}/drive/v1/files/upload_all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await resp.json();
  if (data.code !== 0) throw new Error(`[Lark Drive] Upload failed (${data.code}): ${data.msg}`);
  return data.data.file_token;
}

export async function grantDriveAccess(env, { file_token, open_id }) {
  const token = await getTenantAccessToken(env);
  const resp = await fetch(
    `${LARK_BASE}/drive/v1/permissions/${file_token}/members?type=file`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_type: 'openid', member_id: open_id, perm: 'full_access' }),
    }
  );
  const data = await resp.json();
  // Log always so Cloudflare surfaces the result regardless of success/failure
  console.log(`[Lark Drive] grantDriveAccess code=${data.code} msg=${data.msg ?? 'ok'} file=${file_token} user=${open_id}`);
}
