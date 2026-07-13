import Badge from './Badge.jsx'

const formatUpdatedAt = (updatedAt) => {
  if (!updatedAt) {
    return ''
  }

  const date = new Date(updatedAt)

  if (Number.isNaN(date.getTime())) {
    return updatedAt
  }

  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getDataSourceLabel = (meta) => {
  if (meta?.fallback) {
    return 'Mock Data（API fallback）'
  }

  if (meta?.dataSource === 'api') {
    return 'TDX API'
  }

  return 'Mock Data'
}

const getDataSourceMessage = (meta) => {
  if (meta?.fallback) {
    return '目前無法取得即時停車資料，已改用備用資料。'
  }

  if (meta?.dataSource === 'api') {
    return '資料透過本專案 /api/parking 取得，前端不直接呼叫 TDX。'
  }

  return '目前使用 mock data，未設定 VITE_PARKING_DATA_SOURCE 時會維持此模式。'
}

const getBadgeVariant = ({ error, isLoading, meta }) => {
  if (error) {
    return 'danger'
  }

  if (isLoading || (meta?.dataSource === 'api' && !meta?.fallback)) {
    return 'primary'
  }

  return 'secondary'
}

const DataStatusNotice = ({
  error = '',
  isLoading = false,
  loadingText = '正在載入停車資料...',
  meta,
  updatedAt,
}) => {
  const label = isLoading ? '載入中' : getDataSourceLabel(meta)
  const message = error || (isLoading ? loadingText : getDataSourceMessage(meta))
  const formattedUpdatedAt = formatUpdatedAt(updatedAt)

  return (
    <div className="mock-data-notice">
      <Badge variant={getBadgeVariant({ error, isLoading, meta })}>
        {label}
      </Badge>
      <div>
        <p className="mb-0">{message}</p>
        {formattedUpdatedAt && (
          <small className="text-muted">更新時間：{formattedUpdatedAt}</small>
        )}
      </div>
    </div>
  )
}

export default DataStatusNotice
