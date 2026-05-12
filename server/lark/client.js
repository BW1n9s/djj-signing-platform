// Lark API 客户端 / Lark API client
// 直接调用飞书开放平台 REST API，不依赖第三方 SDK
// Calls Feishu/Lark Open Platform REST API directly without third-party SDKs
'use strict';

const axios = require('axios');

const LARK_BASE = 'https://open.feishu.cn/open-apis';

// Token 内存缓存 / In-memory token cache
const tokenCache = { token: null, expiresAt: 0 };

/**
 * 获取 tenant_access_token，过期前 5 分钟自动刷新
 * Get tenant_access_token, auto-refresh 5 minutes before expiry
 */
async function getTenantAccessToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt - 5 * 60 * 1000) {
    return tokenCache.token;
  }

  const resp = await axios.post(
    `${LARK_BASE}/auth/v3/tenant_access_token/internal`,
    {
      app_id: process.env.LARK_APP_ID,
      app_secret: process.env.LARK_APP_SECRET
    }
  );

  if (resp.data.code !== 0) {
    throw new Error(`[Lark] getTenantAccessToken failed: ${resp.data.msg}`);
  }

  tokenCache.token = resp.data.tenant_access_token;
  // expire 字段单位为秒 / expire field is in seconds
  tokenCache.expiresAt = now + resp.data.expire * 1000;
  return tokenCache.token;
}

/**
 * 向用户发送纯文本消息 / Send a plain-text message to a user
 * @param {string} open_id  Lark 用户 open_id
 * @param {string} text     消息内容
 */
async function sendMessage(open_id, text) {
  const token = await getTenantAccessToken();

  const resp = await axios.post(
    `${LARK_BASE}/im/v1/messages?receive_id_type=open_id`,
    {
      receive_id: open_id,
      msg_type: 'text',
      content: JSON.stringify({ text })
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (resp.data.code !== 0) {
    throw new Error(`[Lark] sendMessage failed: ${resp.data.msg}`);
  }
  return resp.data;
}

/**
 * 向用户发送交互式消息卡片 / Send an interactive card to a user
 * @param {string} open_id  Lark 用户 open_id
 * @param {object} card     飞书卡片 JSON 对象
 */
async function sendCard(open_id, card) {
  const token = await getTenantAccessToken();

  const resp = await axios.post(
    `${LARK_BASE}/im/v1/messages?receive_id_type=open_id`,
    {
      receive_id: open_id,
      msg_type: 'interactive',
      content: JSON.stringify(card)
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (resp.data.code !== 0) {
    throw new Error(`[Lark] sendCard failed: ${resp.data.msg}`);
  }
  return resp.data;
}

module.exports = { getTenantAccessToken, sendMessage, sendCard };
