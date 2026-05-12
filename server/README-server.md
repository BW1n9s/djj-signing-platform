# DJJ Signing Platform — Server

Lark Bot 后端服务，基于 Node.js + Express。  
Node.js + Express backend for the DJJ Signing Platform Lark Bot.

---

## 目录 / Contents

- [架构说明](#架构说明)
- [本地运行](#本地运行)
- [Railway 部署](#railway-部署)
- [Render 部署](#render-部署)
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

**交互流程 / Interaction flow:**

1. 司机/操作员在飞书私聊 Bot，发送含触发关键词的消息
2. Bot 回复"正在搜索…"，调用 Gmail API 搜索最近 30 天的 picking list / booking confirmation
3. 若找到多封邮件，发送卡片让用户选择；若只有一封，直接处理
4. Bot 提取订单信息，返回司机签字链接（含预填参数）
5. 司机打开链接，完成签字
6. 前端调用 `POST /delivery/signed`，后端发送 PDF 至 anita@djjequipment.com.au，并通知操作员

---

## 本地运行

```bash
cd server
cp .env.example .env
# 填写 .env 中的所有变量

npm install
npm run dev   # node --watch index.js（Node 20+）
# 或 npm start
```

---

## Railway 部署

1. 登录 [Railway](https://railway.app) → **New Project → Deploy from GitHub repo**
2. 选择 `BW1n9s/djj-signing-platform`
3. 在 **Settings → Build** 中：
   - **Root Directory**：留空（使用仓库根目录）
   - **Dockerfile Path**：`server/Dockerfile`
4. 在 **Variables** 面板中添加所有环境变量（参见[下方说明](#环境变量获取指南)）
5. 部署完成后，复制 Railway 给的域名，例如 `https://djj-server-production.up.railway.app`
6. 将该域名填入 Lark 后台（见[下方配置](#lark-后台配置)）

> **自定义域名（可选）**：在 Railway Settings → Domains 绑定自己的域名。

---

## Render 部署

1. 登录 [Render](https://render.com) → **New Web Service → Connect GitHub**
2. 选择仓库，配置：
   - **Root Directory**: `server`
   - **Build Command**: `npm ci --omit=dev`
   - **Start Command**: `node index.js`
   - **Environment**: Node
3. 添加所有环境变量
4. 部署完成后记录域名

---

## 环境变量获取指南

### LARK_APP_ID / LARK_APP_SECRET

1. 打开 [飞书开放平台](https://open.feishu.cn/app) → 选择你的应用
2. **凭证与基础信息** → 复制 **App ID** 和 **App Secret**

### LARK_VERIFICATION_TOKEN

1. 同一应用页面 → **事件订阅**
2. **验证令牌（Verification Token）** 字段中复制

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
3. 左侧找 **Gmail API v1** → 选择 `https://mail.google.com/` → **Authorize APIs**
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
   https://YOUR_DOMAIN/lark/webhook
   ```
3. 添加订阅事件：`im.message.receive_v1`（接收消息）
4. 保存后飞书会向该 URL 发送验证请求（challenge），后端自动处理

### 2. 配置卡片回调 URL（Card Request URL）

1. 飞书开放平台 → 应用 → **应用功能 → 机器人**
2. **消息卡片请求网址** 填写：
   ```
   https://YOUR_DOMAIN/lark/card-action
   ```

### 3. 开启机器人能力

1. 飞书开放平台 → 应用 → **应用功能 → 机器人**
2. 开启"机器人"，发布应用

### 4. 申请权限

在 **权限管理** 中申请：
- `im:message`（读写消息）
- `im:message.group_at_msg`（如需群消息）

---

## 前端 DeliveryOrderMailer Bridge 配置

前端签字完成后会触发 `postMessage`，但静态页无法直接调用后端。  
需要在**嵌套前端页面的外层页面**（或在 `app/index.html` 加载后注入）中注册 bridge：

```html
<script>
  window.DeliveryOrderMailer = {
    send: async (payload) => {
      // payload 由前端自动提供，包含 to, subject, filename, pdfDataUrl, data
      // payload is provided automatically by the frontend
      const response = await fetch('https://YOUR_DOMAIN/delivery/signed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 可在 payload 里追加 open_id，让 Bot 通知操作员
        // Optionally add open_id so the Bot notifies the operator
        body: JSON.stringify({
          ...payload,
          open_id: 'OPERATOR_OPEN_ID' // 可选 / optional
        })
      });
      if (!response.ok) {
        throw new Error('Failed to send signed PDF');
      }
    }
  };
</script>
```

将此 `<script>` 块放在嵌套 `<iframe>` 之前，或通过 `postMessage` 监听注入：

```js
// 父页面监听子页面的签字完成事件，然后调用后端
window.addEventListener('message', async (e) => {
  if (e.data?.type === 'delivery-order:ready-to-email') {
    await fetch('https://YOUR_DOMAIN/delivery/signed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(e.data.payload)
    });
  }
});
```

---

## CORS 说明

后端已开启全局 CORS（`cors()` middleware）。  
生产环境建议在 `server/index.js` 中限制来源：

```js
app.use(cors({ origin: 'https://bw1n9s.github.io' }));
```
