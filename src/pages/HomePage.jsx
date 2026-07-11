import NearbyParkingSection from '../components/parking/NearbyParkingSection.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import {
  nearbyParkingLots,
  nearbyStreetParkingSpaces,
} from '../data/mockParkingData.js'

const HomePage = () => {
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
              <Button className="home-hero__button" variant="primary">
                使用目前位置
              </Button>
              <small>目前為 UI 示意，下一階段才會加入定位功能。</small>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-page__content">
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
