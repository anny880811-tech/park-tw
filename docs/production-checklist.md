# Production 部署前檢查清單

## 1. 程式檢查

- `pnpm.cmd lint`：通過，沒有 ESLint error。
- `pnpm.cmd build`：通過；React Router dependency 的 `"use client"` warning 為 build warning，非錯誤。
- `package.json` 已提供 `dev`、`build`、`lint`、`preview` scripts。
- Router 目前包含 `/`、`/parking`、`/about`。
- Navbar 對應首頁、停車場、關於頁面。

## 2. 安全檢查

- React 前端不直接呼叫 TDX。
- React 前端不讀取 `TDX_CLIENT_SECRET`。
- 不可建立 `VITE_TDX_CLIENT_SECRET`。
- 不可把 Access Token 放進前端。
- `/api/parking` 是 server-side proxy，負責讀取 server-side credentials、取得 token、呼叫 TDX API 並 normalize response。
- `/api/parking` 不回傳 Access Token、Client Secret、Authorization header 或完整 request config。
- 不可提交任何 secret 到 Git。
- 已新增 Vercel SPA rewrite 設定，避免 React Router 前端路由在直接輸入或重新整理時出現 404。
- `/api` 路徑排除 rewrite，仍交給 Vercel Function 處理。

## 3. Vercel 環境變數

Production 若要啟用 API mode，需在 Vercel Project Settings 設定：

```text
TDX_CLIENT_ID
TDX_CLIENT_SECRET
VITE_PARKING_DATA_SOURCE=api
```

- `TDX_CLIENT_ID` 與 `TDX_CLIENT_SECRET` 是 server-side env，只供 Vercel Function 使用。
- `VITE_PARKING_DATA_SOURCE` 是公開前端設定，只能使用 `mock` 或 `api`。
- 未設定 `VITE_PARKING_DATA_SOURCE` 時，前端預設使用 mock adapter。

## 4. Preview 測試項目

- Preview 設定 `TDX_CLIENT_ID` 與 `TDX_CLIENT_SECRET`。
- Preview 設定 `VITE_PARKING_DATA_SOURCE=api`。
- 重新部署 Preview。
- 測試 `/api/parking?city=Taichung` 可回傳安全 response。
- 測試 `/` 可顯示 API mode 或 fallback 狀態。
- 測試 `/parking` 可顯示 API mode 或 fallback 狀態。
- 首頁定位成功後，停車場依距離由近到遠排序。
- `/parking` 定位成功後，搜尋結果依距離由近到遠排序。
- 定位失敗時頁面仍正常顯示。
- 沒有座標的資料不會造成畫面錯誤。
- `/api/parking?city=Taichung` 回傳 `parkingLots` 並包含 `latitude` / `longitude`。
- `parkingLots` 不包含 token、secret 或 Authorization header。
- HomePage API mode 可用合併後座標進行 2 公里範圍篩選。
- ParkingPage API mode 可用合併後座標進行 2 公里範圍篩選。
- `/parking` 不只顯示前 20 筆。
- `/parking` 以使用者座標為中心，顯示 2 公里內符合條件的停車場，並以每頁 12 張卡片分頁。
- 搜尋後分頁會回到第 1 頁。
- 定位或資料重新載入後分頁不會錯亂。
- 第 1 頁是目前排序後的前 12 筆。
- 確認 response 不包含 token、secret 或 Authorization header。

## 5. Production 部署前人工確認

- Vercel Production 已設定 `TDX_CLIENT_ID`。
- Vercel Production 已設定 `TDX_CLIENT_SECRET`。
- Vercel Production 已設定 `VITE_PARKING_DATA_SOURCE=api`。
- 沒有設定 `VITE_TDX_CLIENT_SECRET`。
- 確認 `pnpm.cmd lint` 通過。
- 確認 `pnpm.cmd build` 通過；若仍出現 React Router `"use client"` warning，確認不影響輸出即可。
- 確認 Production env 已設定且沒有使用 `VITE_TDX_CLIENT_SECRET`。
- 確認 `.env` 沒有被建立或提交。
- 確認 Preview API mode 已測試完成。
- 確認 `/api/parking?city=Taichung` 在 Preview 可用。
- 確認 `/parking` 直接輸入不會 404。
- 確認 `/about` 直接輸入不會 404。
- 確認正式部署前不需要新增套件或修改環境變數。

## 6. Production 部署後人工確認

- 開啟 `https://park-tw.vercel.app/`，確認首頁可正常顯示。
- 開啟 `https://park-tw.vercel.app/parking`，確認搜尋頁可正常顯示。
- 開啟 `https://park-tw.vercel.app/about`，確認關於頁可正常顯示。
- 直接輸入 `/parking` 或重新整理 `/parking`，確認不會出現 Vercel 404。
- 直接輸入 `/about` 或重新整理 `/about`，確認不會出現 Vercel 404。
- 測試 Navbar 導覽。
- 測試 `https://park-tw.vercel.app/api/parking?city=Taichung` 回傳 JSON。
- 確認 API response 不包含 token、secret 或 Authorization header。
- 確認 API response 不包含 Access Token。
- 確認 API response 不包含 Client Secret。
- 確認 API mode 失敗時頁面會 fallback 或顯示安全提示。

## 7. 已知限制

- HomePage / ParkingPage API mode 目前以 city query 測試為主。
- 尚未完成使用者經緯度轉縣市。
- 尚未完成全台縣市選擇器。
- 尚未加入地圖。
- 尚未合併路外停車場即時剩餘車位 endpoint。
- ParkingPage API mode 的 keyword 目前為 client-side filter，不是 TDX server-side keyword search。

## 8. 下一階段建議

- 在 Vercel Production 設定 server-side env 與公開資料來源設定。
- 先以 Preview 完成 API mode 驗證，再執行 Production 部署。
- 下一階段可補齊縣市選擇器、經緯度轉縣市、即時剩餘車位 merge 與地圖功能規劃。
