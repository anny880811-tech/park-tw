import Badge from '../ui/Badge.jsx'
import Card from '../ui/Card.jsx'

const statusConfig = {
  idle: {
    badge: '尚未定位',
    variant: 'secondary',
    title: '尚未取得目前位置',
    message: '點擊「使用目前位置」開始定位。',
  },
  loading: {
    badge: '定位中',
    variant: 'primary',
    title: '正在取得目前位置',
    message: '請稍候，瀏覽器可能會詢問定位權限。',
  },
  success: {
    badge: '定位成功',
    variant: 'success',
    title: '已取得目前位置',
    message: '以下附近停車資訊仍為 mock data，尚未依經緯度查詢即時資料。',
  },
  denied: {
    badge: '權限拒絕',
    variant: 'danger',
    title: '定位權限已被拒絕',
    message: '請允許瀏覽器定位權限後再試一次。',
  },
  unsupported: {
    badge: '不支援',
    variant: 'warning',
    title: '目前瀏覽器不支援定位功能',
    message: '請改用支援 Geolocation API 的瀏覽器。',
  },
  timeout: {
    badge: '定位逾時',
    variant: 'warning',
    title: '定位逾時',
    message: '請確認網路或定位服務後再試一次。',
  },
  error: {
    badge: '定位失敗',
    variant: 'danger',
    title: '定位失敗',
    message: '請稍後再試。',
  },
}

const formatCoordinate = (coordinate) => {
  return coordinate.toFixed(6)
}

const LocationStatus = ({
  status,
  position,
  error,
}) => {
  const config = statusConfig[status] || statusConfig.error
  const message = error || config.message

  return (
    <Card className="location-status">
      <div className="location-status__content">
        <Badge variant={config.variant}>{config.badge}</Badge>
        <div>
          <h2>{config.title}</h2>
          <p className="mb-0">{message}</p>
        </div>
        {status === 'success' && position && (
          <dl className="location-status__position">
            <div>
              <dt>緯度</dt>
              <dd>{formatCoordinate(position.latitude)}</dd>
            </div>
            <div>
              <dt>經度</dt>
              <dd>{formatCoordinate(position.longitude)}</dd>
            </div>
          </dl>
        )}
      </div>
    </Card>
  )
}

export default LocationStatus
