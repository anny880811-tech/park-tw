import { useEffect, useState } from 'react'
import NearbyParkingSection from '../components/parking/NearbyParkingSection.jsx'
import VehicleTypeFilter from '../components/parking/VehicleTypeFilter.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import useGeolocation from '../hooks/useGeolocation.js'
import {
  MAX_PARKING_PAGES,
  MAX_PARKING_RESULTS,
  PARKING_PAGE_SIZE,
} from '../constants/pagination.js'
import { VEHICLE_FILTERS } from '../constants/vehicleTypes.js'
import { getNearbyParking } from '../services/parkingService.js'

const HomePage = () => {
  const [currentParkingLotPage, setCurrentParkingLotPage] = useState(1)
  const [currentStreetParkingPage, setCurrentStreetParkingPage] = useState(1)
  const [parkingLots, setParkingLots] = useState([])
  const [streetParkingSpaces, setStreetParkingSpaces] = useState([])
  const [selectedVehicleType, setSelectedVehicleType] = useState(VEHICLE_FILTERS.ALL)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [parkingMeta, setParkingMeta] = useState(null)
  const {
    status,
    position,
    getCurrentLocation,
  } = useGeolocation()
  const isLoading = status === 'loading'
  const activePosition = status === 'success' ? position : null
  const canSortByPosition = Boolean(activePosition)

  useEffect(() => {
    let isActive = true

    const loadNearbyParking = async () => {
      setIsDataLoading(true)

      try {
        const locationParams = activePosition
          ? {
              latitude: activePosition.latitude,
              longitude: activePosition.longitude,
              vehicleType: selectedVehicleType,
            }
          : {
              vehicleType: selectedVehicleType,
            }
        const result = await getNearbyParking(locationParams)

        if (isActive) {
          setParkingLots(result.parkingLots)
          setStreetParkingSpaces(result.streetParkingSpaces)
          setParkingMeta(result.meta)
          setCurrentParkingLotPage(1)
          setCurrentStreetParkingPage(1)
        }
      } catch {
        if (isActive) {
          setParkingLots([])
          setStreetParkingSpaces([])
          setParkingMeta(null)
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
  }, [activePosition, selectedVehicleType])
  const hasNearbyParkingData = parkingLots.length > 0 || streetParkingSpaces.length > 0
  const isApiDataSource = parkingMeta?.dataSource === 'api'
  const pagedParkingLots = parkingLots.slice(0, MAX_PARKING_RESULTS)
  const pagedStreetParkingSpaces = streetParkingSpaces.slice(0, MAX_PARKING_RESULTS)
  const totalParkingLotPages = Math.min(
    Math.ceil(pagedParkingLots.length / PARKING_PAGE_SIZE),
    MAX_PARKING_PAGES,
  )
  const totalStreetParkingPages = Math.min(
    Math.ceil(pagedStreetParkingSpaces.length / PARKING_PAGE_SIZE),
    MAX_PARKING_PAGES,
  )
  const safeParkingLotPage = totalParkingLotPages > 0
    ? Math.min(currentParkingLotPage, totalParkingLotPages)
    : 1
  const safeStreetParkingPage = totalStreetParkingPages > 0
    ? Math.min(currentStreetParkingPage, totalStreetParkingPages)
    : 1
  const parkingLotStartIndex = (safeParkingLotPage - 1) * PARKING_PAGE_SIZE
  const streetParkingStartIndex = (safeStreetParkingPage - 1) * PARKING_PAGE_SIZE
  const visibleParkingLots = pagedParkingLots.slice(
    parkingLotStartIndex,
    parkingLotStartIndex + PARKING_PAGE_SIZE,
  )
  const visibleStreetParkingSpaces = pagedStreetParkingSpaces.slice(
    streetParkingStartIndex,
    streetParkingStartIndex + PARKING_PAGE_SIZE,
  )
  const handleVehicleTypeChange = (vehicleType) => {
    setSelectedVehicleType(vehicleType)
    setCurrentParkingLotPage(1)
    setCurrentStreetParkingPage(1)
  }
  const streetParkingEmptyText = selectedVehicleType === VEHICLE_FILTERS.ALL
    ? isApiDataSource
      ? '目前尚未取得路邊停車格即時資料。'
      : '目前 2 公里內沒有可顯示的路邊停車格。'
    : '目前 2 公里內沒有符合所選車種的路邊停車格。'

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__content">
            {/* <Badge variant="primary">附近停車資訊</Badge>
            <div className="home-hero__title-row">
              <h1>停哪裡</h1>
              
            </div> */}
            <p className="home-hero__lead">
              快速找到附近可停車的位置
            </p>
            <p className="home-hero__description">
              使用目前位置查看附近停車場與路邊停車格。
            </p>
            <Button
                className="home-hero__button"
                disabled={isLoading}
                onClick={() => {
                  getCurrentLocation()
                }}
                variant="primary"
              >
                {isLoading ? '定位中...' : '使用目前位置'}
              </Button>
          </div>
        </div>
      </section>

      <section className="container home-page__content">
        <VehicleTypeFilter
          onChange={handleVehicleTypeChange}
          value={selectedVehicleType}
        />

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
                  ? `共顯示 ${pagedParkingLots.length} 筆停車場，第 ${safeParkingLotPage} / ${totalParkingLotPages} 頁。`
                  : '顯示目前可用的路外停車場、剩餘車位與收費資訊。'
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
              description={
                canSortByPosition && pagedStreetParkingSpaces.length > 0
                  ? `共顯示 ${pagedStreetParkingSpaces.length} 筆路邊停車格，第 ${safeStreetParkingPage} / ${totalStreetParkingPages} 頁。`
                  : '顯示目前可用的路邊停車格與可用格位。'
              }
              emptyText={streetParkingEmptyText}
              items={visibleStreetParkingSpaces}
              title="附近路邊停車格"
            >
              <Pagination
                className="mt-4"
                currentPage={safeStreetParkingPage}
                onPageChange={setCurrentStreetParkingPage}
                totalPages={totalStreetParkingPages}
              />
            </NearbyParkingSection>
          </>
        )}
      </section>
    </div>
  )
}

export default HomePage
