import { useEffect, useState } from 'react'
import HomeParkingMap from '../components/map/HomeParkingMap.jsx'
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
import { TEST_LANDMARKS } from '../constants/testLandmarks.js'
import { VEHICLE_FILTERS } from '../constants/vehicleTypes.js'
import { getNearbyParking } from '../services/parkingService.js'

const PARKING_DISPLAY_CATEGORIES = {
  PARKING_LOTS: 'parkingLots',
  STREET_PARKING: 'streetParking',
}
const HOME_HERO_MODES = {
  NEARBY: 'nearby',
  ATTRACTIONS: 'attractions',
}
const HOME_MAP_CITY = 'Taichung'

const HomePage = () => {
  const [currentParkingLotPage, setCurrentParkingLotPage] = useState(1)
  const [currentStreetParkingPage, setCurrentStreetParkingPage] = useState(1)
  const [activeParkingCategory, setActiveParkingCategory] = useState(
    PARKING_DISPLAY_CATEGORIES.PARKING_LOTS,
  )
  const [parkingLots, setParkingLots] = useState([])
  const [streetParkingSpaces, setStreetParkingSpaces] = useState([])
  const [mapParkingLots, setMapParkingLots] = useState([])
  const [mapStreetParkingSpaces, setMapStreetParkingSpaces] = useState([])
  const [selectedVehicleType, setSelectedVehicleType] = useState(VEHICLE_FILTERS.ALL)
  const [activeHeroMode, setActiveHeroMode] = useState(HOME_HERO_MODES.NEARBY)
  const [selectedLandmark, setSelectedLandmark] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [parkingMeta, setParkingMeta] = useState(null)
  const {
    status,
    position,
    getCurrentLocation,
  } = useGeolocation()
  const isLoading = status === 'loading'
  const currentPosition = status === 'success' ? position : null
  const activePosition = activeHeroMode === HOME_HERO_MODES.ATTRACTIONS
    ? selectedLandmark
    : currentPosition

  useEffect(() => {
    let isActive = true

    const loadNearbyParking = async () => {
      setIsDataLoading(true)

      try {
        const locationParams = activePosition
          ? {
              city: activePosition.city || HOME_MAP_CITY,
              latitude: activePosition.latitude,
              longitude: activePosition.longitude,
              vehicleType: selectedVehicleType,
            }
          : {
              vehicleType: selectedVehicleType,
            }
        const result = await getNearbyParking(locationParams)
        const mapResult = activePosition
          ? await getNearbyParking({
              city: HOME_MAP_CITY,
              vehicleType: selectedVehicleType,
            })
          : result

        if (isActive) {
          setParkingLots(result.parkingLots)
          setStreetParkingSpaces(result.streetParkingSpaces)
          setMapParkingLots(mapResult.parkingLots)
          setMapStreetParkingSpaces(mapResult.streetParkingSpaces)
          setParkingMeta(result.meta)
          setCurrentParkingLotPage(1)
          setCurrentStreetParkingPage(1)
        }
      } catch {
        if (isActive) {
          setParkingLots([])
          setStreetParkingSpaces([])
          setMapParkingLots([])
          setMapStreetParkingSpaces([])
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
  const handleParkingCategoryChange = (category) => {
    setActiveParkingCategory(category)
  }
  const handleHeroModeChange = (mode) => {
    setActiveHeroMode(mode)
    setCurrentParkingLotPage(1)
    setCurrentStreetParkingPage(1)

    if (mode === HOME_HERO_MODES.NEARBY) {
      setSelectedLandmark(null)
    }
  }
  const handleCurrentLocationClick = () => {
    setActiveHeroMode(HOME_HERO_MODES.NEARBY)
    setSelectedLandmark(null)
    getCurrentLocation()
  }
  const handleSelectLandmark = (landmark) => {
    setActiveHeroMode(HOME_HERO_MODES.ATTRACTIONS)
    setSelectedLandmark(landmark)
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
          <div
            className={[
              'home-hero__layout',
              activeHeroMode === HOME_HERO_MODES.ATTRACTIONS
                ? 'home-hero__layout--attractions'
                : '',
            ].filter(Boolean).join(' ')}
          >
            <p className="home-hero__lead">
              快速找到附近可停車的位置
            </p>
            <div aria-label="首頁搜尋模式" className="home-hero__mode-switcher">
              <Button
                onClick={() => handleHeroModeChange(HOME_HERO_MODES.NEARBY)}
                variant={activeHeroMode === HOME_HERO_MODES.NEARBY ? 'primary' : 'outline'}
              >
                搜尋附近
              </Button>
              <Button
                onClick={() => handleHeroModeChange(HOME_HERO_MODES.ATTRACTIONS)}
                variant={activeHeroMode === HOME_HERO_MODES.ATTRACTIONS ? 'primary' : 'outline'}
              >
                台中熱門景點
              </Button>
            </div>
            <div className="home-hero__map">
              <HomeParkingMap
                focusPosition={activePosition}
                parkingLots={mapParkingLots}
                streetParkingSpaces={mapStreetParkingSpaces}
                userPosition={currentPosition}
              />
            </div>
            <Button
              className="home-hero__button"
              disabled={isLoading}
              onClick={handleCurrentLocationClick}
              variant="primary"
            >
              {isLoading ? '定位中...' : '使用目前位置'}
            </Button>
            {activeHeroMode === HOME_HERO_MODES.ATTRACTIONS && (
              <div aria-label="台中熱門景點" className="home-hero__landmarks">
                {TEST_LANDMARKS.map((landmark) => (
                  <Button
                    key={landmark.id}
                    onClick={() => handleSelectLandmark(landmark)}
                    variant={selectedLandmark?.id === landmark.id ? 'primary' : 'outline'}
                  >
                    {landmark.name}
                  </Button>
                ))}
              </div>
            )}
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
            <div className="parking-category-switcher">
              <h2>附近停車資訊</h2>
              <div aria-label="停車資訊分類" className="parking-category-switcher__actions">
                <Button
                  onClick={() => handleParkingCategoryChange(PARKING_DISPLAY_CATEGORIES.PARKING_LOTS)}
                  variant={
                    activeParkingCategory === PARKING_DISPLAY_CATEGORIES.PARKING_LOTS
                      ? 'primary'
                      : 'outline'
                  }
                >
                  停車場
                </Button>
                <Button
                  onClick={() => handleParkingCategoryChange(PARKING_DISPLAY_CATEGORIES.STREET_PARKING)}
                  variant={
                    activeParkingCategory === PARKING_DISPLAY_CATEGORIES.STREET_PARKING
                      ? 'primary'
                      : 'outline'
                  }
                >
                  路邊停車格
                </Button>
              </div>
            </div>

            {activeParkingCategory === PARKING_DISPLAY_CATEGORIES.PARKING_LOTS ? (
              <NearbyParkingSection items={visibleParkingLots}>
                <Pagination
                  className="mt-4"
                  currentPage={safeParkingLotPage}
                  onPageChange={setCurrentParkingLotPage}
                  totalPages={totalParkingLotPages}
                />
              </NearbyParkingSection>
            ) : (
              <NearbyParkingSection
                emptyText={streetParkingEmptyText}
                items={visibleStreetParkingSpaces}
              >
                <Pagination
                  className="mt-4"
                  currentPage={safeStreetParkingPage}
                  onPageChange={setCurrentStreetParkingPage}
                  totalPages={totalStreetParkingPages}
                />
              </NearbyParkingSection>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default HomePage
