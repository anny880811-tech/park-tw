const EARTH_RADIUS_IN_METERS = 6371000

const isValidCoordinate = (point) => {
  return (
    point
    && Number.isFinite(point.latitude)
    && Number.isFinite(point.longitude)
  )
}

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180)
}

export const calculateDistanceInMeters = (origin, target) => {
  if (!isValidCoordinate(origin) || !isValidCoordinate(target)) {
    return null
  }

  const latitudeDifference = toRadians(target.latitude - origin.latitude)
  const longitudeDifference = toRadians(target.longitude - origin.longitude)
  const originLatitude = toRadians(origin.latitude)
  const targetLatitude = toRadians(target.latitude)

  const haversineValue = (
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(originLatitude)
    * Math.cos(targetLatitude)
    * Math.sin(longitudeDifference / 2) ** 2
  )
  const centralAngle = 2 * Math.atan2(
    Math.sqrt(haversineValue),
    Math.sqrt(1 - haversineValue),
  )

  return Math.round(EARTH_RADIUS_IN_METERS * centralAngle)
}

export const formatDistance = (distanceInMeters) => {
  if (!Number.isFinite(distanceInMeters)) {
    return '距離未知'
  }

  if (distanceInMeters >= 1000) {
    return `${(distanceInMeters / 1000).toFixed(1)} km`
  }

  return `${distanceInMeters} m`
}
