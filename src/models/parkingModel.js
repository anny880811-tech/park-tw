export const PARKING_SOURCES = {
  TDX: 'tdx',
  LOCAL_OPEN_DATA: 'localOpenData',
}

export const PARKING_TYPES = {
  OFF_STREET: 'offStreet',
  STREET: 'street',
}

export const PARKING_STATUS = {
  AVAILABLE: 'available',
  FULL: 'full',
  CLOSED: 'closed',
  UNKNOWN: 'unknown',
}

export const parkingLotModelExample = {
  id: '',
  name: '',
  type: PARKING_TYPES.OFF_STREET,
  source: '',
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

export const streetParkingModelExample = {
  id: '',
  name: '',
  type: PARKING_TYPES.STREET,
  source: '',
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

export const normalizeParkingLot = (rawItem, source) => {
  // TODO: Map TDX or local Open Data fields into this normalized shape.
  return {
    id: '',
    name: '',
    type: PARKING_TYPES.OFF_STREET,
    source,
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
    rawItem,
  }
}

export const normalizeStreetParking = (rawItem, source) => {
  // TODO: Map TDX or local Open Data fields into this normalized shape.
  return {
    id: '',
    name: '',
    type: PARKING_TYPES.STREET,
    source,
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
    rawItem,
  }
}
