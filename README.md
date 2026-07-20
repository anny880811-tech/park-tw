# 台中好停

## 專案簡介

台中好停是一個台灣停車資訊查詢網站。

目前支援首頁附近停車資料展示、停車場搜尋頁、mock / API adapter 切換，以及透過 Vercel Function 安全串接 TDX 停車資料。

目前 API mode 仍以 city query 測試資料流為主，尚未完成使用者經緯度自動轉縣市，也尚未加入地圖。

目前優先提供臺中市停車資訊，其他縣市資料陸續整合中。

## 線上 Demo

Production 網址：

```text
https://park-tw.vercel.app/
```

部署後建議確認：

```text
/
/parking
/about
/api/parking?city=Taichung
```

## 主要功能

- 首頁停車資訊展示。
- 停車場搜尋頁。
- 首頁與停車場搜尋頁可依使用者座標顯示 2 公里內符合條件的停車場，並以每頁 12 張卡片分頁顯示。
- 首頁會顯示停車場與路邊停車格區塊；路邊停車格若資料來源有回傳會正常顯示，API mode 若未取得資料會顯示友善空狀態。
- 停車資料列表最多顯示 120 筆、每頁 12 張卡片、最多 10 頁；手機版分頁使用同一行的上一頁、頁碼、頁碼下拉選單與下一頁。
- 測試地標包含座標與 city；選擇台北 101 時會以 `city=Taipei` 呼叫 `/api/parking`，再用地標座標篩選 2 公里內資料。
- 使用者定位 UI 與狀態處理。
- mock data 模式。
- API mode。
- API loading / error / empty state。
- 資料來源提示。
- 更新時間顯示。
- Vercel Function server-side proxy。
- TDX token flow。
- React Router。
- Vercel SPA rewrite，支援直接輸入 `/parking`、`/about`。

## 技術棧

- React
- Vite
- JavaScript
- Bootstrap 5
- SCSS
- React Router
- Vercel Functions
- TDX API
- pnpm
- ESLint

## 專案架構

```text
api/
  parking.js                    Vercel Function proxy
server/
  tdxAuth.js                    TDX token flow
  tdxParkingMapper.js           TDX response normalize
src/
  components/                   共用 UI、停車卡片與定位狀態
  config/parkingDataSource.js   mock / api adapter 切換設定
  data/mockParkingData.js       mock data
  hooks/useGeolocation.js       瀏覽器定位 hook
  pages/                        HomePage、ParkingPage、AboutPage
  routes/AppRoutes.jsx          React Router routes
  services/parkingService.js    停車資料 service layer
  styles/theme.scss             Design System / CSS variables
docs/                           API、部署與測試文件
vercel.json                     Vercel SPA rewrite
```

## 資料來源

目前預設使用 mock data，讓首頁與停車場搜尋頁在沒有任何環境變數時也能正常顯示。

API mode 會透過前端 `parkingService` 呼叫本專案 `/api/parking`，再由 Vercel Function 在 server-side 呼叫 TDX API。React 前端不直接呼叫 TDX，也不保存 token 或 secret。

目前 `/api/parking` 使用 TDX 路外停車場基本資料 endpoint 進行最小可行串接測試。

## 環境變數

Production / Preview 若要啟用 API mode，請在 Vercel Project Settings 設定：

```text
TDX_CLIENT_ID
TDX_CLIENT_SECRET
VITE_PARKING_DATA_SOURCE=api
```

說明：

- `TDX_CLIENT_ID`：server-side env，只供 Vercel Function 使用。
- `TDX_CLIENT_SECRET`：server-side env，只供 Vercel Function 使用。
- `VITE_PARKING_DATA_SOURCE`：公開前端設定，只能使用 `mock` 或 `api`。

安全限制：

- 不要建立 `VITE_TDX_CLIENT_SECRET`。
- 不要把 `TDX_CLIENT_SECRET` 放進 React 前端。
- 不要把任何 secret commit 到 Git。
- 不要把正式密鑰寫進會被提交的 `.env`。

未設定 `VITE_PARKING_DATA_SOURCE` 時，前端預設使用 mock adapter。

## 本地開發

安裝依賴：

```bash
pnpm install
```

啟動 Vite 開發伺服器：

```bash
pnpm dev
```

執行 ESLint：

```bash
pnpm lint
```

建立 production build：

```bash
pnpm build
```

注意：

- `pnpm dev` 只啟動 Vite 前端開發伺服器。
- 本地若沒有啟動 Vercel Function，API mode 可能 fallback 到 mock。
- 正式 API 測試以 Vercel Preview / Production 為準。

## Vercel 部署

建議流程：

1. 將專案 push 到 GitHub。
2. 在 Vercel 匯入專案。
3. 設定 Environment Variables。
4. 確認 Build Command 使用 `pnpm build`。
5. 部署 Preview。
6. 測試 `/`、`/parking`、`/about`、`/api/parking?city=Taichung`。
7. 確認無誤後再部署 Production。

Vercel SPA rewrite 已設定在 `vercel.json`：

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

這會讓 `/parking`、`/about` 等前端路由 fallback 到 `index.html`，並保留 `/api` 路徑給 Vercel Function。

## 安全注意事項

- 不可使用 `VITE_TDX_CLIENT_SECRET`。
- 不可將 `TDX_CLIENT_SECRET` 寫入前端。
- 不可 commit `.env` 或任何 secret。
- Access Token 不會回傳前端。
- React 前端只呼叫 `/api/parking`，不直接呼叫 TDX。
- `/api/parking` 不回傳 token、secret、Authorization header 或完整 request config。

## 已知限制

- 目前 API mode 以 city query 測試為主。
- MVP v1 正式支援範圍為臺中市，其他縣市仍在資料可用性盤點與整合階段。
- 尚未完成使用者經緯度轉縣市。
- 尚未完成完整縣市選擇器。
- 尚未完成全台查詢策略。
- 尚未加入地圖。
- 路邊停車真實資料目前以 TDX OnStreet candidate endpoint 嘗試整合，實際資料完整度依 TDX 或地方資料來源而定。
- 尚未合併路外停車場即時剩餘車位 endpoint。
- TDX 回傳資料完整度依各縣市資料來源而定。

## 後續規劃

- 經緯度轉縣市。
- 縣市選擇器。
- 地圖整合。
- 路邊停車資料整合。
- 停車場基本資料與即時剩餘車位合併。
- 快取策略。
- 更完整的錯誤監控。
# 第三十四階段補充：車種篩選

HomePage 與 ParkingPage 支援車種篩選：全部、汽車、機車。未選擇或選擇全部時顯示所有車種資料；選擇汽車或機車時，只顯示資料中 `vehicleTypes` 包含對應車種的停車場或路邊停車格。

車種篩選會在 2 公里範圍篩選後、每頁 12 張卡片分頁前套用。部分資料來源可能沒有提供明確車種資訊，因此在汽車 / 機車篩選時可能不會被納入。
