import {
  PARKING_SOURCES,
  PARKING_STATUS,
  PARKING_TYPES,
} from '../src/models/parkingModel.js'

export const normalizeTdxParkingLot = (rawItem = {}) => {
  void rawItem

  return {
    // TODO: map TDX off-street parking facility fields after confirming OpenAPI schema.
    id: '',
    name: '',
    type: PARKING_TYPES.OFF_STREET,
    source: PARKING_SOURCES.TDX,
    city: '',
    cityCode: '',
    district: '',
    address: '',
    latitude: null,
    longitude: null,
    totalSpaces: null,
    availableSpaces: null,
    carSpaces: null,
    motorSpaces: null,
    price: '',
    isOpen: null,
    status: PARKING_STATUS.UNKNOWN,
    updatedAt: '',
  }
}

export const normalizeTdxParkingAvailability = (rawItem = {}) => {
  void rawItem

  return {
    // TODO: map TDX real-time parking availability fields after confirming OpenAPI schema.
    id: '',
    source: PARKING_SOURCES.TDX,
    totalSpaces: null,
    availableSpaces: null,
    isOpen: null,
    status: PARKING_STATUS.UNKNOWN,
    updatedAt: '',
  }
}

export const normalizeTdxStreetParking = (rawItem = {}) => {
  void rawItem

  return {
    // TODO: map TDX on-street parking fields after confirming OpenAPI schema.
    id: '',
    name: '',
    type: PARKING_TYPES.STREET,
    source: PARKING_SOURCES.TDX,
    city: '',
    cityCode: '',
    district: '',
    road: '',
    sectionId: '',
    spaceId: '',
    spaceType: '',
    latitude: null,
    longitude: null,
    availableSpaces: null,
    price: '',
    status: PARKING_STATUS.UNKNOWN,
    updatedAt: '',
  }
}

export const mergeTdxParkingLotWithAvailability = (
  parkingLot = {},
  availability = {},
) => {
  return {
    // TODO: merge static TDX parking lot data with normalized real-time availability.
    ...parkingLot,
    totalSpaces: availability.totalSpaces ?? parkingLot.totalSpaces ?? null,
    availableSpaces:
      availability.availableSpaces ?? parkingLot.availableSpaces ?? null,
    isOpen: availability.isOpen ?? parkingLot.isOpen ?? null,
    status: availability.status ?? parkingLot.status ?? PARKING_STATUS.UNKNOWN,
    updatedAt: availability.updatedAt ?? parkingLot.updatedAt ?? '',
  }
}
