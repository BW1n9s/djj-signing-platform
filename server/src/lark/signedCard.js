import { getTenantAccessToken } from './client.js';
import { driveFileUrl, grantDriveAccess } from './driveUpload.js';

const LARK_BASE = 'https://open.larksuite.com/open-apis';

const KIND_META = {
  delivery: {
    title: '✅ 送货签收单已签署 · Delivery Order Signed',
    color: 'turquoise',
    fields: (d) => [
      { label: '发票号 Invoice', value: d?.invoice_no },
      { label: '客户 Customer',  value: d?.customer_name },
      { label: '司机 Driver',    value: d?.driver_name },
      { label: '车牌 Rego',      value: d?.vehicle_rego },
    ],
  },
  dispatch: {
    title: '✅ 发货报告已签署 · Dispatch Report Signed',
    color: 'orange',
    fields: (d) => [
      { label: '报告编号 Report', value: d?.report_no },
      { label: '司机 Driver',     value: d?.driver },
      { label: '设备型号 Model',   value: d?.model },
      { label: '车牌 Rego',       value: d?.rego },
    ],
  },
  rental: {
    title: '✅ 租赁协议已签署 · Rental Agreement Signed',
    color: 'green',
    fields: (d) => [
      { label: '协议编号 Agreement', value: d?.agreement_no },
      { label: '承租方 Lessee',      value: d?.lessee_company },
      { label: '联系人 Contact',     value: d?.contact_name },
      { label: '起租 Start',         value: d?.start },
    ],
  },
};

export async function sendSignedCard(env, { open_id, file_token, kind, data }) {
  await grantDriveAccess(env, { file_token, open_id });
  const token = await getTenantAccessToken(env);
  const meta = KIND_META[kind] || KIND_META.delivery;
  const fileUrl = driveFileUrl(file_token);
  const signedAt = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' });

  const pairs = meta.fields(data).filter(f => f.value);
  const fields = pairs.map(f => ({
    is_short: true,
    text: { tag: 'lark_md', content: `**${f.label}**\n${f.value}` },
  }));
  fields.push({
    is_short: true,
    text: { tag: 'lark_md', content: `**签署时间 Signed at**\n${signedAt} (AEST)` },
  });

  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: meta.title },
      template: meta.color,
    },
    elements: [
      { tag: 'div', fields },
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '📄 查看签字版 PDF · Open Signed PDF' },
            type: 'primary',
            url: fileUrl,
          },
        ],
      },
      {
        tag: 'note',
        elements: [{
          tag: 'plain_text',
          content: '文件已保存至飞书云盘，您有完整管理权限（可复制、下载）。\nSaved to Lark Drive — full access including copy & download.',
        }],
      },
    ],
  };

  const resp = await fetch(
    `${LARK_BASE}/im/v1/messages?receive_id_type=open_id`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receive_id: open_id,
        msg_type: 'interactive',
        content: JSON.stringify(card),
      }),
    }
  );
  const result = await resp.json();
  if (result.code !== 0) throw new Error(`[Lark] Send card failed: ${result.msg}`);
  return result;
}
