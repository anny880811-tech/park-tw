export const PARKING_DATA_SOURCES = {
  MOCK: 'mock',
  API: 'api',
}

export const getParkingDataSource = () => {
  const dataSource = import.meta.env.VITE_PARKING_DATA_SOURCE

  if (dataSource === PARKING_DATA_SOURCES.API) {
    return PARKING_DATA_SOURCES.API
  }

  return PARKING_DATA_SOURCES.MOCK
}
