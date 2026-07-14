import { useEffect, useState } from 'react'
import NearbyParkingSection from '../components/parking/NearbyParkingSection.jsx'
import LocationStatus from '../components/location/LocationStatus.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import DataStatusNotice from '../components/ui/DataStatusNotice.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useGeolocation from '../hooks/useGeolocation.js'
import { PARKING_PAGE_SIZE } from '../constants/pagination.js'
import { getNearbyParking } from '../services/parkingService.js'

const getLatestUpdatedAt = (items = []) => {
  return items.find((item) => item.updatedAt)?.updatedAt || ''
}

const HomePage = () => {
  const [currentParkingLotPage, setCurrentParkingLotPage] = useState(1)
  const [parkingLots, setParkingLots] = useState([])
  const [streetParkingSpaces, setStreetParkingSpaces] = useState([])
  const [dataError, setDataError] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [parkingMeta, setParkingMeta] = useState(null)
  const {
    status,
    position,
    error,
    getCurrentLocation,
  } = useGeolocation()
  const isLoading = status === 'loading'
  const canSortByPosition = status === 'success' && position

  useEffect(() => {
    let isActive = true

    const loadNearbyParking = async () => {
      setIsDataLoading(true)
      setDataError('')

      try {
        const locationParams = canSortByPosition
          ? {
              latitude: position.latitude,
              longitude: position.longitude,
            }
          : undefined
        const result = await getNearbyParking(locationParams)

        if (isActive) {
          setParkingLots(result.parkingLots)
          setStreetParkingSpaces(result.streetParkingSpaces)
          setParkingMeta(result.meta)
          setCurrentParkingLotPage(1)
        }
      } catch {
        if (isActive) {
          setParkingLots([])
          setStreetParkingSpaces([])
          setParkingMeta(null)
          setDataError('目前無法取得停車資料，請稍後再試。')
        }
      } finally {
        if (isActive) {
          setIsDataLoading(false)
        }
      }
    }

    loadNearbyParking()

    return () => {
      isActive = false
    }
  }, [canSortByPosition, position])
  const updatedAt = getLatestUpdatedAt(parkingLots)
  const hasNearbyParkingData = parkingLots.length > 0 || streetParkingSpaces.length > 0
  const isApiDataSource = parkingMeta?.dataSource === 'api'
  const totalParkingLotPages = Math.ceil(parkingLots.length / PARKING_PAGE_SIZE)
  const safeParkingLotPage = totalParkingLotPages > 0
    ? Math.min(currentParkingLotPage, totalParkingLotPages)
    : 1
  const parkingLotStartIndex = (safeParkingLotPage - 1) * PARKING_PAGE_SIZE
  const visibleParkingLots = parkingLots.slice(
    parkingLotStartIndex,
    parkingLotStartIndex + PARKING_PAGE_SIZE,
  )

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            <Badge variant="primary">附近停車資訊</Badge>
            <h1>停哪裡</h1>
            <p className="home-hero__lead">
              快速找到附近可停車的位置
            </p>
            <p className="home-hero__description">
              使用目前位置查看附近停車場與路邊停車格。
            </p>
            <div className="home-hero__actions">
              <Button
                className="home-hero__button"
                disabled={isLoading}
                onClick={getCurrentLocation}
                variant="primary"
              >
                {isLoading ? '定位中...' : '使用目前位置'}
              </Button>
              <small>定位成功後會顯示 2 公里內停車資料。</small>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-page__content">
        <LocationStatus error={error} position={position} status={status} />

        <DataStatusNotice
          error={dataError}
          isLoading={isDataLoading}
          loadingText="正在載入停車資料..."
          meta={parkingMeta}
          updatedAt={updatedAt}
        />

        <div className="mock-data-notice">
          <Badge variant={canSortByPosition ? 'success' : 'secondary'}>
            {canSortByPosition ? '2 公里內資料' : '預設資料'}
          </Badge>
          <p className="mb-0">
            {canSortByPosition
              ? '已依目前位置篩選 2 公里內停車場，並由近到遠排序。'
              : '尚未取得位置，先顯示預設停車資料。'}
          </p>
        </div>

        {!isDataLoading && !hasNearbyParkingData ? (
          <Card className="empty-state">
            <div className="empty-state__content">
              <Badge variant="secondary">目前無資料</Badge>
              <h2>目前沒有可顯示的停車資料</h2>
              <p className="mb-0">請稍後再試，或改用停車場搜尋頁查詢。</p>
            </div>
          </Card>
        ) : (
          <>
            <NearbyParkingSection
              description={
                canSortByPosition
                  ? `共找到 ${parkingLots.length} 筆 2 公里內停車場，第 ${safeParkingLotPage} / ${totalParkingLotPages} 頁。`
                  : '顯示目前位置附近的路外停車場、剩餘車位與收費資訊；定位後會顯示 2 公里內資料。'
              }
              items={visibleParkingLots}
              title="附近停車場"
            >
              <Pagination
                className="mt-4"
                currentPage={safeParkingLotPage}
                onPageChange={setCurrentParkingLotPage}
                totalPages={totalParkingLotPages}
              />
            </NearbyParkingSection>

            <NearbyParkingSection
              description="顯示目前位置附近的路邊停車格與可用格位。"
              emptyText={
                isApiDataSource
                  ? '目前尚未取得路邊停車格即時資料。'
                  : '目前 2 公里內沒有可顯示的路邊停車格。'
              }
              items={streetParkingSpaces}
              title="附近路邊停車格"
            />
          </>
        )}
      </section>
    </div>
  )
}

export default HomePage
