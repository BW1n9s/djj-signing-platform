import { getTenantAccessToken } from './client.js';

const LARK_BASE = 'https://open.larksuite.com/open-apis';

export function driveFileUrl(file_token) {
  return `https://applink.larksuite.com/client/drive/open?token=${file_token}&type=file`;
}

export async function uploadFileToDrive(env, { filename, mimeType, bytes, folderToken }) {
  const token = await getTenantAccessToken(env);

  const form = new FormData();
  form.append('file_name', filename);
  form.append('parent_type', 'explorer');
  if (folderToken) form.append('parent_node', folderToken);
  form.append('size', String(bytes.length));
  form.append('file', new Blob([bytes], { type: mimeType }), filename);

  const resp = await fetch(`${LARK_BASE}/drive/v1/files/upload_all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await resp.json();
  if (data.code !== 0) throw new Error(`[Lark Drive] Upload failed: ${data.msg}`);
  return data.data.file_token;
}
