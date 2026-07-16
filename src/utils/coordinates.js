export const normalizeCoordinate = (value) => {
  const coordinate = Number(value)

  return Number.isFinite(coordinate) ? coordinate : null
}

export const isValidLatitude = (latitude) => {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
}

export const isValidLongitude = (longitude) => {
  return Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
}

export const normalizePosition = (position) => {
  if (!position) {
    return null
  }

  const latitude = normalizeCoordinate(position.latitude)
  const longitude = normalizeCoordinate(position.longitude)

  if (
    !isValidLatitude(latitude)
    || !isValidLongitude(longitude)
    || (latitude === 0 && longitude === 0)
  ) {
    return null
  }

  return {
    latitude,
    longitude,
  }
}

export const hasValidPosition = (position) => {
  return normalizePosition(position) !== null
}
