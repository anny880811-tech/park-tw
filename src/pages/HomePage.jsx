import NearbyParkingSection from '../components/parking/NearbyParkingSection.jsx'
import LocationStatus from '../components/location/LocationStatus.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import useGeolocation from '../hooks/useGeolocation.js'
import {
  nearbyParkingLots,
  nearbyStreetParkingSpaces,
} from '../data/mockParkingData.js'

const HomePage = () => {
  const {
    status,
    position,
    error,
    getCurrentLocation,
  } = useGeolocation()
  const isLoading = status === 'loading'

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
              <small>定位成功後仍使用 mock data 顯示附近停車資訊。</small>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-page__content">
        <LocationStatus error={error} position={position} status={status} />

        <div className="mock-data-notice">
          <Badge variant="secondary">Mock Data</Badge>
          <p className="mb-0">
            以下資料為畫面展示用假資料，尚未串接即時停車資訊。
          </p>
        </div>

        <NearbyParkingSection
          description="顯示目前位置附近的路外停車場、剩餘車位與收費資訊。"
          items={nearbyParkingLots}
          title="附近停車場"
        />

        <NearbyParkingSection
          description="顯示目前位置附近的路邊停車格與可用格位。"
          items={nearbyStreetParkingSpaces}
          title="附近路邊停車格"
        />
      </section>
    </div>
  )
}

export default HomePage
