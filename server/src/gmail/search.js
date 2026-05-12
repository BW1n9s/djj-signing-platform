// Gmail 邮件搜索与解析 / Gmail email search and parsing
// 直接调用 Gmail REST API（fetch），替代 googleapis 包
// Uses Gmail REST API via fetch — no googleapis package needed
import { getGmailAccessToken } from './auth.js';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users';
const userId = (env) => encodeURIComponent(env.GMAIL_USER || 'me');

/**
 * 搜索最近 30 天内的送货相关邮件
 * 搜索主题含 "picking list" / "booking confirmation" / "delivery order"
 * 按时间倒序，最多返回 10 封
 *
 * Search delivery-related emails (last 30 days, newest first, max 10).
 * @param {object} env  CF Workers env bindings
 */
export async function searchDeliveryEmails(env) {
  const token = await getGmailAccessToken(env);
  const uid = userId(env);

  // 计算 30 天前的日期（Gmail query 格式 YYYY/MM/DD）
  // 30 days ago in Gmail query format YYYY/MM/DD
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const afterDate = since.toISOString().slice(0, 10).replace(/-/g, '/');

  const q = encodeURIComponent(
    `subject:("picking list" OR "booking confirmation" OR "delivery order") after:${afterDate}`
  );

  // GET /messages — 列出匹配邮件 ID / List matching message IDs
  const listResp = await fetch(
    `${GMAIL_API}/${uid}/messages?q=${q}&maxResults=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!listResp.ok) {
    const text = await listResp.text();
    throw new Error(`[Gmail] List messages failed (${listResp.status}): ${text}`);
  }

  const listData = await listResp.json();
  const messages = listData.messages ?? [];
  if (messages.length === 0) return [];

  // GET /messages/{id} — 并发拉取完整邮件 / Fetch full messages concurrently
  const emails = await Promise.all(
    messages.map(async (msg) => {
      const r = await fetch(
        `${GMAIL_API}/${uid}/messages/${msg.id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!r.ok) return null;
      return r.json();
    })
  );

  // 转换为统一格式，按时间倒序 / Normalise and sort newest first
  return emails
    .filter(Boolean)
    .map((email) => {
      const headers = email.payload?.headers ?? [];
      const h = (name) => headers.find((x) => x.name.toLowerCase() === name)?.value ?? '';
      return {
        id: email.id,
        threadId: email.threadId,
        subject: h('subject'),
        from: h('from'),
        date: h('date'),
        snippet: email.snippet,
        payload: email.payload,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * 从邮件内容中提取送货数据字段（尽力匹配，缺少则留空字符串）
 * Extract delivery data from email content (best-effort; missing fields stay empty string)
 * @param {object} email  searchDeliveryEmails() 返回的邮件对象
 */
export async function parseEmailToDeliveryData(email) {
  const data = {
    invoice_no: '',
    invoice_date: '',
    customer_name: '',
    customer_abn: '',
    delivery_address: '',
    delivery_contact: '',
    delivery_phone: '',
    delivery_email: '',
    transport_company: '',
    pickup_location: '',
    sales_rep: '',
    delivery_items: [],
  };

  const bodyText = extractBodyText(email.payload);
  if (!bodyText) return data;

  // 各字段正则映射 / Regex map per field
  const patterns = {
    invoice_no:        /invoice\s*(?:no|number|#)[:\s#]+([A-Z0-9\-]+)/i,
    invoice_date:      /(?:invoice[\s_-]*date|inv[\s_-]*date)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    customer_name:     /(?:customer|company|bill[\s_-]*to|client|sold[\s_-]*to)[:\s]+([^\n\r,]{2,60})/i,
    customer_abn:      /abn[:\s]+([\d\s]{9,14})/i,
    delivery_address:  /(?:delivery[\s_-]*address|ship[\s_-]*to|deliver[\s_-]*to)[:\s]+([^\n\r]{5,100})/i,
    delivery_contact:  /(?:delivery[\s_-]*contact|contact[\s_-]*name|attn)[:\s]+([^\n\r]{2,50})/i,
    delivery_phone:    /(?:phone|tel|mobile|ph)[:\s]+([\d\s\+\-\(\)]{8,20})/i,
    delivery_email:    /(?:email)[:\s]+([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
    transport_company: /(?:transport|carrier|freight|trucking|haulage)[:\s]+([^\n\r]{2,60})/i,
    pickup_location:   /(?:pickup|pick[\s\-]up|collect[\s_-]*from|from warehouse)[:\s]+([^\n\r]{2,80})/i,
    sales_rep:         /(?:sales[\s_-]*rep|salesperson|account[\s_-]*manager|prepared[\s_-]*by|rep)[:\s]+([^\n\r]{2,50})/i,
  };

  for (const [field, pattern] of Object.entries(patterns)) {
    const match = bodyText.match(pattern);
    if (match) data[field] = match[1].trim();
  }

  data.delivery_items = parseItems(bodyText);
  return data;
}

// ─── 辅助函数 / Helpers ───────────────────────────────────────────────────────

/**
 * 从 MIME payload 递归提取纯文本正文（优先 text/plain，回退 text/html）
 * Recursively extract plain text from MIME payload (prefers text/plain, falls back to text/html)
 */
function extractBodyText(payload) {
  if (!payload) return '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  if (payload.mimeType === 'text/html' && payload.body?.data) {
    const html = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    // 简单去除 HTML 标签和多余空白 / Strip tags and collapse whitespace
    return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
  }

  if (payload.parts?.length) {
    const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
    if (textPart) return extractBodyText(textPart);

    const htmlPart = payload.parts.find((p) => p.mimeType === 'text/html');
    if (htmlPart) return extractBodyText(htmlPart);

    for (const part of payload.parts) {
      const text = extractBodyText(part);
      if (text) return text;
    }
  }

  return '';
}

/**
 * 尝试从正文文本中解析货物列表
 * Try to extract a list of delivery items from body text
 * 匹配 "3 x Widget XL" 或 "Qty: 2  Description: Chair" 格式
 */
function parseItems(text) {
  const items = [];
  for (const line of text.split(/[\n\r]+/)) {
    const qtyX = line.match(/(\d+)\s*[xX×]\s+(.+)/);
    if (qtyX) {
      items.push({ quantity: parseInt(qtyX[1], 10), description: qtyX[2].trim() });
      continue;
    }
    const qtyDesc = line.match(/qty[:\s]+(\d+)\s+(?:desc(?:ription)?[:\s]+)?(.+)/i);
    if (qtyDesc) {
      items.push({ quantity: parseInt(qtyDesc[1], 10), description: qtyDesc[2].trim() });
    }
  }
  return items;
}
