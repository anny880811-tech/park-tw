import ParkingInfoCard from './ParkingInfoCard.jsx'
import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

const NearbyParkingSection = ({
  title,
  description,
  items = [],
  emptyText = '目前沒有可顯示的停車資料。',
  children,
}) => {
  const hasItems = items.length > 0

  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>{title}</h2>
        {description && <p className="mb-0">{description}</p>}
      </div>

      {hasItems ? (
        <div className="row g-4">
          {items.map((item) => (
            <div className="col-12 col-md-6 col-xl-4" key={item.id}>
              <ParkingInfoCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="empty-state">
          <div className="empty-state__content">
            <Badge variant="secondary">目前無資料</Badge>
            <p className="mb-0">{emptyText}</p>
          </div>
        </Card>
      )}

      {hasItems && children}
    </section>
  )
}

export default NearbyParkingSection
