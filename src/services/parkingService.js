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
import {
  calculateDistanceInMeters,
  formatDistance,
} from '../utils/distance.js'

const hasPosition = ({ latitude, longitude } = {}) => {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

const withDistance = (items = [], position) => {
  if (!hasPosition(position)) {
    return [...items]
  }

  return items
    .map((item) => {
      const distanceInMeters = calculateDistanceInMeters(position, item)

      if (distanceInMeters === null) {
        return { ...item }
      }

      return {
        ...item,
        distanceInMeters,
        displayDistance: formatDistance(distanceInMeters),
      }
    })
    .sort((firstItem, secondItem) => {
      const firstDistance = firstItem.distanceInMeters ?? Number.POSITIVE_INFINITY
      const secondDistance = secondItem.distanceInMeters ?? Number.POSITIVE_INFINITY

      return firstDistance - secondDistance
    })
}

const withSortedParkingData = (result, position) => {
  return {
    ...result,
    parkingLots: withDistance(result.parkingLots, position),
    streetParkingSpaces: result.streetParkingSpaces
      ? withDistance(result.streetParkingSpaces, position)
      : result.streetParkingSpaces,
  }
}

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
  const position = params

  if (getParkingDataSource() !== PARKING_DATA_SOURCES.API) {
    const result = await getNearbyParkingFromMock(params)

    return withMeta(withSortedParkingData(result, position), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: false,
    })
  }

  try {
    const result = await getNearbyParkingFromApi(params)

    return withMeta(withSortedParkingData(result, position), {
      dataSource: PARKING_DATA_SOURCES.API,
      fallback: false,
      api: result.meta,
    })
  } catch {
    const fallbackResult = await fallbackToMock(() => getNearbyParkingFromMock(params), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: true,
      fallbackReason: 'API request failed.',
    })

    return withSortedParkingData(fallbackResult, position)
  }
}

export const searchParkingLots = async ({ keyword, latitude, longitude } = {}) => {
  const params = { keyword, latitude, longitude }
  const position = { latitude, longitude }

  if (getParkingDataSource() !== PARKING_DATA_SOURCES.API) {
    const result = await searchParkingLotsFromMock(params)

    return withMeta(withSortedParkingData(result, position), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: false,
    })
  }

  try {
    const result = await searchParkingLotsFromApi(params)

    return withMeta(withSortedParkingData(result, position), {
      dataSource: PARKING_DATA_SOURCES.API,
      fallback: false,
      api: result.meta,
    })
  } catch {
    const fallbackResult = await fallbackToMock(() => searchParkingLotsFromMock(params), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: true,
      fallbackReason: 'API request failed.',
    })

    return withSortedParkingData(fallbackResult, position)
  }
}
