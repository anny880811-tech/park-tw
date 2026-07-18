import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'
import { formatDistance } from '../../utils/distance.js'
import { getGoogleMapsDirectionsUrl } from '../../utils/navigation.js'
import { VEHICLE_TYPE_LABELS } from '../../constants/vehicleTypes.js'
import { PARKING_TYPES } from '../../models/parkingModel.js'

const ParkingInfoCard = ({ item }) => {
  const {
    name,
    type,
    address,
    road,
    distance,
    displayDistance,
    totalSpaces,
    availableSpaces,
    price,
    vehicleTypes = [],
    availableSpacesByVehicleType = {},
    features = [],
    latitude,
    longitude,
  } = item
  const hasAvailableSpaces = Number.isFinite(availableSpaces)
  const hasSpaces = hasAvailableSpaces && availableSpaces > 0
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const isStreetParking = type === PARKING_TYPES.STREET || Boolean(road)
  const locationText = address || road
  const availableSpacesText = hasAvailableSpaces
    ? availableSpaces
    : isStreetParking
      ? '僅提供收費路段，無即時格位'
      : '未提供即時資訊'
  const distanceText = displayDistance || (
    Number.isFinite(distance) ? formatDistance(distance) : ''
  )
  const vehicleTypeLabels = vehicleTypes
    .map((vehicleType) => VEHICLE_TYPE_LABELS[vehicleType])
    .filter(Boolean)
  const vehicleSpacesText = Object.entries(availableSpacesByVehicleType)
    .map(([vehicleType, spaces]) => {
      const label = VEHICLE_TYPE_LABELS[vehicleType]

      return label && Number.isFinite(spaces) ? `${label} ${spaces}` : ''
    })
    .filter(Boolean)
    .join('、')

  return (
    <Card className="parking-card" subtitle={locationText} title={name}>
      <div className="parking-card__badges">
        {hasAvailableSpaces && (
          <Badge variant={hasSpaces ? 'success' : 'danger'}>
            {hasSpaces ? '尚有車位' : '已滿'}
          </Badge>
        )}
        {features.map((feature) => (
          <Badge key={feature} variant="secondary">
            {feature}
          </Badge>
        ))}
      </div>

      <dl className="parking-card__details">
        {vehicleTypeLabels.length > 0 && (
          <div className="parking-card__detail-row parking-card__detail-row--inline">
            <dt>支援車種</dt>
            <dd>{vehicleTypeLabels.join('、')}</dd>
          </div>
        )}
        {distanceText && (
          <div className="parking-card__detail-row parking-card__detail-row--inline">
            <dt>距離</dt>
            <dd>{distanceText}</dd>
          </div>
        )}
        <div className="parking-card__detail-row parking-card__detail-row--inline">
          <dt>剩餘車位</dt>
          <dd>
            {availableSpacesText}
            {hasAvailableSpaces && typeof totalSpaces === 'number' && ` / ${totalSpaces}`}
          </dd>
        </div>
        {vehicleSpacesText && (
          <div className="parking-card__detail-row">
            <dt>分車種剩餘</dt>
            <dd>{vehicleSpacesText}</dd>
          </div>
        )}
        <div className="parking-card__detail-row parking-card__detail-row--inline">
          <dt>收費</dt>
          <dd>{price}</dd>
        </div>
      </dl>

      {hasCoordinates && (
        <a
          className="btn btn-primary parking-card__directions"
          href={getGoogleMapsDirectionsUrl({ latitude, longitude })}
          rel="noopener noreferrer"
          target="_blank"
        >
          前往停車場
        </a>
      )}
    </Card>
  )
}

export default ParkingInfoCard
