# Vercel Preview /api/parking 實測紀錄

## 1. 測試目的

確認 Vercel Preview 環境中的 `/api/parking` 可以在 server-side 安全執行 TDX 最小可行 API 串接。

本測試只驗證 Vercel Function，不代表 HomePage / ParkingPage 已切換成真實 API。前端目前仍使用 mock adapter。

## 2. 測試前檢查

- `/api/parking` 只允許 `GET`。
- `/api/parking` 會檢查 `TDX_CLIENT_ID` 與 `TDX_CLIENT_SECRET`。
- `/api/parking` 使用 `getTdxAccessToken()` 在 server-side 取得 Access Token。
- `/api/parking` 使用 `Authorization: Bearer` 呼叫 TDX 停車 endpoint。
- `/api/parking` 使用 `server/tdxParkingMapper.js` normalize response。
- `/api/parking` 不回傳 Access Token。
- `/api/parking` 不回傳 Client Secret。
- `parkingService.js` 仍使用 mock adapter。
- HomePage / ParkingPage / Router / Navbar 未切換成真實 API。
- 第二十一階段已完成本地 `pnpm.cmd lint` 與 `pnpm.cmd build` 檢查。

## 3. Vercel 環境變數設定狀態

由使用者手動到 Vercel Project Settings 設定：

```text
TDX_CLIENT_ID
TDX_CLIENT_SECRET
```

注意事項：

- 不使用 `VITE_` 前綴。
- 不把 secret 寫入專案檔案。
- 不 commit secret。
- 設定後需重新部署 Preview。

目前設定狀態：

```text
待填寫：尚未提供 Preview URL，Vercel 環境變數由使用者手動設定
```

## 4. Preview URL

測試網址：

```text
https://<your-preview-url>/api/parking
https://<your-preview-url>/api/parking?city=Taipei
```

實際 Preview URL：

```text
待填寫：尚未提供 Preview URL
```

## 5. /api/parking 測試結果

測試時間：

```text
待填寫
```

測試項目：

- `/api/parking`
- `/api/parking?city=Taipei`

結果：

```text
待填寫：Preview 實測尚未執行
```

## 6. 成功回應或錯誤回應摘要

若尚未設定 Vercel 環境變數，預期回應類似：

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

若已設定環境變數，且 TDX API 串接成功，預期回應類似：

```json
{
  "parkingLots": [],
  "streetParkingSpaces": [],
  "meta": {
    "source": "tdx",
    "mode": "minimal-api-integration",
    "city": "Taipei",
    "count": 0,
    "tokenReady": true
  }
}
```

實際回應摘要：

```text
待填寫：只記錄必要摘要，不貼上任何 token 或 secret。
```

## 7. 安全檢查

- 沒有建立 `.env`。
- 沒有把 `TDX_CLIENT_ID` 寫入專案檔案。
- 沒有把 `TDX_CLIENT_SECRET` 寫入專案檔案。
- 沒有使用 `VITE_TDX_CLIENT_SECRET`。
- 沒有把 Access Token 回傳給前端。
- 沒有把 Client Secret 回傳給前端。
- 沒有在 console 或文件中顯示 token / secret。
- 沒有執行自動部署。
- 沒有自動 commit / push。

## 8. 待修正問題

```text
目前無本地檢查阻擋項目；Preview 實測結果待使用者手動補上。
```

第二十三階段：HomePage API mode 測試準備。

- `/api/parking` 已可在 Vercel Preview 取得資料。
- HomePage 可透過 `VITE_PARKING_DATA_SOURCE=api` 測試 api adapter。
- 前端仍不直接呼叫 TDX，不保存 token 或 secret。
- 目前 API mode 先以 city query 測試，尚未完成使用者經緯度轉縣市。

第二十四階段：ParkingPage API mode 測試準備。

- `/api/parking` 已可在 Vercel Preview 取得資料。
- ParkingPage 可透過 `VITE_PARKING_DATA_SOURCE=api` 測試 api adapter。
- 前端仍不直接呼叫 TDX，不保存 token 或 secret。
- 目前 ParkingPage API mode 先以預設 city query 測試，keyword 暫時只做 client-side filter。

第二十五階段：API mode UI 狀態整理。

- 已針對 HomePage / ParkingPage 加強 loading、error、empty state 與 fallback 顯示。
- 資料來源與更新時間提示只顯示安全資訊，不包含 token、secret 或 Authorization header。

## 9. 結論

```text
本地檢查已通過；等待 Vercel Preview URL 與 server-side 環境變數完成設定後進行實測。
```
