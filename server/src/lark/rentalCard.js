import { getTenantAccessToken } from './client.js';
import { sendCard } from './client.js';

const LARK_BASE = 'https://open.larksuite.com/open-apis';

export async function sendRentalCard(env, open_id, card) {
  return sendCard(env, open_id, card);
}

export function buildRentalSummaryCard({ data, signingUrl }) {
  const lines = [
    data.agreement_no    ? `📄 协议号 Agreement: ${data.agreement_no}`     : null,
    data.customer_name   ? `👤 客户 Customer: ${data.customer_name}`       : null,
    data.lessor_name     ? `🏢 出租方 Lessor: ${data.lessor_name}`         : null,
  ].filter(Boolean).join('\n');

  return {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '🏗 叉车租赁协议 · Rental Agreement' },
      template: 'blue',
    },
    elements: [
      { tag: 'div', text: { tag: 'lark_md', content: lines || '请填写租赁协议信息。' } },
      { tag: 'hr' },
      {
        tag: 'action',
        actions: [
          {
            tag: 'button',
            text: { tag: 'plain_text', content: '✍️ 前往签字 · Sign Now' },
            type: 'primary',
            url: signingUrl,
          },
        ],
      },
    ],
  };
}
