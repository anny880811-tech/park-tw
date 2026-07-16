import {
  PARKING_SOURCES,
  PARKING_STATUS,
  PARKING_TYPES,
} from '../src/models/parkingModel.js'
import { VEHICLE_FILTERS } from '../src/constants/vehicleTypes.js'

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
  if (value === undefined || value === null || value === '') {
    return null
  }

  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

const getPosition = (...positions) => {
  return positions.find((position) => position && typeof position === 'object') || {}
}

const getPositionLatitude = (position = {}) => {
  return toNumberOrNull(
    getFirstValue(
      position.PositionLat,
      position.Latitude,
      position.Lat,
      position.lat,
    ),
  )
}

const getPositionLongitude = (position = {}) => {
  return toNumberOrNull(
    getFirstValue(
      position.PositionLon,
      position.PositionLng,
      position.Longitude,
      position.Lon,
      position.Lng,
      position.lng,
    ),
  )
}

const getCenterCoordinate = (startValue, endValue) => {
  const startNumber = toNumberOrNull(startValue)
  const endNumber = toNumberOrNull(endValue)

  if (startNumber === null || endNumber === null) {
    return null
  }

  return (startNumber + endNumber) / 2
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

const getVehicleTypesFromText = (...values) => {
  const text = values
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toLowerCase()
  const vehicleTypes = new Set()

  if (
    text.includes('car')
    || text.includes('汽車')
    || text.includes('汽機車')
    || text.includes('小客車')
    || text.includes('自小客車')
    || text.includes('小型車')
    || text.includes('轎車')
  ) {
    vehicleTypes.add(VEHICLE_FILTERS.CAR)
  }

  if (
    text.includes('motor')
    || text.includes('scooter')
    || text.includes('機車')
    || text.includes('汽機車')
    || text.includes('摩托車')
  ) {
    vehicleTypes.add(VEHICLE_FILTERS.MOTORCYCLE)
  }

  return Array.from(vehicleTypes)
}

const getVehicleTypesFromParkingSpaces = (spaces = []) => {
  if (!Array.isArray(spaces)) {
    return []
  }

  const vehicleTypes = new Set()

  spaces.forEach((space) => {
    getVehicleTypesFromText(
      space?.SpaceType,
      space?.VehicleType,
      space?.Type,
      space?.Description,
      space?.FareDescription,
      space?.ChargeDescription,
      space?.Remark,
      space?.Notes,
      space?.ParkingInfo,
    ).forEach((vehicleType) => vehicleTypes.add(vehicleType))
  })

  return Array.from(vehicleTypes)
}

const getVehicleTypesFromAvailabilities = (availabilities = []) => {
  if (!Array.isArray(availabilities)) {
    return []
  }

  const vehicleTypes = new Set()

  availabilities.forEach((availability) => {
    getVehicleTypesFromText(
      availability?.SpaceType,
      availability?.VehicleType,
      availability?.Type,
      availability?.Description,
      availability?.FareDescription,
      availability?.ChargeDescription,
      availability?.Remark,
      availability?.Notes,
      availability?.ParkingInfo,
    ).forEach((vehicleType) => vehicleTypes.add(vehicleType))
  })

  return Array.from(vehicleTypes)
}

const getOffStreetVehicleTypes = (rawItem = {}) => {
  const vehicleTypes = new Set([
    ...getVehicleTypesFromParkingSpaces(rawItem.ParkingSpaces),
    ...getVehicleTypesFromText(
      rawItem.CarParkID,
      getLocalizedText(rawItem.CarParkName),
      rawItem.Description,
      rawItem.FareDescription,
      rawItem.ChargeDescription,
      rawItem.Remark,
      rawItem.Notes,
      rawItem.ParkingInfo,
    ),
  ])

  if (vehicleTypes.size === 0) {
    vehicleTypes.add(VEHICLE_FILTERS.CAR)
  }

  return Array.from(vehicleTypes)
}

const getStreetVehicleTypes = (rawItem = {}) => {
  return getVehicleTypesFromText(
    rawItem.SpaceType,
    rawItem.VehicleType,
    rawItem.Type,
    rawItem.Description,
    rawItem.FareDescription,
    rawItem.ChargeDescription,
    rawItem.Remark,
    rawItem.Notes,
    rawItem.ParkingInfo,
    getLocalizedText(rawItem.ParkingSegmentName),
    getLocalizedText(rawItem.ParkingSpaceName),
  )
}

const getAvailabilitySpacesByVehicleType = (availabilities = []) => {
  if (!Array.isArray(availabilities)) {
    return {}
  }

  return availabilities.reduce((spacesByVehicleType, availability) => {
    const vehicleTypes = getVehicleTypesFromText(
      availability?.SpaceType,
      availability?.VehicleType,
      availability?.Type,
      availability?.Description,
      availability?.FareDescription,
      availability?.ChargeDescription,
      availability?.Remark,
      availability?.Notes,
      availability?.ParkingInfo,
    )
    const availableSpaces = toNumberOrNull(
      getFirstValue(availability?.AvailableSpaces, availability?.AvailableSpace),
    )

    vehicleTypes.forEach((vehicleType) => {
      spacesByVehicleType[vehicleType] = availableSpaces
    })

    return spacesByVehicleType
  }, {})
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
    vehicleTypes: getOffStreetVehicleTypes(rawItem),
    availableSpacesByVehicleType: {},
    totalSpacesByVehicleType: {},
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
    vehicleTypes: getVehicleTypesFromAvailabilities(rawItem.Availabilities),
    availableSpacesByVehicleType: getAvailabilitySpacesByVehicleType(rawItem.Availabilities),
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

export const normalizeTdxStreetParking = (rawItem = {}, fallback = {}) => {
  const position = getPosition(
    rawItem.ParkingSegmentPosition,
    rawItem.ParkingSpacePosition,
    rawItem.Position,
    rawItem.CenterPosition,
  )
  const startPosition = getPosition(rawItem.StartPosition)
  const endPosition = getPosition(rawItem.EndPosition)
  const latitude = getPositionLatitude(position)
    ?? getCenterCoordinate(
      getPositionLatitude(startPosition),
      getPositionLatitude(endPosition),
    )
  const longitude = getPositionLongitude(position)
    ?? getCenterCoordinate(
      getPositionLongitude(startPosition),
      getPositionLongitude(endPosition),
    )
  const id = getFirstValue(
    rawItem.ParkingSegmentID,
    rawItem.SegmentID,
    rawItem.RoadSectionID,
    rawItem.ParkingSpaceID,
    rawItem.SpaceID,
    rawItem.ID,
  ) || ''
  const road = getFirstValue(
    rawItem.RoadName,
    rawItem.Road,
    rawItem.SectionName,
    getLocalizedText(rawItem.ParkingSegmentName),
    getLocalizedText(rawItem.ParkingSpaceName),
  ) || ''
  const name = getFirstValue(
    getLocalizedText(rawItem.ParkingSegmentName),
    getLocalizedText(rawItem.ParkingSpaceName),
    rawItem.Name,
    road,
  ) || ''

  return {
    id,
    name,
    type: PARKING_TYPES.STREET,
    source: PARKING_SOURCES.TDX,
    vehicleTypes: getStreetVehicleTypes(rawItem),
    availableSpacesByVehicleType: {},
    totalSpacesByVehicleType: {},
    city: rawItem.City || fallback.city || '',
    cityCode: rawItem.CityCode || rawItem.AuthorityCode || fallback.cityCode || '',
    district: rawItem.TownName || rawItem.District || '',
    road,
    roadName: road,
    address: rawItem.Address || road,
    sectionId: getFirstValue(rawItem.ParkingSegmentID, rawItem.SegmentID, rawItem.RoadSectionID) || '',
    spaceId: getFirstValue(rawItem.ParkingSpaceID, rawItem.SpaceID) || '',
    spaceType: getFirstValue(rawItem.SpaceType, rawItem.VehicleType) || '',
    latitude,
    longitude,
    totalSpaces: toNumberOrNull(
      getFirstValue(rawItem.TotalSpaces, rawItem.Spaces, rawItem.NumberOfSpaces),
    ),
    availableSpaces: toNumberOrNull(
      getFirstValue(
        rawItem.AvailableSpaces,
        rawItem.AvailableSpace,
        rawItem.RemainingSpaces,
        rawItem.SurplusSpaces,
      ),
    ),
    price: getFirstValue(rawItem.FareDescription, rawItem.ChargeDescription) || '',
    chargeStatus: getFirstValue(rawItem.ChargeStatus, rawItem.ChargeStatusType),
    serviceStatus: getFirstValue(rawItem.ServiceStatus, rawItem.ServiceStatusType),
    status: PARKING_STATUS.UNKNOWN,
    updatedAt: rawItem.DataCollectTime || rawItem.UpdateTime || rawItem.SrcUpdateTime || '',
  }
}

export const mergeTdxParkingLotWithAvailability = (
  parkingLot = {},
  availability = {},
) => {
  return {
    ...parkingLot,
    vehicleTypes: parkingLot.vehicleTypes?.length
      ? parkingLot.vehicleTypes
      : availability.vehicleTypes || [],
    availableSpacesByVehicleType: {
      ...(parkingLot.availableSpacesByVehicleType || {}),
      ...(availability.availableSpacesByVehicleType || {}),
    },
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
