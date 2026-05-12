// Gmail OAuth2 访问令牌管理 / Gmail OAuth2 access token management
// 用 refresh_token 换取 access_token，替代 googleapis 包
// Exchanges refresh_token for access_token using raw fetch — no googleapis package needed

// 模块级 token 缓存（同一 Worker 实例内有效）
// Module-level cache — valid within one Worker instance
let gmailTokenCache = { token: null, expiresAt: 0 };

/**
 * 获取 Gmail API access_token
 * 过期前 1 分钟自动刷新；所有凭据从 env 读取，从不硬编码
 *
 * Get a Gmail API access_token.
 * Auto-refreshes 1 minute before expiry; all credentials from env, never hardcoded.
 *
 * @param {object} env  CF Workers env bindings
 * @returns {Promise<string>} access_token
 */
export async function getGmailAccessToken(env) {
  const now = Date.now();
  if (gmailTokenCache.token && now < gmailTokenCache.expiresAt - 60_000) {
    return gmailTokenCache.token;
  }

  const body = new URLSearchParams({
    client_id: env.GMAIL_CLIENT_ID,
    client_secret: env.GMAIL_CLIENT_SECRET,
    refresh_token: env.GMAIL_REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`[Gmail] Token refresh failed (${resp.status}): ${text}`);
  }

  const data = await resp.json();
  gmailTokenCache.token = data.access_token;
  // expires_in 单位为秒 / expires_in is in seconds; default 3600 if absent
  gmailTokenCache.expiresAt = now + (data.expires_in ?? 3_600) * 1_000;
  return gmailTokenCache.token;
}
