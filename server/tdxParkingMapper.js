import {
  PARKING_SOURCES,
  PARKING_STATUS,
  PARKING_TYPES,
} from '../src/models/parkingModel.js'

const getLocalizedText = (value) => {
  if (typeof value === 'string') {
    return value
  }

  if (!value || typeof value !== 'object') {
    return ''
  }

  return value.Zh_tw || value.ZhTw || value.En || ''
}

const toNumberOrNull = (value) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

export const normalizeTdxParkingLot = (rawItem = {}) => {
  const position = rawItem.CarParkPosition || {}

  return {
    // TODO: Map totalSpaces, carSpaces, motorSpaces, district and open status after confirming TDX schema.
    id: rawItem.CarParkID || '',
    name: getLocalizedText(rawItem.CarParkName),
    type: PARKING_TYPES.OFF_STREET,
    source: PARKING_SOURCES.TDX,
    city: rawItem.City || '',
    cityCode: rawItem.CityCode || rawItem.AuthorityCode || '',
    district: '',
    address: rawItem.Address || '',
    latitude: toNumberOrNull(position.PositionLat),
    longitude: toNumberOrNull(position.PositionLon),
    totalSpaces: null,
    availableSpaces: null,
    carSpaces: null,
    motorSpaces: null,
    price: rawItem.FareDescription || '',
    isOpen: null,
    status: PARKING_STATUS.UNKNOWN,
    updatedAt: rawItem.UpdateTime || rawItem.SrcUpdateTime || '',
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
