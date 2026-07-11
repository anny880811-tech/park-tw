import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

const formatDistance = (distance) => {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} 公里`
  }

  return `${distance} 公尺`
}

const ParkingInfoCard = ({ item }) => {
  const {
    name,
    type,
    district,
    address,
    road,
    distance,
    totalSpaces,
    availableSpaces,
    price,
    isOpen,
    features = [],
  } = item
  const hasSpaces = availableSpaces > 0
  const locationText = address || road
  const openStatus = isOpen === false ? '未營業' : '營業中'

  return (
    <Card className="parking-card" subtitle={locationText} title={name}>
      <div className="parking-card__badges">
        <Badge variant={hasSpaces ? 'success' : 'danger'}>
          {hasSpaces ? '尚有車位' : '已滿'}
        </Badge>
        <Badge variant={isOpen === false ? 'secondary' : 'primary'}>
          {openStatus}
        </Badge>
        {features.map((feature) => (
          <Badge key={feature} variant="secondary">
            {feature}
          </Badge>
        ))}
      </div>

      <dl className="parking-card__details">
        {district && (
          <div>
            <dt>行政區</dt>
            <dd>{district}</dd>
          </div>
        )}
        <div>
          <dt>類型</dt>
          <dd>{type}</dd>
        </div>
        <div>
          <dt>距離</dt>
          <dd>{formatDistance(distance)}</dd>
        </div>
        <div>
          <dt>剩餘車位</dt>
          <dd>
            {availableSpaces}
            {typeof totalSpaces === 'number' && ` / ${totalSpaces}`}
          </dd>
        </div>
        <div>
          <dt>收費</dt>
          <dd>{price}</dd>
        </div>
      </dl>
    </Card>
  )
}

export default ParkingInfoCard
