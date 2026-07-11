const apiAdapterError = () => {
  throw new Error('API parking adapter is not implemented yet.')
}

export const getNearbyParkingFromApi = async ({ latitude, longitude } = {}) => {
  // TODO: Call /api/parking?latitude=...&longitude=... after server-side proxy exists.
  void latitude
  void longitude
  apiAdapterError()
}

export const searchParkingLotsFromApi = async ({ keyword } = {}) => {
  // TODO: Call /api/parking/search?keyword=... after server-side proxy exists.
  void keyword
  apiAdapterError()
}
