// Lark API 客户端 / Lark API client
// 直接调用飞书开放平台 REST API（全局 fetch，无第三方库）
// Uses the global fetch API — no third-party dependencies
'use strict';

const LARK_BASE = 'https://open.feishu.cn/open-apis';

// 模块级 token 缓存（同一 Worker 实例内有效，跨实例不共享）
// Module-level token cache — persists within one Worker instance only
// 每次使用前都检查 expiry，过期则重新获取
// Expiry is always checked before use; expired tokens are refreshed
let tokenCache = { token: null, expiresAt: 0 };

/**
 * 获取 tenant_access_token，过期前 5 分钟自动刷新
 * Get tenant_access_token, auto-refresh 5 minutes before expiry
 * @param {object} env  CF Workers env bindings（含 LARK_APP_ID, LARK_APP_SECRET）
 */
export async function getTenantAccessToken(env) {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expiresAt - 5 * 60_000) {
    return tokenCache.token;
  }

  const resp = await fetch(`${LARK_BASE}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: env.LARK_APP_ID,
      app_secret: env.LARK_APP_SECRET,
    }),
  });

  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`[Lark] getTenantAccessToken failed: ${data.msg}`);
  }

  tokenCache.token = data.tenant_access_token;
  // expire 字段单位为秒 / expire field is in seconds
  tokenCache.expiresAt = now + data.expire * 1_000;
  return tokenCache.token;
}

/**
 * 向用户发送纯文本消息 / Send a plain-text message to a user
 * @param {object} env     CF Workers env bindings
 * @param {string} open_id 飞书用户 open_id
 * @param {string} text    消息文本
 */
export async function sendMessage(env, open_id, text) {
  const token = await getTenantAccessToken(env);

  const resp = await fetch(`${LARK_BASE}/im/v1/messages?receive_id_type=open_id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receive_id: open_id,
      msg_type: 'text',
      content: JSON.stringify({ text }),
    }),
  });

  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`[Lark] sendMessage failed: ${data.msg}`);
  }
  return data;
}

/**
 * 向用户发送交互式消息卡片 / Send an interactive card to a user
 * @param {object} env     CF Workers env bindings
 * @param {string} open_id 飞书用户 open_id
 * @param {object} card    飞书卡片 JSON 对象
 */
export async function sendCard(env, open_id, card) {
  const token = await getTenantAccessToken(env);

  const resp = await fetch(`${LARK_BASE}/im/v1/messages?receive_id_type=open_id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      receive_id: open_id,
      msg_type: 'interactive',
      content: JSON.stringify(card),
    }),
  });

  const data = await resp.json();
  if (data.code !== 0) {
    throw new Error(`[Lark] sendCard failed: ${data.msg}`);
  }
  return data;
}
