import {
  getNearbyParkingFromMock,
  searchParkingLotsFromMock,
} from './adapters/mockParkingAdapter.js'

export const getNearbyParking = async ({ latitude, longitude } = {}) => {
  return getNearbyParkingFromMock({ latitude, longitude })
}

export const searchParkingLots = async ({ keyword } = {}) => {
  return searchParkingLotsFromMock({ keyword })
}
