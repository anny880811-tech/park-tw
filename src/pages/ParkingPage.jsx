import { useEffect, useState } from 'react'
import ParkingInfoCard from '../components/parking/ParkingInfoCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import SearchBar from '../components/ui/SearchBar.jsx'
import { searchParkingLots } from '../services/parkingService.js'

const ParkingPage = () => {
  const [keyword, setKeyword] = useState('')
  const [filteredParkingLots, setFilteredParkingLots] = useState([])
  const [parkingMeta, setParkingMeta] = useState(null)
  const hasResults = filteredParkingLots.length > 0

  useEffect(() => {
    let isActive = true

    const loadParkingLots = async () => {
      const result = await searchParkingLots({ keyword })

      if (isActive) {
        setFilteredParkingLots(result.parkingLots)
        setParkingMeta(result.meta)
      }
    }

    loadParkingLots()

    return () => {
      isActive = false
    }
  }, [keyword])

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value)
  }

  const handleSearchSubmit = () => {
    setKeyword((currentKeyword) => currentKeyword.trim())
  }

  const handleClearKeyword = () => {
    setKeyword('')
  }

  const dataSourceLabel = parkingMeta?.fallback
    ? 'Mock Data（API fallback）'
    : parkingMeta?.dataSource === 'api'
      ? 'TDX API'
      : 'Mock Data'
  const dataSourceDescription = parkingMeta?.fallback
    ? 'API 資料暫時無法取得，已自動改用 mock data，避免搜尋頁中斷。'
    : parkingMeta?.dataSource === 'api'
      ? '目前為 API mode，搜尋頁透過本專案 /api/parking 取得資料，關鍵字暫以 client-side filter 處理。'
      : '目前使用 mock data，未設定 VITE_PARKING_DATA_SOURCE 時會維持此模式。'

  return (
    <div className="parking-page">
      <section className="parking-page__header">
        <div className="container">
          <div className="parking-page__intro">
            <Badge variant="primary">Parking Search</Badge>
            <h1>停車場搜尋</h1>
            <p className="lead mb-0">
              輸入停車場名稱、地址或行政區，快速查看符合條件的停車場。
            </p>
          </div>
        </div>
      </section>

      <section className="container parking-page__content">
        <Card className="parking-search-panel">
          <div className="parking-search-panel__content">
            <div>
              <h2>搜尋停車場</h2>
              <p className="mb-0">
                可嘗試輸入「西屯」、「市政」或「台中」查看前端假資料篩選結果。
              </p>
            </div>
            <SearchBar
              buttonText="搜尋"
              onChange={handleKeywordChange}
              onSubmit={handleSearchSubmit}
              placeholder="搜尋停車場名稱、地址或行政區"
              value={keyword}
            />
            <div className="parking-search-panel__meta">
              <span>
                顯示 {filteredParkingLots.length} 筆停車場
              </span>
              {keyword && (
                <Button
                  className="parking-search-panel__clear"
                  onClick={handleClearKeyword}
                  variant="outline"
                >
                  清除搜尋
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="mock-data-notice">
          <Badge variant="secondary">Mock Data</Badge>
          <p className="mb-0">
            以下搜尋結果來自 parkingLots 假資料，僅做前端搜尋示意，尚未串接停車場 API。
          </p>
        </div>

        <div className="mock-data-notice">
          <Badge variant={parkingMeta?.dataSource === 'api' && !parkingMeta?.fallback ? 'primary' : 'secondary'}>
            {dataSourceLabel}
          </Badge>
          <p className="mb-0">{dataSourceDescription}</p>
        </div>

        {hasResults ? (
          <section className="parking-results">
            <div className="parking-results__header">
              <h2>停車場列表</h2>
              <p className="mb-0">
                依目前關鍵字顯示符合條件的停車場。
              </p>
            </div>
            <div className="row g-4">
              {filteredParkingLots.map((item) => (
                <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                  <ParkingInfoCard item={item} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <Card className="empty-state">
            <div className="empty-state__content">
              <Badge variant="secondary">查無結果</Badge>
              <h2>找不到符合條件的停車場</h2>
              <p className="mb-0">
                請嘗試輸入其他地點、行政區或停車場名稱。
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}

export default ParkingPage
