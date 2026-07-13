# Vercel Preview API 測試指南

## 1. 測試目的

本文件說明如何在 Vercel Preview 環境安全測試 `/api/parking`。

第十七階段已完成最小可行 TDX 停車 API 串接準備，`/api/parking` 會在 server-side 使用 TDX credentials 取得 Access Token，呼叫 TDX 路外停車場基本資料 endpoint，並回傳 normalize 後的資料。

本測試只驗證 Vercel Function 與 TDX API 串接，不代表前端畫面已切換成真實資料。HomePage / ParkingPage 目前仍預設使用 mock adapter。

## 2. 測試前提

- 專案已部署到 Vercel Preview。
- Vercel Project Settings 已設定 TDX 需要的 server-side environment variables。
- 不需要在 React 前端設定任何 TDX secret。
- 不需要建立 `.env`。
- 不需要把 `parkingService` 切換成 API adapter。

## 3. Vercel Environment Variables 設定

未來在 Vercel Project Settings 的 Environment Variables 設定：

```text
TDX_CLIENT_ID
TDX_CLIENT_SECRET
```

安全規則：

- 不要使用 `VITE_` 前綴。
- 不要使用 `VITE_TDX_CLIENT_SECRET`。
- 不要把 secret 寫入專案檔案。
- 不要 commit secret。
- 不要把 secret 回傳到前端。
- 不要在瀏覽器 console 顯示 secret。
- Vercel Function 使用 `process.env.TDX_CLIENT_ID`。
- Vercel Function 使用 `process.env.TDX_CLIENT_SECRET`。

## 4. Preview 部署後測試 `/api/parking`

Preview 部署完成後，可在瀏覽器或 API client 測試：

```text
https://<your-preview-url>/api/parking
```

若要指定城市，可測試：

```text
https://<your-preview-url>/api/parking?city=Taipei
```

目前 `/api/parking` 預設 city 為 `Taipei`，並限制 TDX query 使用 `$top=20` 與 `$format=JSON`。

## 5. 成功回應範例

若 Vercel Environment Variables 已設定，且 TDX token flow 與停車 API 呼叫成功，預期回傳類似：

```json
{
  "parkingLots": [
    {
      "id": "TPE0078",
      "name": "至善公園平面停車場",
      "type": "offStreet",
      "source": "tdx",
      "city": "Taipei",
      "cityCode": "TPE",
      "district": "",
      "address": "臺北市士林區至善路1段雙溪公園斜對面",
      "latitude": 25.0981,
      "longitude": 121.53834,
      "totalSpaces": null,
      "availableSpaces": null,
      "carSpaces": null,
      "motorSpaces": null,
      "price": "依現場公告為準",
      "isOpen": null,
      "status": "unknown",
      "updatedAt": "2026-07-12T11:42:26+08:00"
    }
  ],
  "streetParkingSpaces": [],
  "meta": {
    "source": "tdx",
    "mode": "minimal-api-integration",
    "city": "Taipei",
    "count": 1,
    "tokenReady": true
  }
}
```

實際筆數、停車場內容與更新時間以 TDX 回傳資料為準。

## 6. 缺少環境變數時的錯誤回應範例

若 Vercel Environment Variables 尚未設定，預期會看到類似：

```json
{
  "parkingLots": [],
  "streetParkingSpaces": [],
  "meta": {
    "source": "tdx",
    "mode": "proxy-skeleton",
    "message": "TDX environment variables are not configured.",
    "requiredEnv": ["TDX_CLIENT_ID", "TDX_CLIENT_SECRET"]
  }
}
```

這代表 server-side function 有正常執行，但尚未設定 TDX credentials。

## 7. 安全檢查清單

- `/api/parking` 只允許 `GET`。
- Access Token 不會回傳給 React 前端。
- Client Secret 不會回傳給 React 前端。
- 程式碼沒有 `console.log` token 或 secret。
- 專案沒有新增 `.env`。
- 專案沒有使用 `VITE_TDX_CLIENT_SECRET`。
- `parkingService.js` 仍預設使用 mock adapter。
- HomePage / ParkingPage 尚未切換成真實 API。
- Vercel Environment Variables 只設定在 Vercel 後台。

## 8. 常見問題

### 為什麼前端畫面還是 mock data？

第十八階段只測試 server-side `/api/parking`，尚未切換 `parkingService`。前端仍使用 mock adapter 是預期行為。

### 可以把 TDX Client Secret 放在 `VITE_` 環境變數嗎？

不可以。`VITE_` 前綴會暴露到前端 bundle，只能放公開資訊，不能放 Client Secret。

### 可以建立 `.env` 測試嗎？

不要建立會被提交到 Git 的 `.env` 存放正式密鑰。若未來需要本地測試 Vercel Function，需使用安全方式管理本地環境變數，並確保不會提交任何真實 secret。

### `/api/parking?city=Taipei` 成功後下一步是什麼？

下一步可加入路外停車場即時剩餘車位 endpoint，使用停車場 ID merge 基本資料與 availability，再決定何時讓 `apiParkingAdapter` 成為可切換資料來源。
