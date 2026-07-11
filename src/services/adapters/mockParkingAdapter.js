import {
  nearbyParkingLots,
  nearbyStreetParkingSpaces,
  parkingLots,
} from '../../data/mockParkingData.js'
import {
  calculateDistanceInMeters,
  formatDistance,
} from '../../utils/distance.js'

const hasPosition = ({ latitude, longitude } = {}) => {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
}

const withDistance = (items, position) => {
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

export const getNearbyParkingFromMock = async ({ latitude, longitude } = {}) => {
  const position = { latitude, longitude }

  return {
    parkingLots: withDistance(nearbyParkingLots, position),
    streetParkingSpaces: withDistance(nearbyStreetParkingSpaces, position),
  }
}

export const searchParkingLotsFromMock = async ({ keyword = '' } = {}) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return {
      parkingLots: [...parkingLots],
    }
  }

  return {
    parkingLots: parkingLots.filter((item) => {
      const searchableText = [
        item.name,
        item.address,
        item.district,
      ].join(' ').toLowerCase()

      return searchableText.includes(normalizedKeyword)
    }),
  }
}
