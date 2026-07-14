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

const getFirstValue = (...values) => {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

const toNumberOrNull = (value) => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

const getParkingSpacesTotal = (spaces = []) => {
  if (!Array.isArray(spaces)) {
    return null
  }

  const totalSpaces = spaces.reduce((total, item) => {
    const spacesCount = toNumberOrNull(item?.Spaces)
      ?? toNumberOrNull(item?.NumberOfSpaces)
      ?? toNumberOrNull(item?.TotalSpaces)
      ?? 0

    return total + spacesCount
  }, 0)

  return totalSpaces > 0 ? totalSpaces : null
}

export const normalizeTdxParkingLot = (rawItem = {}) => {
  const position = rawItem.CarParkPosition || rawItem.Position || {}
  const totalSpaces = toNumberOrNull(rawItem.TotalSpaces)
    ?? getParkingSpacesTotal(rawItem.ParkingSpaces)

  return {
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
    totalSpaces,
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
  const serviceStatus = getFirstValue(rawItem.ServiceStatus, rawItem.ServiceStatusType)
  const fullStatus = getFirstValue(rawItem.FullStatus, rawItem.FullStatusType)
  const chargeStatus = getFirstValue(rawItem.ChargeStatus, rawItem.ChargeStatusType)
  const availableSpaces = toNumberOrNull(
    getFirstValue(rawItem.AvailableSpaces, rawItem.AvailableSpace),
  )
  const totalSpaces = toNumberOrNull(rawItem.TotalSpaces)
  const isClosed = serviceStatus === 0 || serviceStatus === '0'
  const isFull = fullStatus === 1 || fullStatus === '1' || availableSpaces === 0
  const hasKnownStatus = (
    serviceStatus !== undefined
    || fullStatus !== undefined
    || availableSpaces !== null
  )

  return {
    id: rawItem.CarParkID || '',
    name: getLocalizedText(rawItem.CarParkName),
    source: PARKING_SOURCES.TDX,
    totalSpaces,
    availableSpaces,
    serviceStatus,
    fullStatus,
    chargeStatus,
    isOpen: serviceStatus === undefined ? null : !isClosed,
    status: hasKnownStatus
      ? isClosed
        ? PARKING_STATUS.CLOSED
        : isFull
          ? PARKING_STATUS.FULL
          : PARKING_STATUS.AVAILABLE
      : PARKING_STATUS.UNKNOWN,
    updatedAt: rawItem.DataCollectTime || rawItem.UpdateTime || rawItem.SrcUpdateTime || '',
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
    ...parkingLot,
    name: parkingLot.name || availability.name || '',
    totalSpaces: availability.totalSpaces ?? parkingLot.totalSpaces ?? null,
    availableSpaces:
      availability.availableSpaces ?? parkingLot.availableSpaces ?? null,
    serviceStatus: availability.serviceStatus,
    fullStatus: availability.fullStatus,
    chargeStatus: availability.chargeStatus,
    isOpen: availability.isOpen ?? parkingLot.isOpen ?? null,
    status: availability.status ?? parkingLot.status ?? PARKING_STATUS.UNKNOWN,
    updatedAt: availability.updatedAt ?? parkingLot.updatedAt ?? '',
  }
}
