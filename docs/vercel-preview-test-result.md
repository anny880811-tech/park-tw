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

第二十六階段：正式部署前檢查。

- 確認 Preview API mode、lint、build 與安全檢查狀態。
- Production 若要啟用 API mode，仍需在 Vercel 設定 server-side credentials 與公開資料來源設定。

第二十六階段補充：Vercel SPA rewrite。

- 已新增 Vercel SPA rewrite 設定，避免 React Router 前端路由在直接輸入或重新整理時出現 404。
- `/api` 路徑排除 rewrite，仍交給 Vercel Function 處理。

第二十九階段：CarPark + ParkingAvailability 合併測試。

- 測試 `/api/parking?city=Taichung` 是否回傳合併後 `parkingLots`。
- 確認 `parkingLots` 盡可能包含 `latitude` / `longitude` 與 `availableSpaces`。
- 確認 response 不包含 token、secret 或 Authorization header。
- 確認 HomePage / ParkingPage API mode 不 crash。

第三十階段：完整結果顯示與 ParkingPage 分頁。

- `/api/parking?city=Taichung` 不再使用 `$top=20` 測試限制。
- ParkingPage 以使用者座標為中心，保留 2 公里內符合條件的資料，並以每頁 12 張卡片顯示。
- 搜尋、定位或資料重新載入後，分頁會回到第 1 頁。
- 分頁只在畫面層處理，不會因切換頁碼重新呼叫 TDX API。

第三十階段補充二：首頁停車場分頁。

- HomePage 停車場區塊同樣使用 2 公里內資料。
- HomePage 停車場區塊每頁顯示 12 張卡片。
- HomePage 定位或資料重新載入後，分頁會回到第 1 頁。

第三十階段補充三：首頁路邊停車格區塊。

- HomePage 會顯示停車場與路邊停車格區塊。
- 路邊停車格若資料來源有回傳，會正常顯示卡片。
- API mode 目前尚未整合真實路邊停車格資料；若 `streetParkingSpaces` 為空陣列，首頁會顯示友善空狀態。

第三十一階段：路邊停車格 / 路邊停車路段資料整合。

- `/api/parking` 會嘗試取得 TDX OnStreet `ParkingSegment` candidate endpoint。
- 若路邊資料取得失敗，`streetParkingSpaces` 會維持空陣列，不影響 `parkingLots`。
- API response 不應包含 token、secret 或 Authorization header。

第三十二階段：全站分頁上限與手機版分頁 UI。

- HomePage 與 ParkingPage 停車資料列表最多顯示 120 筆。
- 每頁顯示 12 張卡片，最多 10 頁。
- HomePage 停車場與路邊停車格分頁彼此獨立。
- 手機版分頁 UI 以同一行呈現上一頁、頁碼、頁碼下拉選單與下一頁。

第三十三階段：測試地標 city 對應。

- 測試地標需同時包含 `latitude`、`longitude` 與 `city`。
- 選擇台北 101 時，前端會以 `city=Taipei` 呼叫 `/api/parking`。
- 選擇台中車站時，前端會以 `city=Taichung` 呼叫 `/api/parking`。
- 前端再以地標座標篩選 2 公里內資料。

## 9. 結論

```text
本地檢查已通過；等待 Vercel Preview URL 與 server-side 環境變數完成設定後進行實測。
```
# 第三十四階段：車種篩選測試項目

HomePage 與 ParkingPage 已加入全部 / 汽車 / 機車篩選。測試時需確認車種篩選在 2 公里範圍篩選後、每頁 12 筆分頁前套用，且切換車種後頁碼會回到第 1 頁。

若 API 資料沒有明確 `vehicleTypes`，在汽車 / 機車篩選時可能不會顯示該筆資料；選擇全部時仍可顯示。
