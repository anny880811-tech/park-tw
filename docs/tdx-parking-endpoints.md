# TDX 停車 API Endpoint 研究

## 1. 研究目的

本文件整理 TDX 停車資料 endpoint 的研究結果與 adapter mapping 初稿，作為後續把 mock data 替換成真實全台灣停車資料的依據。

本階段只做 endpoint 與欄位設計研究，不呼叫 TDX 停車資料 API，不修改前端資料來源，也不把 `parkingService` 切換到 API adapter。

## 2. 官方文件來源

本階段以官方資料為主要研究來源：

- TDX API Swagger：https://tdx.transportdata.tw/api-service/swagger
- TDX 停車 API Swagger / OpenAPI 文件：https://tdx.transportdata.tw/api-service/swagger/basic/945f57da-f29d-4dfd-94ec-c35d9f62be7d
- 政府資料開放平臺：https://data.gov.tw/

目前限制：

- TDX Swagger 頁面為動態頁面，本次執行環境無法可靠抽取完整 OpenAPI schema。
- 因此本文件不硬猜精確 endpoint path 與 raw 欄位名稱。
- 待確認：需要人工對照 TDX Swagger / OpenAPI schema。
- 第十七階段已使用路外停車場基本資料 endpoint 做最小可行 server-side 串接測試，前端仍未切換到真實 API。

## 3. 路外停車場基本資料 endpoint

用途：取得路外停車場靜態基本資料，作為停車場名稱、地址、座標、總車位、收費方式與營業資訊的主要來源。

| 項目 | 目前結論 |
| --- | --- |
| endpoint 名稱 | 路外停車場基本資料，正式名稱待確認 |
| endpoint path | `/api/basic/v1/Parking/OffStreet/CarPark/City/{city}` |
| 是否支援指定縣市 | 是，第十七階段以 `Taipei` 測試 |
| 是否支援 OData query | 第十七階段曾以 `$top=20` 與 `$format=JSON` 測試；第三十階段起移除 `$top=20`，保留 `$format=JSON` |
| 是否包含停車場 ID | 是，已確認 `CarParkID` |
| 是否包含停車場名稱 | 是，已確認 `CarParkName.Zh_tw` |
| 是否包含地址 | 是，已確認 `Address` |
| 是否包含經緯度 | 是，已確認 `CarParkPosition.PositionLat` / `CarParkPosition.PositionLon` |
| 是否包含總車位 | 待確認 |
| 是否包含汽車位 / 機車位 | 待確認 |
| 是否包含收費方式 | 是，已確認 `FareDescription` |
| 是否包含營業時間 | 待確認 |
| 是否包含更新時間 | 是，已確認 wrapper 層級有 `UpdateTime` / `SrcUpdateTime`，單筆資料層級仍待確認 |

設計假設：

- 此 endpoint 應先 normalize 成 `parkingLotModelExample`。
- 即時剩餘車位若由另一個 endpoint 提供，應以停車場 ID 合併。
- 經緯度、車位數、收費與營業時間都必須可缺漏，不能讓 UI 崩潰。

## 4. 路外停車場即時剩餘車位 endpoint

用途：取得路外停車場即時剩餘車位與營業狀態，並與路外停車場基本資料合併。

| 項目 | 目前結論 |
| --- | --- |
| endpoint 名稱 | 路外停車場即時剩餘車位，正式名稱待確認 |
| endpoint path | 待確認：需要人工對照 TDX Swagger / OpenAPI schema |
| 是否支援指定縣市 | 待確認 |
| 是否支援 OData query | 待確認 |
| 是否包含停車場 ID | 待確認 |
| 是否可與基本資料關聯 | 待確認 |
| 是否包含總車位 | 待確認 |
| 是否包含剩餘車位 | 待確認 |
| 是否包含車種分類剩餘車位 | 待確認 |
| 是否包含營業狀態 | 待確認 |
| 是否包含資料更新時間 | 待確認 |

設計假設：

- 此 endpoint 不應單獨作為前端卡片的完整資料來源。
- server-side adapter 需先把 availability normalize，再用停車場 ID merge 到基本資料。
- 若即時資料缺漏，內部格式的 `availableSpaces` 可為 `null`，`status` 使用 `unknown`。

## 5. 路外停車場出入口 endpoint

用途：取得停車場入口 / 出口座標，未來可用於導航、路線導引或地圖標記。

| 項目 | 目前結論 |
| --- | --- |
| endpoint 名稱 | 路外停車場出入口資料，正式名稱待確認 |
| endpoint path | 待確認：需要人工對照 TDX Swagger / OpenAPI schema |
| 是否支援指定縣市 | 待確認 |
| 是否包含停車場 ID | 待確認 |
| 是否包含入口 / 出口座標 | 待確認 |
| 是否與停車場基本資料關聯 | 待確認 |
| 是否對首頁附近搜尋有必要 | 初期非必要 |

初步策略：

- 首頁附近搜尋以停車場本身座標為主，出入口資料不是最小可行串接的必要條件。
- 後續若加入地圖或導航功能，再把出入口資料納入 model 或延伸資料。

## 6. 路邊停車資料 endpoint

用途：取得路邊停車路段、車格或即時占用狀態，讓 HomePage 能顯示附近路邊停車格。

| 項目 | 目前結論 |
| --- | --- |
| endpoint 名稱 | 路邊停車資料，正式名稱待確認 |
| endpoint path | 待確認：需要人工對照 TDX Swagger / OpenAPI schema |
| 是否支援指定縣市 | 待確認 |
| 是否支援路段資料 | 待確認 |
| 是否支援單一車格資料 | 待確認 |
| 是否包含路段 ID | 待確認 |
| 是否包含車格 ID | 待確認 |
| 是否包含路段名稱 | 待確認 |
| 是否包含經緯度 | 待確認 |
| 是否包含剩餘格位 | 待確認 |
| 是否包含占用狀態 | 待確認 |
| 是否包含收費方式 | 待確認 |
| 是否包含更新時間 | 待確認 |

設計假設：

- 路邊停車可能以路段、區域或單一車格為資料粒度。
- 若只提供路段剩餘數，`spaceId` 可為空字串，`availableSpaces` 代表路段可用格數。
- 若只提供占用狀態，adapter 需轉換成 `PARKING_STATUS`。

## 7. OData query 支援整理

TDX API 常見可能支援 OData query，但停車 API 實際支援範圍需以 Swagger schema 確認。

待確認項目：

- 是否支援 `$filter`
- 是否支援 `$select`
- 是否支援 `$top`
- 是否支援 `$skip`
- 是否支援 `$orderby`
- 是否支援依城市或縣市代碼查詢
- 是否支援依更新時間查詢

後續設計原則：

- 前端不直接組 TDX OData query。
- query 組裝應放在 Vercel Function 或 server-side service。
- API response 仍需 normalize 成專案內部格式後再回前端。

## 8. 欄位對應初稿

### 路外停車場基本資料

| TDX raw 欄位 | 內部 model 欄位 | 資料用途 | 是否必要 | 缺漏時處理方式 | 待確認事項 |
| --- | --- | --- | --- | --- | --- |
| 待確認：停車場 ID | `id` | 合併基本資料與即時車位 | 是 | 若缺漏則無法穩定合併，需丟棄或產生來源內唯一 key | raw 欄位名稱 |
| 待確認：停車場名稱 | `name` | 卡片標題與搜尋 | 是 | 顯示空字串或資料來源預設名稱 | raw 欄位名稱與多語系格式 |
| 待確認：城市 | `city` | 全台灣資料分區 | 是 | 空字串 | 是否由 endpoint path 或 response 提供 |
| 待確認：城市代碼 | `cityCode` | 查詢與資料來源識別 | 建議 | 空字串 | 是否沿用 TDX city code |
| 待確認：行政區 | `district` | 搜尋與顯示 | 建議 | 空字串 | 是否需要由地址解析 |
| 待確認：地址 | `address` | 顯示與搜尋 | 建議 | 空字串 | raw 欄位名稱 |
| 待確認：緯度 | `latitude` | 距離計算 | 建議 | `null`，不參與距離排序 | 座標格式是否 WGS84 |
| 待確認：經度 | `longitude` | 距離計算 | 建議 | `null`，不參與距離排序 | 座標格式是否 WGS84 |
| 待確認：總車位 | `totalSpaces` | 車位資訊 | 建議 | `null` | 是否依車種拆分 |
| 待確認：汽車位 | `carSpaces` | 車種資訊 | 選用 | `null` | raw 欄位名稱 |
| 待確認：機車位 | `motorSpaces` | 車種資訊 | 選用 | `null` | raw 欄位名稱 |
| 待確認：收費方式 | `price` | 卡片顯示 | 選用 | 空字串 | 格式是否為純文字或結構化 |
| 待確認：營業狀態 | `isOpen` / `status` | 狀態 badge | 建議 | `isOpen: null`、`status: unknown` | 狀態 enum 對照 |
| 待確認：更新時間 | `updatedAt` | 資料新鮮度 | 建議 | 空字串 | 時區與格式 |

第十七階段最小 mapping 已先使用下列已觀察欄位：

| TDX raw 欄位 | 內部 model 欄位 | 資料用途 | 是否必要 | 缺漏時處理方式 | 待確認事項 |
| --- | --- | --- | --- | --- | --- |
| `CarParkID` | `id` | 停車場識別 | 是 | 空字串，後續應排除無 ID 資料 | 是否跨 endpoint 穩定 |
| `CarParkName.Zh_tw` | `name` | 卡片標題與搜尋 | 是 | 空字串 | 多語系欄位完整規則 |
| `City` | `city` | 城市識別 | 建議 | 空字串 | 是否所有城市皆提供 |
| `CityCode` / `AuthorityCode` | `cityCode` | 城市代碼 | 建議 | 空字串 | `AuthorityCode` 是否可作為 fallback |
| `Address` | `address` | 顯示與搜尋 | 建議 | 空字串 | 行政區是否需另行解析 |
| `CarParkPosition.PositionLat` | `latitude` | 距離計算 | 建議 | `null` | 座標格式仍需正式確認 |
| `CarParkPosition.PositionLon` | `longitude` | 距離計算 | 建議 | `null` | 座標格式仍需正式確認 |
| `FareDescription` | `price` | 收費顯示 | 選用 | 空字串 | 是否需要結構化費率 |
| `UpdateTime` / `SrcUpdateTime` | `updatedAt` | 資料新鮮度 | 建議 | 空字串 | wrapper 與單筆層級差異 |

### 路外停車場即時剩餘車位

| TDX raw 欄位 | 內部 model 欄位 | 資料用途 | 是否必要 | 缺漏時處理方式 | 待確認事項 |
| --- | --- | --- | --- | --- | --- |
| 待確認：停車場 ID | `id` | 與基本資料 merge | 是 | 無法合併時略過該筆即時資料 | raw 欄位名稱 |
| 待確認：剩餘車位 | `availableSpaces` | 顯示剩餘車位 | 建議 | `null` | 是否包含車種分類 |
| 待確認：總車位 | `totalSpaces` | 補足基本資料 | 選用 | 保留基本資料值 | 是否與基本資料一致 |
| 待確認：營業狀態 | `isOpen` / `status` | 狀態 badge | 建議 | 保留基本資料或 `unknown` | 狀態 enum 對照 |
| 待確認：更新時間 | `updatedAt` | 即時資料時間 | 建議 | 保留基本資料或空字串 | 時區與格式 |

### 路邊停車資料

| TDX raw 欄位 | 內部 model 欄位 | 資料用途 | 是否必要 | 缺漏時處理方式 | 待確認事項 |
| --- | --- | --- | --- | --- | --- |
| 待確認：路段 ID | `sectionId` | 路段資料識別 | 建議 | 空字串 | raw 欄位名稱 |
| 待確認：車格 ID | `spaceId` | 單一車格識別 | 選用 | 空字串 | TDX 是否提供單格資料 |
| 待確認：名稱 | `name` | 卡片標題 | 建議 | 使用路段名稱或空字串 | raw 欄位名稱 |
| 待確認：城市 | `city` | 全台灣資料分區 | 是 | 空字串 | 是否由 endpoint path 或 response 提供 |
| 待確認：城市代碼 | `cityCode` | 查詢與資料來源識別 | 建議 | 空字串 | 是否沿用 TDX city code |
| 待確認：行政區 | `district` | 搜尋與顯示 | 建議 | 空字串 | 是否需要由地址或路段解析 |
| 待確認：路段名稱 | `road` | 顯示路段 | 是 | 空字串 | raw 欄位名稱 |
| 待確認：車格種類 | `spaceType` | 車種或格位類型 | 選用 | 空字串 | raw 欄位名稱 |
| 待確認：緯度 | `latitude` | 距離計算 | 建議 | `null`，不參與距離排序 | 座標格式是否 WGS84 |
| 待確認：經度 | `longitude` | 距離計算 | 建議 | `null`，不參與距離排序 | 座標格式是否 WGS84 |
| 待確認：剩餘格位 | `availableSpaces` | 顯示剩餘格位 | 建議 | `null` | 是路段剩餘數或單格狀態 |
| 待確認：收費方式 | `price` | 卡片顯示 | 選用 | 空字串 | 格式是否為純文字或結構化 |
| 待確認：占用 / 可停狀態 | `status` | 狀態 badge | 建議 | `unknown` | 狀態 enum 對照 |
| 待確認：更新時間 | `updatedAt` | 資料新鮮度 | 建議 | 空字串 | 時區與格式 |

## 9. endpoint 使用策略

第二十九階段開始同時使用 CarPark 基本資料與 ParkingAvailability 即時剩餘車位資料。以 `CarParkID` 合併，CarPark 提供位置與地址，ParkingAvailability 提供剩餘車位與更新時間。

### 首頁附近停車

1. 使用使用者經緯度判斷所在縣市或附近縣市。
2. 向 server-side API request 指定縣市停車資料。
3. 取得路外停車場基本資料。
4. 取得即時剩餘車位。
5. 依停車場 ID merge。
6. normalize 成內部格式。
7. 回傳前端。
8. 前端依使用者位置計算距離並排序，或由 server-side 先排序。

### 停車場搜尋

1. 使用 keyword / city / district 查詢。
2. 取得停車場基本資料。
3. 視需要合併即時剩餘車位。
4. normalize 成內部格式。
5. 回傳前端。

### 最小可行串接建議

第十七階段已選定一個縣市與一組路外停車場 endpoint 做 server-side 最小可行串接測試：

1. `/api/parking?city=Taipei` 由 Vercel Function 取得 server-side access token。
2. 呼叫 `Parking/OffStreet/CarPark/City/{city}`。
3. 使用 `$format=JSON` 取得 JSON；第三十階段起不再使用 `$top=20` 測試限制，避免只回傳前 20 筆。
4. 使用 `server/tdxParkingMapper.js` normalize。
5. 讓 `/api/parking` 回傳內部格式。
6. 前端仍預設使用 mock adapter，尚未正式替換 HomePage / ParkingPage 資料來源。
7. 後續再擴充即時剩餘車位、路邊停車、多縣市與 API adapter 切換策略。

## 10. 待確認問題

- TDX 停車 API 的正式 endpoint path。
- 路外停車場基本資料的正式 raw 欄位名稱。
- 路外停車場即時剩餘車位的正式 raw 欄位名稱。
- 路外停車場出入口資料是否為獨立 endpoint。
- 路邊停車是否提供路段資料、單格資料或兩者皆有。
- 停車場 ID 在不同 endpoint 之間是否完全一致。
- TDX 是否使用 WGS84 經緯度。
- TDX city code 是否可直接作為本專案 `cityCode`。
- OData query 在停車 API 的實際支援範圍。
- 各 endpoint 的 rate limit、快取策略與更新頻率。
