import {
  getParkingDataSource,
  PARKING_DATA_SOURCES,
} from '../config/parkingDataSource.js'
import {
  getNearbyParkingFromApi,
  searchParkingLotsFromApi,
} from './adapters/apiParkingAdapter.js'
import {
  getNearbyParkingFromMock,
  searchParkingLotsFromMock,
} from './adapters/mockParkingAdapter.js'

const withMeta = (result, meta) => {
  return {
    ...result,
    meta,
  }
}

const fallbackToMock = async (mockRequest, meta) => {
  const result = await mockRequest()

  return withMeta(result, meta)
}

export const getNearbyParking = async ({ latitude, longitude } = {}) => {
  const params = { latitude, longitude }

  if (getParkingDataSource() !== PARKING_DATA_SOURCES.API) {
    const result = await getNearbyParkingFromMock(params)

    return withMeta(result, {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: false,
    })
  }

  try {
    const result = await getNearbyParkingFromApi(params)

    return withMeta(result, {
      dataSource: PARKING_DATA_SOURCES.API,
      fallback: false,
      api: result.meta,
    })
  } catch {
    return fallbackToMock(() => getNearbyParkingFromMock(params), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: true,
      fallbackReason: 'API request failed.',
    })
  }
}

export const searchParkingLots = async ({ keyword } = {}) => {
  const params = { keyword }

  if (getParkingDataSource() !== PARKING_DATA_SOURCES.API) {
    const result = await searchParkingLotsFromMock(params)

    return withMeta(result, {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: false,
    })
  }

  try {
    const result = await searchParkingLotsFromApi(params)

    return withMeta(result, {
      dataSource: PARKING_DATA_SOURCES.API,
      fallback: false,
      api: result.meta,
    })
  } catch {
    return fallbackToMock(() => searchParkingLotsFromMock(params), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: true,
      fallbackReason: 'API request failed.',
    })
  }
}
