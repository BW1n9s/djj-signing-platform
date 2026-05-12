// Gmail OAuth2 配置 / Gmail OAuth2 configuration
// 所有凭据从环境变量读取，不硬编码 / All credentials from env vars, never hardcoded
'use strict';

const { google } = require('googleapis');

/**
 * 创建 OAuth2 客户端并注入 refresh_token
 * Create an OAuth2 client with refresh_token credentials
 */
function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
  );

  client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  return client;
}

module.exports = { getOAuth2Client };
