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
import { VEHICLE_FILTERS } from '../constants/vehicleTypes.js'

const DEFAULT_PARKING_SEARCH_RADIUS_IN_METERS = 2000

const hasPosition = ({ latitude, longitude } = {}) => {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

const filterParkingLotsByKeyword = (parkingLots = [], keyword = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return parkingLots
  }

  return parkingLots.filter((item) => {
    const searchableText = [
      item.name,
      item.address,
      item.district,
    ].filter(Boolean).join(' ').toLowerCase()

    return searchableText.includes(normalizedKeyword)
  })
}

const filterParkingByVehicleType = (
  items = [],
  vehicleType = VEHICLE_FILTERS.ALL,
) => {
  const shouldFilterByVehicleType = (
    vehicleType === VEHICLE_FILTERS.CAR
    || vehicleType === VEHICLE_FILTERS.MOTORCYCLE
  )

  if (!shouldFilterByVehicleType) {
    return items
  }

  return items.filter((item) => {
    return Array.isArray(item.vehicleTypes)
      && item.vehicleTypes.includes(vehicleType)
  })
}

const withDistance = (
  items = [],
  position,
  { keepItemsWithoutPosition = false } = {},
) => {
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
    .filter((item) => {
      if (!Number.isFinite(item.distanceInMeters)) {
        return keepItemsWithoutPosition
      }

      return item.distanceInMeters <= DEFAULT_PARKING_SEARCH_RADIUS_IN_METERS
    })
    .sort((firstItem, secondItem) => {
      const firstDistance = firstItem.distanceInMeters ?? Number.POSITIVE_INFINITY
      const secondDistance = secondItem.distanceInMeters ?? Number.POSITIVE_INFINITY

      return firstDistance - secondDistance
    })
}

const withSortedParkingData = (
  result,
  position,
  {
    keyword = '',
    vehicleType = VEHICLE_FILTERS.ALL,
  } = {},
) => {
  const parkingLotsByDistance = withDistance(result.parkingLots, position)
  const streetParkingSpacesByDistance = result.streetParkingSpaces
    ? withDistance(result.streetParkingSpaces, position, {
        keepItemsWithoutPosition: true,
      })
    : result.streetParkingSpaces

  return {
    ...result,
    parkingLots: filterParkingLotsByKeyword(
      filterParkingByVehicleType(parkingLotsByDistance, vehicleType),
      keyword,
    ),
    streetParkingSpaces: streetParkingSpacesByDistance
      ? filterParkingByVehicleType(streetParkingSpacesByDistance, vehicleType)
      : streetParkingSpacesByDistance,
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

export const getNearbyParking = async ({
  city,
  latitude,
  longitude,
  vehicleType = VEHICLE_FILTERS.ALL,
} = {}) => {
  const params = { city, latitude, longitude }
  const position = params

  if (getParkingDataSource() !== PARKING_DATA_SOURCES.API) {
    const result = await getNearbyParkingFromMock(params)

    return withMeta(withSortedParkingData(result, position, { vehicleType }), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: false,
    })
  }

  try {
    const result = await getNearbyParkingFromApi(params)

    return withMeta(withSortedParkingData(result, position, { vehicleType }), {
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

    return withSortedParkingData(fallbackResult, position, { vehicleType })
  }
}

export const searchParkingLots = async ({
  city,
  keyword,
  latitude,
  longitude,
  vehicleType = VEHICLE_FILTERS.ALL,
} = {}) => {
  const params = { city, latitude, longitude }
  const position = { latitude, longitude }

  if (getParkingDataSource() !== PARKING_DATA_SOURCES.API) {
    const result = await searchParkingLotsFromMock(params)

    return withMeta(withSortedParkingData(result, position, { keyword, vehicleType }), {
      dataSource: PARKING_DATA_SOURCES.MOCK,
      fallback: false,
    })
  }

  try {
    const result = await searchParkingLotsFromApi(params)

    return withMeta(withSortedParkingData(result, position, { keyword, vehicleType }), {
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

    return withSortedParkingData(fallbackResult, position, { keyword, vehicleType })
  }
}
