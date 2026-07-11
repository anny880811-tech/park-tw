import { useState } from 'react'

const getErrorStatus = (error) => {
  if (error.code === error.PERMISSION_DENIED) {
    return 'denied'
  }

  if (error.code === error.TIMEOUT) {
    return 'timeout'
  }

  return 'error'
}

const getErrorMessage = (status) => {
  const messageMap = {
    denied: '定位權限已被拒絕，請允許瀏覽器定位權限後再試一次。',
    timeout: '定位逾時，請確認網路或定位服務後再試一次。',
    unsupported: '目前瀏覽器不支援定位功能。',
    error: '定位失敗，請稍後再試。',
  }

  return messageMap[status] || messageMap.error
}

const useGeolocation = () => {
  const [status, setStatus] = useState('idle')
  const [position, setPosition] = useState(null)
  const [error, setError] = useState('')

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatus('unsupported')
      setPosition(null)
      setError(getErrorMessage('unsupported'))
      return
    }

    setStatus('loading')
    setError('')

    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        setStatus('success')
        setPosition({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        })
        setError('')
      },
      (geolocationError) => {
        const nextStatus = getErrorStatus(geolocationError)
        setStatus(nextStatus)
        setPosition(null)
        setError(getErrorMessage(nextStatus))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  return {
    status,
    position,
    error,
    getCurrentLocation,
  }
}

export default useGeolocation
