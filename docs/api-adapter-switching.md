# API Adapter 切換策略

## 1. 目的

本文件說明 `parkingService` 如何在 mock adapter 與 api adapter 之間切換，讓後續可以逐步從 mock data 過渡到 Vercel Function `/api/parking`。

本階段只建立切換機制，不把前端預設切到真實 API，也不修改 HomePage / ParkingPage UI。

## 2. 目前資料流

預設資料流仍為：

```text
HomePage / ParkingPage
parkingService
mockParkingAdapter
mockParkingData.js
```

未來測試 API adapter 時，可切換為：

```text
HomePage / ParkingPage
parkingService
apiParkingAdapter
/api/parking
Vercel Function
TDX API
```

## 3. 支援的資料來源

目前支援兩種公開資料來源設定：

```text
mock
api
```

對應常數位於：

```text
src/config/parkingDataSource.js
```

## 4. 預設使用 mock adapter 的原因

未設定任何環境變數時，`parkingService` 預設使用 mock adapter。

原因：

- 本地開發不需要 TDX credentials。
- HomePage / ParkingPage 可維持穩定展示。
- 避免 Preview 或 API 錯誤影響前端 UI。
- TDX Client Secret 仍只存在 server-side，不進入 React 前端。

## 5. 如何切換到 api adapter

未來可以透過公開前端設定切換：

```text
VITE_PARKING_DATA_SOURCE=api
```

若設定為：

```text
VITE_PARKING_DATA_SOURCE=mock
```

或未設定，會使用 mock adapter。

注意：`VITE_PARKING_DATA_SOURCE` 是公開前端設定，只能用來切換資料來源，不可放任何 secret。

## 6. API 錯誤 fallback 策略

當 `VITE_PARKING_DATA_SOURCE=api` 時：

1. `parkingService` 會先呼叫 `apiParkingAdapter`。
2. `apiParkingAdapter` 只呼叫本專案 API route，例如 `/api/parking`。
3. 若 API request 失敗，`parkingService` 會 fallback 到 mock adapter。
4. fallback response 會保留原本 `parkingLots` / `streetParkingSpaces` 結構，並附加 `meta`。

fallback meta 範例：

```js
{
  dataSource: 'mock',
  fallback: true,
  fallbackReason: 'API request failed.',
}
```

## 7. 安全注意事項

- 不建立 `.env`。
- 不把 `TDX_CLIENT_ID` 放到 React 前端。
- 不把 `TDX_CLIENT_SECRET` 放到 React 前端。
- 不使用 `VITE_TDX_CLIENT_SECRET`。
- 不把 Access Token 放到前端。
- Client Secret 只存在 Vercel Function 等 server-side 環境。
- React 前端只呼叫 `/api/parking`，不直接呼叫 TDX。
- `VITE_PARKING_DATA_SOURCE` 是公開設定，不是 secret。

## 8. 後續階段建議

- 第二十三階段開始測試 HomePage API mode。預設仍使用 mock adapter；若設定 `VITE_PARKING_DATA_SOURCE=api`，HomePage 會透過 `parkingService` 使用 api adapter 呼叫 `/api/parking`。
- React 前端不直接呼叫 TDX，也不保存 token 或 secret。
- 目前 HomePage API mode 先以 city query 測試，預設測試城市為 `Taichung`，尚未完成使用者經緯度轉縣市。
- 第二十四階段開始測試 ParkingPage API mode。預設仍使用 mock adapter；若設定 `VITE_PARKING_DATA_SOURCE=api`，ParkingPage 會透過 `parkingService` 使用 api adapter 呼叫 `/api/parking`。
- 目前 ParkingPage API mode 先以預設 city query 測試，尚未完成縣市選擇器、全台搜尋或 TDX keyword server-side search；keyword 暫時只做 client-side filter。
- 第二十五階段整理 API mode 下的 Loading / Error / Empty State。HomePage 與 ParkingPage 在 API mode 下需避免畫面 crash，並顯示安全的資料來源、fallback 與空狀態提示。
- 第二十八階段開始統一處理使用者座標距離排序。HomePage 與 ParkingPage 都會在取得使用者座標後，將資料依距離由近到遠排序；沒有座標的資料會保留顯示並排在後面。
- 第二十九階段後，API adapter 接收 `/api/parking` 合併後資料；前端仍只透過 `parkingService` 與 `/api/parking`，不直接呼叫 TDX。
- 第三十階段開始移除僅顯示 20 筆的限制。ParkingPage 會以使用者座標為中心，保留 2 公里內符合條件的資料，並在畫面層以每頁 12 張卡片分頁顯示；搜尋、定位或資料重新載入後會回到第 1 頁。
- Production 若要啟用 API mode，需設定公開前端變數 `VITE_PARKING_DATA_SOURCE=api`；未設定時預設仍使用 mock adapter。
- 在 Vercel Preview 驗證 `/api/parking?city=Taipei` 成功後，再測試 `VITE_PARKING_DATA_SOURCE=api`。
- 補齊 `/api/parking` 對 keyword / city / district 的查詢策略。
- 加入路外停車場即時剩餘車位 endpoint，並與基本資料 merge。
- 規劃 UI 顯示目前資料來源與 fallback 狀態，但不要暴露任何 token 或 secret。
