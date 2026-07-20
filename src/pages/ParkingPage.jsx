import { useEffect, useState } from 'react'
import ParkingInfoCard from '../components/parking/ParkingInfoCard.jsx'
import VehicleTypeFilter from '../components/parking/VehicleTypeFilter.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Pagination from '../components/ui/Pagination.jsx'
import SearchBar from '../components/ui/SearchBar.jsx'
import { searchParkingLots } from '../services/parkingService.js'
import {
  findSearchLandmarkByKeyword,
  TEST_LANDMARKS,
} from '../constants/testLandmarks.js'
import { VEHICLE_FILTERS } from '../constants/vehicleTypes.js'

const PARKING_SEARCH_CITY = 'Taichung'
const PARKING_SEARCH_PAGE_SIZE = 12
const ALL_DISTRICTS_LABEL = '全部行政區'
const TAICHUNG_DISTRICT_GROUPS = [
  {
    title: '市中心',
    districts: ['中區', '東區', '南區', '西區', '北區'],
  },
  {
    title: '屯區',
    districts: ['西屯區', '南屯區', '北屯區'],
  },
  {
    title: '山線',
    districts: ['豐原區', '潭子區', '大雅區', '神岡區', '后里區', '東勢區', '石岡區', '新社區', '和平區'],
  },
  {
    title: '海線',
    districts: ['沙鹿區', '清水區', '梧棲區', '龍井區', '大肚區', '大甲區', '外埔區', '大安區'],
  },
  {
    title: '大屯',
    districts: ['大里區', '太平區', '烏日區', '霧峰區'],
  },
]

const filterParkingLots = (parkingLots = [], keyword = '', district = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  return parkingLots.filter((item) => {
    const matchesDistrict = district ? item.district === district : true
    const searchableText = [
      item.name,
      item.address,
      item.district,
    ].filter(Boolean).join(' ').toLowerCase()
    const matchesKeyword = normalizedKeyword
      ? searchableText.includes(normalizedKeyword)
      : true

    return matchesDistrict && matchesKeyword
  })
}

const ParkingPage = () => {
  const [keyword, setKeyword] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [parkingLots, setParkingLots] = useState([])
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedLandmark, setSelectedLandmark] = useState(null)
  const [selectedVehicleType, setSelectedVehicleType] = useState(VEHICLE_FILTERS.ALL)
  const isLandmarkSearch = Boolean(selectedLandmark)
  const isKeywordSearch = Boolean(keyword.trim())
  const hasDistrictFilter = Boolean(selectedDistrict)
  const filteredParkingLots = filterParkingLots(parkingLots, keyword, selectedDistrict)
  const hasResults = filteredParkingLots.length > 0
  const totalPages = Math.ceil(filteredParkingLots.length / PARKING_SEARCH_PAGE_SIZE)
  const safeCurrentPage = totalPages > 0
    ? Math.min(currentPage, totalPages)
    : 1
  const startIndex = (safeCurrentPage - 1) * PARKING_SEARCH_PAGE_SIZE
  const visibleParkingLots = filteredParkingLots.slice(
    startIndex,
    startIndex + PARKING_SEARCH_PAGE_SIZE,
  )

  useEffect(() => {
    let isActive = true

    const loadParkingLots = async () => {
      setIsDataLoading(true)

      try {
        const locationParams = selectedLandmark
          ? {
              city: selectedLandmark.city || PARKING_SEARCH_CITY,
              latitude: selectedLandmark.latitude,
              longitude: selectedLandmark.longitude,
              vehicleType: selectedVehicleType,
            }
          : {
              city: PARKING_SEARCH_CITY,
              vehicleType: selectedVehicleType,
            }
        const result = await searchParkingLots(locationParams)

        if (isActive) {
          setParkingLots(result.parkingLots)
          setCurrentPage(1)
        }
      } catch {
        if (isActive) {
          setParkingLots([])
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
  }, [selectedLandmark, selectedVehicleType])

  useEffect(() => {
    if (!isDistrictModalOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDistrictModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDistrictModalOpen])

  const handleKeywordChange = (event) => {
    setKeyword(event.target.value)
    setSelectedLandmark(null)
    setCurrentPage(1)
  }

  const handleSearchSubmit = () => {
    const trimmedKeyword = keyword.trim()
    const matchedLandmark = findSearchLandmarkByKeyword(trimmedKeyword)

    if (matchedLandmark) {
      setKeyword('')
      setSelectedDistrict('')
      setSelectedLandmark(matchedLandmark)
      setCurrentPage(1)

      return
    }

    setKeyword(trimmedKeyword)
    setSelectedLandmark(null)
    setCurrentPage(1)
  }

  const handleClearKeyword = () => {
    setKeyword('')
    setSelectedDistrict('')
    setSelectedLandmark(null)
    setCurrentPage(1)
  }
  const handleVehicleTypeChange = (vehicleType) => {
    setSelectedVehicleType(vehicleType)
    setCurrentPage(1)
  }
  const handleSelectLandmark = (landmark) => {
    setKeyword('')
    setSelectedDistrict('')
    setSelectedLandmark(landmark)
    setCurrentPage(1)
  }
  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district)
    setSelectedLandmark(null)
    setCurrentPage(1)
    setIsDistrictModalOpen(false)
  }

  return (
    <div className="parking-page">
      <section className="parking-page__header">
        <div className="container">
          <div className="parking-page__intro">
            <h1>停車場搜尋</h1>
            <p className="lead mb-0">
              輸入停車場名稱或地址，快速查看符合條件的停車場。
            </p>
          </div>
        </div>
      </section>

      <section className="container parking-page__content">
        <Card className="parking-search-panel">
          <div className="parking-search-panel__content">
            <div className="parking-search-panel__heading">
              <h2>搜尋停車場</h2>
            </div>
            <SearchBar
              buttonText="搜尋"
              onChange={handleKeywordChange}
              onSubmit={handleSearchSubmit}
              placeholder="搜尋停車場名稱、地址或行政區"
              value={keyword}
            />
            <div className="parking-district-filter">
              <Button
                className="parking-district-filter__button"
                onClick={() => setIsDistrictModalOpen(true)}
                variant={selectedDistrict ? 'secondary' : 'outline'}
              >
                {selectedDistrict || '選擇行政區'}
              </Button>
              <span className="parking-district-filter__status">
                {selectedDistrict ? `目前行政區：${selectedDistrict}` : '可依台中市行政區篩選停車資訊'}
              </span>
            </div>
            <VehicleTypeFilter
              onChange={handleVehicleTypeChange}
              value={selectedVehicleType}
            />
            <div className="parking-landmark-shortcuts d-flex flex-wrap gap-2">
              {TEST_LANDMARKS.map((landmark) => (
                <Button
                  key={landmark.id}
                  onClick={() => handleSelectLandmark(landmark)}
                  variant={selectedLandmark?.id === landmark.id ? 'secondary' : 'outline'}
                >
                  {landmark.name}
                </Button>
              ))}
            </div>
            <div className="parking-search-panel__meta">
              <span>
                共 {filteredParkingLots.length} 筆符合條件
                {selectedLandmark ? `，${selectedLandmark.name} 附近` : ''}
                {selectedDistrict ? `，${selectedDistrict}` : ''}
              </span>
              {(keyword || selectedLandmark || hasDistrictFilter) && (
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

        {isDataLoading ? null : hasResults ? (
          <section className="parking-results">
            <div className="parking-results__header">
              <h2>停車場列表</h2>
              <p className="mb-0">
                {isLandmarkSearch
                  ? `依距離顯示${selectedLandmark.name}附近可停車的位置。`
                  : hasDistrictFilter && isKeywordSearch
                    ? `顯示${selectedDistrict}內符合關鍵字「${keyword.trim()}」的停車場。`
                    : hasDistrictFilter
                      ? `顯示${selectedDistrict}符合條件的停車場。`
                    : isKeywordSearch
                    ? `依目前關鍵字「${keyword.trim()}」顯示符合條件的停車場。`
                    : '顯示全台中市停車場。'}
              </p>
            </div>
            <div className="parking-results__grid">
              {visibleParkingLots.map((item) => (
                <div key={item.id}>
                  <ParkingInfoCard item={item} />
                </div>
              ))}
            </div>
            <Pagination
              className="mt-4"
              currentPage={safeCurrentPage}
              maxPages={null}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
              usePageSelect
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

      {isDistrictModalOpen && (
        <div
          aria-labelledby="parking-district-modal-title"
          aria-modal="true"
          className="parking-district-modal"
          role="dialog"
        >
          <button
            aria-label="關閉行政區選單"
            className="parking-district-modal__backdrop"
            onClick={() => setIsDistrictModalOpen(false)}
            type="button"
          />
          <div className="parking-district-modal__dialog">
            <div className="parking-district-modal__header">
              <h2 id="parking-district-modal-title">全部行政區</h2>
              <button
                aria-label="關閉"
                className="parking-district-modal__close"
                onClick={() => setIsDistrictModalOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div className="parking-district-modal__body">
              <button
                className={`parking-district-modal__option parking-district-modal__option--all ${
                  selectedDistrict ? '' : 'is-active'
                }`.trim()}
                onClick={() => handleSelectDistrict('')}
                type="button"
              >
                {ALL_DISTRICTS_LABEL}
              </button>
              {TAICHUNG_DISTRICT_GROUPS.map((group) => (
                <section className="parking-district-modal__group" key={group.title}>
                  <h3>{group.title}</h3>
                  <div className="parking-district-modal__options">
                    {group.districts.map((district) => (
                      <button
                        className={`parking-district-modal__option ${
                          selectedDistrict === district ? 'is-active' : ''
                        }`.trim()}
                        key={district}
                        onClick={() => handleSelectDistrict(district)}
                        type="button"
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParkingPage
