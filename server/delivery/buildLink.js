// 构建司机签字预填 URL / Build pre-filled driver signing URL
'use strict';

const DEFAULT_BASE =
  'https://bw1n9s.github.io/djj-signing-platform/app/index.html';

/**
 * 将送货数据拼装成带 query params 的签字页面链接
 * Assemble delivery data into a signing page URL with query params
 *
 * @param {object} data     解析出的送货字段 / Parsed delivery fields
 * @param {string} [baseUrl] 可覆盖环境变量的基础 URL / Optional base URL override
 * @returns {string} 完整签字 URL / Full signing URL
 */
function buildDriverSigningUrl(data, baseUrl) {
  const base =
    baseUrl ||
    process.env.SIGNING_BASE_URL ||
    DEFAULT_BASE;

  const params = new URLSearchParams();

  // 标量字段映射 / Scalar field map
  const scalarFields = [
    'invoice_no',
    'invoice_date',
    'sales_rep',
    'pickup_location',
    'customer_name',
    'customer_abn',
    'delivery_address',
    'delivery_contact',
    'delivery_phone',
    'delivery_email',
    'transport_company',
    'transport_contact',
    'transport_phone',
    'transport_email'
  ];

  for (const key of scalarFields) {
    const value = data[key];
    if (value && String(value).trim()) {
      params.set(key, String(value).trim());
    }
  }

  // 货物列表 JSON 编码 / Encode delivery items as JSON
  if (Array.isArray(data.delivery_items) && data.delivery_items.length > 0) {
    params.set('delivery_items', JSON.stringify(data.delivery_items));
  }

  return `${base}?${params.toString()}#/delivery`;
}

module.exports = { buildDriverSigningUrl };
