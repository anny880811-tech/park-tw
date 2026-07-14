import { useEffect, useState } from 'react'
import ParkingInfoCard from '../components/parking/ParkingInfoCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import DataStatusNotice from '../components/ui/DataStatusNotice.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import SearchBar from '../components/ui/SearchBar.jsx'
import LocationStatus from '../components/location/LocationStatus.jsx'
import useGeolocation from '../hooks/useGeolocation.js'
import { searchParkingLots } from '../services/parkingService.js'

const PARKING_PAGE_SIZE = 12

const getLatestUpdatedAt = (items = []) => {
  return items.find((item) => item.updatedAt)?.updatedAt || ''
}

const filterParkingLotsByKeyword = (parkingLots = [], keyword = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return parkingLots
  }

  return parkingLots.filter((item) => {
    const searchableText = [
      item.name,
      item.address,
      item.district,
    ].filter(Boolean).join(' ').toLowerCase()

    return searchableText.includes(normalizedKeyword)
  })
}

const ParkingPage = () => {
  const [keyword, setKeyword] = useState('')
  const [dataError, setDataError] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [parkingLots, setParkingLots] = useState([])
  const [parkingMeta, setParkingMeta] = useState(null)
  const {
    status: locationStatus,
    position,
    error: locationError,
    getCurrentLocation,
  } = useGeolocation()
  const isLocationLoading = locationStatus === 'loading'
  const canSortByPosition = locationStatus === 'success' && position
  const filteredParkingLots = filterParkingLotsByKeyword(parkingLots, keyword)
  const hasResults = filteredParkingLots.length > 0
  const totalPages = Math.ceil(filteredParkingLots.length / PARKING_PAGE_SIZE)
  const safeCurrentPage = totalPages > 0
    ? Math.min(currentPage, totalPages)
    : 1
  const startIndex = (safeCurrentPage - 1) * PARKING_PAGE_SIZE
  const visibleParkingLots = filteredParkingLots.slice(
    startIndex,
    startIndex + PARKING_PAGE_SIZE,
  )

  useEffect(() => {
    let isActive = true

    const loadParkingLots = async () => {
      setIsDataLoading(true)
      setDataError('')

      try {
        const locationParams = canSortByPosition
          ? {
              latitude: position.latitude,
              longitude: position.longitude,
            }
          : undefined
        const result = await searchParkingLots(locationParams)

        if (isActive) {
          setParkingLots(result.parkingLots)
          setParkingMeta(result.meta)
          setCurrentPage(1)
        }
      } catch {
        if (isActive) {
          setParkingLots([])
          setParkingMeta(null)
          setDataError('目前無法取得停車資料，請稍後再試。')
        }
      } finally {
        if (isActive) {
          setIsDataLoading(false)
        }
      }
    }

    loadParkingLots()

    return () => {
      isActive = false
    }
  }, [canSortByPosition, position])

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value)
    setCurrentPage(1)
  }

  const handleSearchSubmit = () => {
    setKeyword((currentKeyword) => currentKeyword.trim())
    setCurrentPage(1)
  }

  const handleClearKeyword = () => {
    setKeyword('')
    setCurrentPage(1)
  }
  const updatedAt = getLatestUpdatedAt(filteredParkingLots)

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
                共找到 {filteredParkingLots.length} 筆
                {canSortByPosition ? ' 2 公里內' : ''}
                符合條件的停車場
                {hasResults ? `，第 ${safeCurrentPage} / ${totalPages} 頁` : ''}
              </span>
              <Button
                disabled={isLocationLoading}
                onClick={getCurrentLocation}
                variant="outline"
              >
                {isLocationLoading ? '定位中...' : '使用目前位置排序'}
              </Button>
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

        <LocationStatus
          error={locationError}
          position={position}
          status={locationStatus}
        />

        <div className="mock-data-notice">
          <Badge variant={canSortByPosition ? 'success' : 'secondary'}>
            {canSortByPosition ? '距離排序' : '預設排序'}
          </Badge>
          <p className="mb-0">
            {canSortByPosition
              ? '已篩選你目前位置 2 公里內的停車場，並由近到遠排序。'
              : '尚未取得位置，顯示預設排序；取得定位後會顯示 2 公里內資料。'}
          </p>
        </div>

        <div className="mock-data-notice">
          <Badge variant="secondary">Mock Data</Badge>
          <p className="mb-0">
            以下搜尋結果來自 parkingLots 假資料，僅做前端搜尋示意，尚未串接停車場 API。
          </p>
        </div>

        <DataStatusNotice
          error={dataError}
          isLoading={isDataLoading}
          loadingText="正在搜尋停車場..."
          meta={parkingMeta}
          updatedAt={updatedAt}
        />

        {isDataLoading ? null : hasResults ? (
          <section className="parking-results">
            <div className="parking-results__header">
              <h2>停車場列表</h2>
              <p className="mb-0">
                依目前關鍵字顯示符合條件的停車場。
              </p>
            </div>
            <div className="row g-4">
              {visibleParkingLots.map((item) => (
                <div className="col-12 col-md-6 col-xl-4" key={item.id}>
                  <ParkingInfoCard item={item} />
                </div>
              ))}
            </div>
            <Pagination
              className="mt-4"
              currentPage={safeCurrentPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
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
