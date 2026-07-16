# 全台灣縣市停車資料可用性盤點

## 1. 盤點目的

本文件記錄 `/api/parking?city={city}` 對台灣各縣市的資料可用性、欄位完整度、錯誤狀態與後續修正優先順序。

本階段只做盤點與紀錄，不大規模修改 API、mapper 或 UI。

MVP v1 產品正式支援範圍為臺中市。其他縣市目前僅作為資料可用性盤點與後續擴充評估，不宣稱已完整支援全台灣。

## 2. 測試日期與環境

- 測試日期：2026-07-16
- 測試 API base URL：`https://park-tw.vercel.app`
- 測試入口：`/api/parking?city={city}`
- 測試方式：使用 `scripts/checkParkingCoverage.mjs`
- 測試限制：本輪遇到第一個 429 後停止，避免對上游 API 造成連續壓力。

## 3. 測試方法

診斷腳本採用以下安全規則：

- 只呼叫本專案 `/api/parking?city={city}`。
- 不直接呼叫 TDX。
- 不讀取或輸出 `TDX_CLIENT_ID`、`TDX_CLIENT_SECRET`、Access Token、Authorization header。
- concurrency 固定為 1。
- 每次請求間隔 3 秒。
- 每次請求 timeout 為 15 秒。
- 不做無限制 retry。
- 遇到 429 立即記錄並停止本輪測試。
- 不輸出完整 API response，只輸出統計摘要。

## 4. 速率限制與注意事項

本輪測試結果：

- 臺北市完成有效測試。
- 新北市請求觸發 `streetParkingStatus: 429`，且 response `meta.city` 為 `Taichung`，代表目前 API route 對 `NewTaipei` 仍 fallback 到 `Taichung`。
- 依規則遇到 429 後停止本輪測試。
- 因 MVP v1 正式支援臺中市，另以單城市模式補測 `Taichung`，確認臺中市資料狀態。
- 其餘縣市尚未測試，不可宣稱已完成全台盤點。

## 5. 縣市 city query 對照

目前 `api/parking.js` 實際支援的 city mapping 只有：

| 專案支援狀態 | city query |
|---|---|
| 已支援 | `Taipei` |
| 已支援 | `Taichung` |

本輪候選 city query：

| 縣市 | city query | 本輪狀態 |
|---|---|---|
| 臺北市 | `Taipei` | 已測試 |
| 新北市 | `NewTaipei` | 請求後 fallback 到 `Taichung`，且遇到 429 |
| 桃園市 | `Taoyuan` | 因 rate limit 未測試 |
| 臺中市 | `Taichung` | 已單獨補測，MVP v1 正式支援 |
| 臺南市 | `Tainan` | 因 rate limit 未測試 |
| 高雄市 | `Kaohsiung` | 因 rate limit 未測試 |
| 基隆市 | `Keelung` | 因 rate limit 未測試 |
| 新竹市 | `Hsinchu` | 因 rate limit 未測試 |
| 嘉義市 | `Chiayi` | 因 rate limit 未測試 |
| 新竹縣 | `HsinchuCounty` | 因 rate limit 未測試 |
| 苗栗縣 | `MiaoliCounty` | 因 rate limit 未測試 |
| 彰化縣 | `ChanghuaCounty` | 因 rate limit 未測試 |
| 南投縣 | `NantouCounty` | 因 rate limit 未測試 |
| 雲林縣 | `YunlinCounty` | 因 rate limit 未測試 |
| 嘉義縣 | `ChiayiCounty` | 因 rate limit 未測試 |
| 屏東縣 | `PingtungCounty` | 因 rate limit 未測試 |
| 宜蘭縣 | `YilanCounty` | 因 rate limit 未測試 |
| 花蓮縣 | `HualienCounty` | 因 rate limit 未測試 |
| 臺東縣 | `TaitungCounty` | 因 rate limit 未測試 |
| 澎湖縣 | `PenghuCounty` | 因 rate limit 未測試 |
| 金門縣 | `KinmenCounty` | 因 rate limit 未測試 |
| 連江縣 | `LienchiangCounty` | 因 rate limit 未測試 |

## 6. 全台資料可用性總表

| 縣市 | city query | HTTP | 路外筆數 | 路外有效座標 | 路邊筆數 | 路邊有效座標 | 汽車 | 機車 | 路外 2km | 路邊 2km | 狀態 | 備註 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|---|---|
| 臺北市 | `Taipei` | 200 | 175 | 175 | 2397 | 2397 | 168 | 61 | 可 | 可 | 完整支援 | 路邊資料有 50 個重複 id；路邊車種辨識覆蓋率偏低 |
| 新北市 | `NewTaipei` | 200 | 1509 | 1509 | 0 | 0 | 1441 | 222 | 可 | 目前無可篩選資料 | 受流量限制，待補測 | response `meta.city` 為 `Taichung`，不可視為新北資料；`streetParkingStatus: 429` |
| 桃園市 | `Taoyuan` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 臺中市 | `Taichung` | 200 | 1509 | 1509 | 406 | 406 | 1650 | 226 | 可 | 可 | MVP v1 正式支援 | 路外與路邊皆有座標；路邊車種辨識 213 / 406 |
| 臺南市 | `Tainan` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 高雄市 | `Kaohsiung` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 基隆市 | `Keelung` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 新竹市 | `Hsinchu` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 嘉義市 | `Chiayi` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 新竹縣 | `HsinchuCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 苗栗縣 | `MiaoliCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 彰化縣 | `ChanghuaCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 南投縣 | `NantouCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 雲林縣 | `YunlinCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 嘉義縣 | `ChiayiCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 屏東縣 | `PingtungCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 宜蘭縣 | `YilanCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 花蓮縣 | `HualienCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 臺東縣 | `TaitungCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 澎湖縣 | `PenghuCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 金門縣 | `KinmenCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |
| 連江縣 | `LienchiangCounty` | - | - | - | - | - | - | - | 尚未確認 | 尚未確認 | 因 429 未完成 | 待補測 |

## 7. 路外停車場盤點

本輪有效路外資料：

- 臺北市：175 筆路外停車場，175 筆有有效座標。
- 臺北市路外 `availableSpaces` 有效數字：122 筆。
- 臺北市路外 `totalSpaces` 有效數字：122 筆。
- 臺北市路外 `vehicleTypes` 非空：175 筆。
- 臺中市：1509 筆路外停車場，1509 筆有有效座標。
- 臺中市路外 `availableSpaces` 有效數字：1102 筆。
- 臺中市路外 `totalSpaces` 有效數字：1102 筆。
- 臺中市路外 `vehicleTypes` 非空：1509 筆。

新北市本輪 response fallback 到 `Taichung`，因此該筆資料不可作為新北市路外資料判定。

## 8. 路邊停車資料盤點

本輪有效路邊資料：

- 臺北市：2397 筆路邊停車資料，2397 筆有有效座標。
- 臺北市路邊 `availableSpaces` 有效數字：0 筆。
- 臺北市路邊 `totalSpaces` 有效數字：0 筆。
- 臺北市路邊 `vehicleTypes` 非空：9 筆。
- 臺北市路邊重複 id：50 個。
- 臺中市：406 筆路邊停車資料，406 筆有有效座標。
- 臺中市路邊 `availableSpaces` 有效數字：0 筆。
- 臺中市路邊 `totalSpaces` 有效數字：0 筆。
- 臺中市路邊 `vehicleTypes` 非空：213 筆。
- 臺中市路邊重複 id：0 個。

新北市本輪 `streetParkingStatus: 429`，且 response fallback 到 `Taichung`，不可判定新北市路邊資料可用性。

## 9. 座標完整度

- 臺北市路外資料座標完整度：175 / 175。
- 臺北市路邊資料座標完整度：2397 / 2397。
- 臺中市路外資料座標完整度：1509 / 1509。
- 臺中市路邊資料座標完整度：406 / 406。
- 其餘縣市本輪未完成測試。

## 10. 車種資料完整度

臺北市：

- 路外 `vehicleTypes` 非空：175 / 175。
- 路外可辨識汽車：167。
- 路外可辨識機車：53。
- 路邊 `vehicleTypes` 非空：9 / 2397。
- 路邊可辨識汽車：1。
- 路邊可辨識機車：8。

臺中市：

- 路外 `vehicleTypes` 非空：1509 / 1509。
- 路外可辨識汽車：1441。
- 路外可辨識機車：222。
- 路邊 `vehicleTypes` 非空：213 / 406。
- 路邊可辨識汽車：209。
- 路邊可辨識機車：4。

注意：`vehicleTypes: []` 不代表資料錯誤，只代表資料來源未提供或 mapper 無法可靠辨識車種。

## 11. 錯誤與 rate limit 紀錄

| 縣市 | city query | 狀態 | 說明 |
|---|---|---|---|
| 新北市 | `NewTaipei` | 429 | response `meta.city` 為 `Taichung`，且 `streetParkingStatus: 429`，本輪依規則停止 |

## 12. 支援程度分類

| 分類 | 縣市 |
|---|---|
| 完整支援 | 臺北市、臺中市 |
| 部分支援 | 無法於本輪確認 |
| 目前無資料 | 無法於本輪確認 |
| 受流量限制，待補測 | 新北市與其後未測縣市 |
| city mapping 或 endpoint 待確認 | 新北市與其他尚未加入 `SUPPORTED_CITIES` 的縣市 |
| API 或上游服務錯誤 | 無法於本輪確認 |

## 13. 已知限制

- MVP v1 產品正式支援範圍為臺中市。
- `api/parking.js` 目前 `SUPPORTED_CITIES` 只包含 `Taipei` 與 `Taichung`。
- 未支援的 city query 目前會 fallback 到 `Taichung`，因此全台盤點前必須先修正 city mapping，否則結果會失真。
- 本輪遇到 `streetParkingStatus: 429` 後停止，未完成 22 縣市測試。
- 臺北市路邊資料有座標，但車種辨識覆蓋率偏低。
- 臺北市路邊資料有重複 id，後續需評估是否在 mapper 或 service 層去重。

## 14. 後續修正優先順序

### P0：核心阻擋

1. 補齊 `/api/parking` 的全台 city mapping，避免未支援 city fallback 成 `Taichung` 造成盤點失真。
2. 保持 API response 不含 token、secret 或 Authorization header。

### P1：主要城市無法使用

1. 先補六都 city mapping：`NewTaipei`、`Taoyuan`、`Kaohsiung`、`Tainan`。
2. 補測六都路外與路邊資料。

### P2：部分資料缺漏

1. 改善路邊資料車種辨識覆蓋率。
2. 檢查路邊資料重複 id。
3. 評估路邊剩餘車位資料來源。

### P3：顯示與文件問題

1. UI 空狀態需能區分「沒有資料」與「資料取得失敗 / rate limit」。
2. 文件需標示目前全台盤點尚未完成。

## 摘要統計

- 本輪已完成有效測試縣市數：2。
- 實際發出請求縣市數：3。
- MVP v1 正式支援縣市數：1，為臺中市。
- 完整支援數：2。
- 部分支援數：0。
- 目前無資料數：0。
- 因 429 未完成數：20。
- city mapping 待確認數：至少 20。
- server error 數：0。

本輪已完成 2 個縣市，其中臺中市為 MVP v1 正式支援縣市；其餘 20 個因 rate limit、city mapping fallback 或尚未測試待補測。

## 未來六都擴充建議順序

1. 新北市：人口與停車需求高，但目前 `NewTaipei` 會 fallback 到 `Taichung`，需先補 city mapping。
2. 桃園市：六都之一，適合作為第二波擴充。
3. 高雄市：都會區停車需求高，建議優先確認路外與路邊資料完整度。
4. 臺南市：六都之一，建議在上述城市後補測與整合。
