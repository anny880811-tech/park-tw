# 環境變數設定說明

本專案目前仍預設使用 mock data，不需要設定任何環境變數即可開發 UI、定位、距離排序與搜尋流程。

未來若部署到 Vercel 並串接 TDX API，請在 Vercel Project Settings 的 Environment Variables 設定：

```text
TDX_CLIENT_ID
TDX_CLIENT_SECRET
```

- `TDX_CLIENT_ID`：TDX OAuth / OIDC Client Credentials flow 使用的 client id。
- `TDX_CLIENT_SECRET`：TDX OAuth / OIDC Client Credentials flow 使用的 client secret。
- 這兩個值應設定在 Vercel Project Settings 的 Environment Variables。

## 安全規則

- 不要建立 `.env` 並提交 secret。
- 不要使用 `VITE_TDX_CLIENT_SECRET`。
- `VITE_` 前綴環境變數會暴露到前端程式碼，只能放公開資訊。
- Client Secret 只能在 Vercel Function 等 server-side 執行環境使用。
- React 前端只能呼叫本專案 API route，例如 `/api/parking`。
- Vercel Function 才能讀取 `process.env.TDX_CLIENT_ID` 與 `process.env.TDX_CLIENT_SECRET`。
- Access Token 不會回傳給 React 前端。
- 本地開發若需要測試 Vercel Function，應使用安全的本地環境設定方式，但不要提交任何真實 secret。

## 未來資料流

```text
React 前端
呼叫 /api/parking
Vercel Function 讀取 TDX_CLIENT_ID / TDX_CLIENT_SECRET
Vercel Function 向 TDX 換取 Access Token
Vercel Function 呼叫 TDX 停車 API
Vercel Function normalize response
React 前端接收統一格式資料
```

本階段只建立 proxy 與 token flow 骨架，不填入任何金鑰，不呼叫 TDX 停車資料 API。
