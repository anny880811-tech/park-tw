# 全台灣停車資料 API 研究

## 1. 研究目的

本文件整理「停哪裡」後續從 mock data 轉向真實停車資料時的資料來源、授權風險、欄位設計與轉換策略。

目前專案已完成：

- HomePage：使用瀏覽器 Geolocation API 取得使用者位置，並用 mock data 顯示附近停車場與路邊停車格。
- ParkingPage：使用 SearchBar 搜尋 mock data 停車場。
- 距離工具：可依使用者座標計算 mock data 距離並排序。

本階段不實作 API request，只先定義後續串接全台灣資料時的方向。

## 2. 專案資料範圍

- 本專案目標為全台灣停車資訊。
- 不針對單一縣市寫死資料格式。
- 資料模型需可支援台北市、新北市、桃園市、台中市、台南市、高雄市與其他縣市。
- HomePage 未來應使用使用者座標查詢附近停車資訊。
- ParkingPage 未來應使用統一格式資料做關鍵字搜尋。

## 3. 候選資料來源

候選資料來源分為兩層：

1. TDX 運輸資料流通服務：作為全台灣交通資料的主要研究來源。
2. 各縣市 Open Data：作為 TDX 資料不足、欄位不完整或特定縣市即時資料缺漏時的補充來源。

政府資料開放平臺提供資料集搜尋、API 服務資料集、授權條款與 M2M 專區等入口，適合作為地方政府資料集盤點來源之一。

參考：

- TDX API Swagger：https://tdx.transportdata.tw/api-service/swagger
- 政府資料開放平臺：https://data.gov.tw/

## 4. TDX 停車資訊 API

初步結論：

- TDX 應作為本專案全台灣停車資料的主要來源。
- TDX 官方 API 文件頁面可連線，但目前此研究環境無法從 JavaScript Swagger 頁面可靠抽取完整 API schema。
- TDX 停車 API 的精確 endpoint、欄位名稱、城市代碼、路邊停車支援範圍、OData 支援細節，需要下一階段人工對照官方 Swagger 或匯出 OpenAPI schema。

本階段可先確認的設計方向：

- 應假設 TDX 可能提供路外停車場基本資料與即時剩餘車位資料。
- 應假設不同資料集可能拆成「靜態基本資料」與「即時可用車位」兩類。
- 應支援依縣市查詢，避免一次拉全台所有資料造成前端負擔。
- 應設計 OData query 的介面層，但實際可用參數需以官方文件確認。
- 經緯度、地址、收費、營業時間、總車位、剩餘車位、更新時間等欄位不可假設一定存在，adapter 需容錯。

待確認：

- TDX 是否提供全台灣路外停車場完整清單。
- TDX 是否提供全台灣路外停車場即時剩餘車位。
- TDX 是否提供路邊停車格或路邊停車路段資料。
- TDX 是否支援依縣市查詢停車資料。
- TDX 是否支援 `$filter`、`$select`、`$top`、`$skip` 等 OData query。
- TDX 停車資料是否穩定包含經緯度、收費、營業時間與更新時間。
- TDX API 的實際 rate limit、快取建議與錯誤格式。

## 5. 各縣市 Open Data 作為補充來源

各縣市政府可能提供自己的停車資料，例如：

- 路外停車場基本資料。
- 公有停車場即時剩餘車位。
- 路邊停車格或路段資訊。
- 停車費率與營業時間。

但地方 Open Data 的風險較高：

- 欄位格式可能不一致。
- 更新頻率可能不同。
- 有些縣市只有路外停車場資料。
- 有些縣市可能有路邊停車格資料，但不一定有即時狀態。
- 有些資料可能沒有經緯度。
- 有些資料可能需要地址轉座標、欄位清理或狀態轉換。

策略上不應讓畫面直接依賴各縣市原始欄位，而應建立 adapter，把不同來源轉為專案內部統一格式。

## 6. 路外停車場資料欄位整理

路外停車場最少需要支援：

- 停車場 ID
- 停車場名稱
- 城市
- 縣市代碼
- 行政區
- 地址
- 經緯度
- 總車位
- 剩餘車位
- 汽車位
- 機車位
- 收費方式
- 營業狀態
- 資料來源
- 更新時間

TDX 或地方資料可能會將基本資料與即時車位拆在不同 response，因此後續 service layer 需要支援 merge。

## 7. 路邊停車格資料欄位整理

路邊停車格或路段資料最少需要支援：

- ID
- 名稱
- 城市
- 縣市代碼
- 行政區
- 路段名稱
- 路段編號
- 車格編號
- 車格種類
- 經緯度
- 剩餘格位或占用狀態
- 收費方式
- 資料來源
- 更新時間

路邊停車資料通常比路外停車場更不一致，有些來源可能只提供路段可用格數，不提供單一車格座標。

## 8. API 授權與安全注意事項

TDX API 授權方式需以官方文件確認。由於需求提到 Client Id / Client Secret，本專案設計上應先假設：

- 本專案目前仍以前端 React + Vite 為主。
- 目前階段不建立後端、不建立 Vercel Function、不串接真實 TDX API。
- 現階段會繼續使用 mock data 與前端 service layer 進行 UI、定位、距離排序與搜尋流程開發。
- 本專案未來目標是串接真實停車 API，將 mock data 逐步替換成真實資料。
- 不可把 Client Secret 放在 React 前端。
- 不可建立會被前端打包或提交到 Git 的 `.env` 檔案來儲存正式密鑰。
- 不可使用 `VITE_` 前綴保存任何 Client Secret，因為 Vite 會把 `VITE_` 環境變數暴露到前端程式碼。
- 若 TDX 需要 OAuth token 或 client credential flow，應由後端或 serverless proxy 取得 token。
- 前端只呼叫本專案自己的 API endpoint 或 serverless function。
- 若未來有公開免授權 endpoint，也仍應確認 rate limit 與 CORS 策略。

在 Vite 專案中，以下做法不可使用：

```text
VITE_TDX_CLIENT_SECRET
```

任何 Client Secret 都不可進入前端 bundle，也不可提交到 Git。

待確認：

- TDX 是否必須登入會員取得 Client Id / Client Secret。
- TDX token 有效期限與更新方式。
- TDX 是否允許純前端直接呼叫。
- TDX CORS 與流量限制。

## 9. 前端是否能直接串接

初步建議：正式產品不建議直接從 React 前端呼叫需要 Client Secret 的 TDX API。

原因：

- React 前端無法安全保存 secret。
- `VITE_` 前綴環境變數會被 Vite 注入前端程式碼，只適合公開資訊，不適合 Client Secret。
- token 交換流程若需要 secret，必須放在 server side。
- 直接呼叫外部 API 會讓畫面耦合外部欄位、錯誤格式與 rate limit。

可行方向：

- 開發初期可用 mock data 或本地 fixture。
- 串接階段建立 service layer。
- 若 TDX 需要 secret，使用 Vercel Function、後端或其他 server-side proxy。
- 前端只接收已 normalize 的內部格式資料。

文件中提到 Vercel Function、serverless proxy 或後端，是針對未來正式串接需要 Client Secret 的 TDX API 時的安全建議。本階段不建立 server-side 程式、不建立 API route、不建立 `.env`、不填入任何金鑰。

## 10. 建議的全台灣串接策略

第一步：以 TDX 停車資訊 API 作為主要資料來源。

第二步：建立 service layer，讓前端不要直接依賴外部 API 原始欄位。

第三步：將 TDX response 轉成專案內部統一格式。

第四步：首頁用使用者定位座標 + 統一格式資料做距離排序。

第五步：停車場頁使用統一格式資料做關鍵字搜尋。

第六步：若 TDX 授權需要 Client Secret，改由後端或 serverless proxy 串接，不把 secret 放在 React 前端。

第七步：若 TDX 某些縣市資料不足，再補各縣市 Open Data adapter。

第八步：建立資料品質標記，例如 `source`、`updatedAt`、`status`、`latitude` / `longitude` 是否存在，讓 UI 可以顯示資料可信度。

第十四階段開始建立 Vercel Function proxy 骨架，但仍不放入真實 secret，也不呼叫 TDX API。目前前端仍預設使用 mock adapter。未來正式串接時，才會讓 apiParkingAdapter 呼叫 `/api/parking`，並由 Vercel Function 處理 TDX token 與資料 normalize。

第十五階段建立 TDX Access Token Flow 的 server-side 骨架。此階段只驗證 Vercel Function 可以在 server-side 使用環境變數取得 Access Token。目前仍不串接 TDX 停車資料 endpoint，也不讓 React 前端取得 token。前端畫面仍預設使用 mock adapter。

第十六階段整理 TDX 停車 API endpoint 與欄位 mapping，並建立 server-side mapper skeleton。本階段仍不呼叫 TDX 停車資料 API，也不讓前端切換到真實 API。下一階段才會選定最小可行 endpoint 做實際串接測試。

第十七階段開始最小可行 TDX endpoint 串接測試，只在 server-side `/api/parking.js` 呼叫路外停車場基本資料 endpoint，並使用 `server/tdxParkingMapper.js` normalize response。前端仍預設使用 mock adapter，尚未正式替換 HomePage / ParkingPage 資料來源；後續才會設計 API adapter 切換策略。

第十八階段準備 Vercel Preview 測試文件與安全檢查流程。本階段不切換前端資料來源，HomePage / ParkingPage 仍使用 mock adapter。實際 TDX API 測試需在 Vercel server-side 環境設定 `TDX_CLIENT_ID` 與 `TDX_CLIENT_SECRET`。

第二十階段建立 API adapter 切換機制。目前預設仍使用 mock adapter，未來可透過公開設定 `VITE_PARKING_DATA_SOURCE=api` 切換到 api adapter。TDX Client Secret 仍只存在 server-side，不會進入 React 前端。

第二十三階段開始進行 HomePage API mode 測試。前端仍不直接呼叫 TDX，而是透過 `/api/parking` 與 `parkingService` adapter 切換機制取得資料。

第二十四階段開始進行 ParkingPage API mode 測試。前端仍不直接呼叫 TDX，而是透過 `/api/parking` 與 `parkingService` adapter 切換機制取得資料。目前 ParkingPage API mode 先以預設 city 測試，不進行全台查詢。

第二十五階段完成 API mode UI 狀態整理。前端仍透過 `parkingService` 與 `/api/parking` 取得資料，不直接呼叫 TDX，也不保存 token 或 secret。

第二十六階段進行正式部署前檢查。確認前端仍透過 `parkingService` 與 `/api/parking` 取得資料，不直接呼叫 TDX，也不保存 token 或 secret。

第二十八階段開始統一處理使用者座標距離排序。若 API 回傳資料沒有 `latitude` / `longitude`，前端無法進行精準距離排序；後續需合併 TDX CarPark 基本資料與 ParkingAvailability 即時車位資料，才能在 API mode 下完整支援由近到遠排序。

第二十九階段讓 `/api/parking` 合併 TDX CarPark 基本資料與 ParkingAvailability 即時剩餘車位資料。API mode 若要支援 2 公里範圍篩選與距離排序，需要停車場經緯度，因此由 CarPark 提供位置與地址，再以 ParkingAvailability 補足剩餘車位、服務狀態與更新時間。

第三十一階段開始嘗試整合路邊停車格 / 路邊停車路段資料。路邊停車資料在不同縣市的資料完整度可能不同；若資料沒有 `latitude` / `longitude`，前端無法判斷是否位於使用者 2 公里內，因此不會硬猜座標。

未來正式串接 TDX 時，建議資料流為：

```text
React 前端
呼叫本專案的 Vercel Function，例如 /api/parking
Vercel Function 從 process.env 讀取 TDX_CLIENT_ID / TDX_CLIENT_SECRET
Vercel Function 向 TDX 換取 Access Token
Vercel Function 呼叫 TDX 停車 API
將資料 normalize 成專案內部統一格式
回傳給 React 前端
```

第十二階段只做 API 研究與資料格式設計，不實作實際 request。正式串接前仍需先確認 TDX 官方授權流程、CORS、rate limit 與 API schema。

## 11. 內部統一資料格式設計方向

本專案應統一輸出兩種核心資料：

- `parkingLotModelExample`：路外停車場。
- `streetParkingModelExample`：路邊停車格或路段。

共同設計原則：

- 必須保留 `city`、`cityCode`、`district`。
- 必須保留 `source`，方便追蹤 TDX 或地方 Open Data。
- 經緯度允許為 `null`，避免資料缺漏造成畫面崩潰。
- 車位數允許為 `null`，因部分來源可能不提供即時車位。
- 狀態使用專案內部 enum，不直接使用外部 API 狀態字串。
- 更新時間使用字串，後續可再統一為 ISO 8601。

目前 mock data 與未來 model 差異：

- mock data 仍以畫面展示為主，欄位較少。
- mock data 尚未完整包含 `city`、`cityCode`、`district`、`source`、`updatedAt`。
- 第十一階段已為首頁 mock data 增加 `latitude`、`longitude`，可支援距離排序。
- 本階段不大幅重構 mock data，避免破壞既有畫面。

## 12. 待確認問題

- TDX 停車 API 的正式 endpoint 與版本。
- TDX 停車 API 是否完整涵蓋全台路外停車場。
- TDX 是否有路邊停車格或路邊停車路段 API。
- TDX 即時剩餘車位與停車場基本資料如何關聯。
- TDX city code 與本專案 `cityCode` 是否可直接沿用。
- TDX 經緯度格式是否為 WGS84。
- TDX API 是否需要 Client Id / Client Secret。
- TDX 是否允許 browser 端直接呼叫。
- 各縣市 Open Data 的補充優先順序。
- 是否需要地址轉座標服務處理缺少經緯度的資料。

## 13. Vercel 部署與環境變數策略

若未來部署到 Vercel，可以使用 Vercel Environment Variables 儲存：

```text
TDX_CLIENT_ID
TDX_CLIENT_SECRET
```

但這些環境變數只能在 Vercel Function 等 server-side 執行環境讀取。React 前端不可直接讀取或暴露 Client Secret。

正確方向：

- React 前端呼叫本專案自己的 API route，例如 `/api/parking`。
- Vercel Function 在 server-side 使用 `process.env.TDX_CLIENT_ID` 與 `process.env.TDX_CLIENT_SECRET`。
- Vercel Function 負責向 TDX 換 token、呼叫 TDX API、normalize response。
- React 前端只接收整理後的停車資料。

錯誤方向：

- 使用 `VITE_TDX_CLIENT_SECRET`。
- 在 React component、hook、service 檔案中讀取 Client Secret。
- 把 Client Secret 寫進 `.env` 後讓 Vite 打包到前端。
- 把任何 API key 或 secret commit 到 Git。

本階段不建立 Vercel Function、不建立 `/api` 資料夾、不建立 `.env`、不填入任何金鑰。上述內容只作為未來正式 API 串接時的安全架構建議。

第三十階段移除 `/api/parking` 的 `$top=20` 測試限制，讓 city endpoint 回傳的符合資料可完整保留。ParkingPage 會以使用者座標為中心，顯示 2 公里內符合條件的停車場，並在搜尋、距離排序完成後，於畫面層以每頁 12 張卡片分頁顯示。

第三十四階段補充三修正路邊停車車種辨識。路邊停車資料會優先使用結構化車種欄位；若缺少明確欄位，才從收費、說明、備註等文字中辨識「小型車、汽車、自小客車、轎車、機車、摩托車、汽機車」等明確車種字詞。無法辨識時仍維持 `vehicleTypes: []`，選擇「全部」時仍會顯示，選擇「汽車」或「機車」時只顯示明確符合的資料。Taipei 路邊資料若因 TDX 回應 429 取得失敗，仍維持安全空陣列與非敏感 meta，不建立假資料。

