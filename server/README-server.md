# DJJ Signing Platform — Server

Lark Bot 后端服务，运行在 **Cloudflare Workers**，使用 **Hono** 框架。  
Lark Bot backend running on **Cloudflare Workers** with the **Hono** framework.

---

## 目录 / Contents

- [架构说明](#架构说明)
- [本地开发](#本地开发)
- [Cloudflare Workers 部署](#cloudflare-workers-部署)
- [环境变量获取指南](#环境变量获取指南)
- [Lark 后台配置](#lark-后台配置)
- [前端 DeliveryOrderMailer 桥接配置](#前端-deliveryordermailerbridgeconfig)

---

## 架构说明

```
POST /lark/webhook       ← 飞书事件订阅 Webhook（消息接收 + URL 验证）
POST /lark/card-action   ← 飞书卡片按钮回调（Card Request URL）
POST /delivery/signed    ← 前端签字完成后发送 PDF 的接口
GET  /health             ← 健康检查
```

**文件结构 / File structure:**
```
wrangler.toml              ← 部署配置（repo 根目录）
server/
  src/
    index.js               ← Hono 应用入口 + CF Workers export default
    lark/
      client.js            ← getTenantAccessToken / sendMessage / sendCard
      webhook.js           ← POST /lark/webhook + /lark/card-action
    gmail/
      auth.js              ← getGmailAccessToken（refresh_token → access_token）
      search.js            ← searchDeliveryEmails / parseEmailToDeliveryData
    delivery/
      buildLink.js         ← buildDriverSigningUrl（prefill URL 生成）
      mailer.js            ← sendSignedPDF（Gmail REST API 发送邮件）
  package.json
  .dev.vars.example
  README-server.md
```

**交互流程 / Interaction flow:**

1. 操作员在飞书私聊 Bot，发送含触发关键词的消息
2. Bot 回复"正在搜索…"，调用 Gmail API 搜索最近 30 天送货邮件
3. 找到多封时发送卡片让操作员选择；只有一封时直接处理
4. Bot 提取订单信息，发送司机签字链接（含预填参数）
5. 司机打开链接完成签字
6. 前端调用 `POST /delivery/signed`，后端发 PDF 至 anita@djjequipment.com.au 并通知操作员

---

## 本地开发

```bash
# 1. 安装依赖 / Install dependencies
cd server && npm install

# 2. 复制并填写本地开发变量 / Copy and fill in local dev vars
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，填写所有值

# 3. 启动本地 Worker / Start local Worker
npm run dev
# 等同于: wrangler dev --config ../wrangler.toml
```

---

## Cloudflare Workers 部署

### 一键部署步骤

```bash
# 1. 安装 wrangler CLI（全局）/ Install wrangler globally
npm install -g wrangler

# 2. 登录 Cloudflare 账户 / Log in to Cloudflare
wrangler login

# 3. 安装项目依赖 / Install project dependencies
cd server && npm install && cd ..

# 4. 设置所有 Secret / Set all secrets (one by one)
wrangler secret put LARK_APP_ID
wrangler secret put LARK_APP_SECRET
wrangler secret put LARK_VERIFICATION_TOKEN
wrangler secret put GMAIL_CLIENT_ID
wrangler secret put GMAIL_CLIENT_SECRET
wrangler secret put GMAIL_REFRESH_TOKEN
wrangler secret put GMAIL_USER

# 5. 部署 / Deploy
wrangler deploy
```

部署成功后，Worker URL 格式为：  
After deploy, the Worker URL will be:
```
https://djj-signing-bot.YOUR_SUBDOMAIN.workers.dev
```

`YOUR_SUBDOMAIN` 是你的 Cloudflare Workers 子域名，可在 Cloudflare Dashboard → Workers & Pages 查看。  
`YOUR_SUBDOMAIN` is your Cloudflare Workers subdomain, visible in Cloudflare Dashboard → Workers & Pages.

### 自定义域名（可选）/ Custom domain (optional)

Cloudflare Dashboard → Workers & Pages → djj-signing-bot → Settings → Domains & Routes → Add Custom Domain

---

## 环境变量获取指南

### LARK_APP_ID / LARK_APP_SECRET

1. 打开 [飞书开放平台](https://open.feishu.cn/app) → 选择应用
2. **凭证与基础信息** → 复制 **App ID** 和 **App Secret**

### LARK_VERIFICATION_TOKEN

1. 同一应用页面 → **事件订阅**
2. 复制 **验证令牌（Verification Token）**

### Gmail OAuth2（GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN）

**Step 1 — 创建 OAuth2 凭据 / Create OAuth2 credentials:**

1. 打开 [Google Cloud Console](https://console.cloud.google.com)
2. 新建或选择项目 → **APIs & Services → Enable APIs** → 启用 **Gmail API**
3. **Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs 添加：`https://developers.google.com/oauthplayground`
4. 记录 **Client ID** 和 **Client Secret**

**Step 2 — 获取 Refresh Token / Get a refresh token:**

1. 打开 [OAuth Playground](https://developers.google.com/oauthplayground)
2. 右上角齿轮 → 勾选 **Use your own OAuth credentials** → 填入 Client ID / Secret
3. 左侧 **Gmail API v1** → 选择 `https://mail.google.com/` → **Authorize APIs**
4. 用 `john.wang@djjequipment.com.au` 账户授权
5. **Step 2: Exchange authorization code for tokens** → 点击 **Exchange**
6. 复制 **Refresh token**

### GMAIL_USER

填写授权 Gmail 账户的邮件地址，例如 `john.wang@djjequipment.com.au`。

---

## Lark 后台配置

### 1. 配置事件订阅 Webhook

1. 飞书开放平台 → 应用 → **事件订阅**
2. **请求网址（Request URL）** 填写：
   ```
   https://djj-signing-bot.YOUR_SUBDOMAIN.workers.dev/lark/webhook
   ```
3. 添加订阅事件：`im.message.receive_v1`
4. 保存后飞书会发 challenge 验证请求，Worker 自动响应

### 2. 配置卡片回调 URL（Card Request URL）

1. 应用 → **应用功能 → 机器人**
2. **消息卡片请求网址** 填写：
   ```
   https://djj-signing-bot.YOUR_SUBDOMAIN.workers.dev/lark/card-action
   ```

### 3. 开启机器人能力 & 申请权限

1. **应用功能 → 机器人** → 开启，发布应用
2. **权限管理** → 申请 `im:message`（读写消息）

---

## 前端 DeliveryOrderMailer Bridge 配置

前端签字完成后触发 `postMessage`，但静态页无法直接访问后端。  
在嵌套前端的外层页面（或 App Shell）中注册 bridge：

```html
<script>
  window.DeliveryOrderMailer = {
    send: async (payload) => {
      // payload 由前端自动提供：to, subject, filename, pdfDataUrl, data
      const resp = await fetch(
        'https://djj-signing-bot.YOUR_SUBDOMAIN.workers.dev/delivery/signed',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // 可追加 open_id，让 Bot 在飞书里通知操作员（可选）
          body: JSON.stringify({ ...payload, open_id: 'OPERATOR_OPEN_ID' })
        }
      );
      if (!resp.ok) throw new Error('Failed to send signed PDF');
    }
  };
</script>
```

或通过 `postMessage` 监听签字完成事件（父页面 / parent wrapper page）：

```js
window.addEventListener('message', async (e) => {
  if (e.data?.type === 'delivery-order:ready-to-email') {
    await fetch(
      'https://djj-signing-bot.YOUR_SUBDOMAIN.workers.dev/delivery/signed',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(e.data.payload)
      }
    );
  }
});
```

---

## CORS 说明

Worker 已开启全局 CORS（Hono `cors()` middleware）。  
生产环境建议在 `src/index.js` 中限制来源：

```js
app.use('*', cors({ origin: 'https://bw1n9s.github.io' }));
```

---

## 注意事项 / Known Limitations

- **卡片选择状态**：`pendingSelections` 存储在 Worker 实例内存中，不跨实例共享。  
  如需高可用，可将状态迁移至 Cloudflare KV 或 Durable Objects。  
  Card selection state is in-memory per Worker instance; use Cloudflare KV/Durable Objects for HA.

- **`Buffer` 可用性**：`wrangler.toml` 已设置 `nodejs_compat`，`Buffer` 在 Worker 中可用。  
  Buffer is available because `nodejs_compat` is set in `wrangler.toml`.
