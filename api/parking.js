import {
  getTdxAccessToken,
  hasTdxCredentials,
} from '../server/tdxAuth.js'
import {
  mergeTdxParkingLotWithAvailability,
  normalizeTdxStreetParking,
  normalizeTdxParkingAvailability,
  normalizeTdxParkingLot,
} from '../server/tdxParkingMapper.js'

const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']
const DEFAULT_CITY = 'Taichung'
const TDX_OFF_STREET_API_BASE_URL = 'https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet'
const TDX_ON_STREET_API_BASE_URL = 'https://tdx.transportdata.tw/api/basic/v1/Parking/OnStreet'
const CAR_PARK_ENDPOINT = 'CarPark'
const PARKING_AVAILABILITY_ENDPOINT = 'ParkingAvailability'
const STREET_PARKING_SEGMENT_ENDPOINT = 'ParkingSegment'
const CAR_PARK_ENDPOINT_NAME = 'Parking/OffStreet/CarPark/City'
const PARKING_AVAILABILITY_ENDPOINT_NAME = 'Parking/OffStreet/ParkingAvailability/City'
const STREET_PARKING_SEGMENT_ENDPOINT_NAME = 'Parking/OnStreet/ParkingSegment/City'
const SUPPORTED_CITIES = {
  taichung: 'Taichung',
  taipei: 'Taipei',
}

const getCity = (request) => {
  const requestUrl = new URL(request.url, 'http://localhost')
  const city = requestUrl.searchParams.get('city') || ''
  const normalizedCity = city.trim().toLowerCase()

  return SUPPORTED_CITIES[normalizedCity] || DEFAULT_CITY
}

const buildTdxParkingUrl = (baseUrl, endpoint, city) => {
  const params = new URLSearchParams({
    $format: 'JSON',
  })

  return `${baseUrl}/${endpoint}/City/${encodeURIComponent(city)}?${params.toString()}`
}

const extractCarParks = (tdxResponse) => {
  if (Array.isArray(tdxResponse)) {
    return tdxResponse.flatMap((item) => {
      const carParks = item.CarParks || []

      return carParks.map((carPark) => ({
        ...carPark,
        UpdateTime: carPark.UpdateTime || item.UpdateTime || '',
        SrcUpdateTime: carPark.SrcUpdateTime || item.SrcUpdateTime || '',
      }))
    })
  }

  const carParks = tdxResponse?.CarParks || []

  return carParks.map((carPark) => ({
    ...carPark,
    UpdateTime: carPark.UpdateTime || tdxResponse?.UpdateTime || '',
    SrcUpdateTime: carPark.SrcUpdateTime || tdxResponse?.SrcUpdateTime || '',
  }))
}

const extractParkingAvailabilities = (tdxResponse) => {
  if (Array.isArray(tdxResponse)) {
    return tdxResponse.flatMap((item) => {
      const parkingAvailabilities = item.ParkingAvailabilities || []

      return parkingAvailabilities.map((availability) => ({
        ...availability,
        DataCollectTime: availability.DataCollectTime || item.DataCollectTime || '',
        UpdateTime: availability.UpdateTime || item.UpdateTime || '',
        SrcUpdateTime: availability.SrcUpdateTime || item.SrcUpdateTime || '',
      }))
    })
  }

  const parkingAvailabilities = tdxResponse?.ParkingAvailabilities || []

  return parkingAvailabilities.map((availability) => ({
    ...availability,
    DataCollectTime: availability.DataCollectTime || tdxResponse?.DataCollectTime || '',
    UpdateTime: availability.UpdateTime || tdxResponse?.UpdateTime || '',
    SrcUpdateTime: availability.SrcUpdateTime || tdxResponse?.SrcUpdateTime || '',
  }))
}

const extractStreetParkingSpaces = (tdxResponse) => {
  const isStreetItem = (item = {}) => {
    return Boolean(
      item.ParkingSegmentID
      || item.SegmentID
      || item.RoadSectionID
      || item.ParkingSpaceID
      || item.SpaceID
      || item.RoadName
      || item.ParkingSegmentName
    )
  }

  const getStreetItems = (item = {}) => {
    const streetItems = (
      item.ParkingSegments
      || item.ParkingSpaces
      || item.StreetParkingSpaces
      || item.OnStreetParkingSpaces
      || item.RoadSections
      || []
    )

    if (streetItems.length > 0) {
      return streetItems
    }

    return isStreetItem(item) ? [item] : []
  }

  if (Array.isArray(tdxResponse)) {
    return tdxResponse.flatMap((item) => {
      const streetItems = getStreetItems(item)

      return streetItems.map((streetItem) => ({
        ...streetItem,
        UpdateTime: streetItem.UpdateTime || item.UpdateTime || '',
        DataCollectTime: streetItem.DataCollectTime || item.DataCollectTime || '',
      }))
    })
  }

  return getStreetItems(tdxResponse).map((streetItem) => ({
    ...streetItem,
    UpdateTime: streetItem.UpdateTime || tdxResponse?.UpdateTime || '',
    DataCollectTime: streetItem.DataCollectTime || tdxResponse?.DataCollectTime || '',
  }))
}

const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data)
}

const sendParkingError = ({
  response,
  city,
  endpoint,
  errorStage,
  status,
  tokenReady = true,
}) => {
  sendJson(response, 502, {
    parkingLots: [],
    streetParkingSpaces: [],
    meta: {
      source: 'tdx',
      mode: 'minimal-api-error',
      city,
      endpoint,
      errorStage,
      status,
      tokenReady,
      message: 'Failed to fetch TDX parking data.',
      detail: 'TDX parking request failed.',
    },
  })
}

const fetchTdxJson = async ({
  accessToken,
  city,
  endpoint,
  endpointName,
  errorStage,
  response,
}) => {
  const tdxResponse = await fetch(buildTdxParkingUrl(TDX_OFF_STREET_API_BASE_URL, endpoint, city), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!tdxResponse.ok) {
    sendParkingError({
      response,
      city,
      endpoint: endpointName,
      errorStage,
      status: tdxResponse.status,
    })
    return null
  }

  return tdxResponse.json()
}

const fetchOptionalTdxJson = async ({
  accessToken,
  baseUrl,
  city,
  endpoint,
}) => {
  try {
    const tdxResponse = await fetch(buildTdxParkingUrl(baseUrl, endpoint, city), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!tdxResponse.ok) {
      return {
        data: null,
        status: tdxResponse.status,
      }
    }

    return {
      data: await tdxResponse.json(),
      status: tdxResponse.status,
    }
  } catch {
    return {
      data: null,
      status: null,
    }
  }
}

export default async function handler(request, response) {
  const city = getCity(request)

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendJson(response, 405, {
      message: 'Method not allowed.',
    })
    return
  }

  if (!hasTdxCredentials()) {
    sendJson(response, 200, {
      parkingLots: [],
      streetParkingSpaces: [],
      meta: {
        source: 'tdx',
        mode: 'proxy-skeleton',
        message: 'TDX environment variables are not configured.',
        requiredEnv: REQUIRED_ENV,
      },
    })
    return
  }

  try {
    let accessToken

    try {
      accessToken = await getTdxAccessToken()
    } catch {
      sendParkingError({
        response,
        city,
        endpoint: CAR_PARK_ENDPOINT_NAME,
        errorStage: 'tdx-auth',
        tokenReady: false,
      })
      return
    }

    let rawCarParkData

    try {
      rawCarParkData = await fetchTdxJson({
        accessToken,
        city,
        endpoint: CAR_PARK_ENDPOINT,
        endpointName: CAR_PARK_ENDPOINT_NAME,
        errorStage: 'tdx-fetch-carpark',
        response,
      })
    } catch {
      sendParkingError({
        response,
        city,
        endpoint: CAR_PARK_ENDPOINT_NAME,
        errorStage: 'tdx-parse-carpark',
      })
      return
    }

    if (!rawCarParkData) {
      return
    }

    let rawAvailabilityData = null
    let availabilityFetchStatus = null

    try {
      const availabilityResponse = await fetch(
        buildTdxParkingUrl(
          TDX_OFF_STREET_API_BASE_URL,
          PARKING_AVAILABILITY_ENDPOINT,
          city,
        ),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      availabilityFetchStatus = availabilityResponse.status

      if (availabilityResponse.ok) {
        rawAvailabilityData = await availabilityResponse.json()
      }
    } catch {
      rawAvailabilityData = null
    }

    let parkingLots
    let carParks
    let availabilities
    let streetParkingSpaces = []
    let streetParkingStatus = null

    try {
      carParks = extractCarParks(rawCarParkData).map(normalizeTdxParkingLot)
      availabilities = extractParkingAvailabilities(rawAvailabilityData)
        .map(normalizeTdxParkingAvailability)

      const availabilityMap = new Map(
        availabilities
          .filter((availability) => availability.id)
          .map((availability) => [availability.id, availability]),
      )

      parkingLots = carParks.map((carPark) => {
        return mergeTdxParkingLotWithAvailability(
          carPark,
          availabilityMap.get(carPark.id),
        )
      })

    } catch {
      sendParkingError({
        response,
        city,
        endpoint: CAR_PARK_ENDPOINT_NAME,
        errorStage: 'mapper',
      })
      return
    }

    try {
      const streetParkingResult = await fetchOptionalTdxJson({
        accessToken,
        baseUrl: TDX_ON_STREET_API_BASE_URL,
        city,
        endpoint: STREET_PARKING_SEGMENT_ENDPOINT,
      })

      streetParkingStatus = streetParkingResult.status
      streetParkingSpaces = extractStreetParkingSpaces(streetParkingResult.data)
        .map((item) => normalizeTdxStreetParking(item, { city }))
        .filter((item) => item.id || item.name || item.road)
    } catch {
      streetParkingSpaces = []
    }

    sendJson(response, 200, {
      parkingLots,
      streetParkingSpaces,
      meta: {
        source: 'tdx',
        mode: 'proxy',
        city,
        hasCarParkData: carParks.length > 0,
        hasAvailabilityData: availabilities.length > 0,
        totalCarParks: carParks.length,
        totalAvailabilities: availabilities.length,
        mergedParkingLots: parkingLots.length,
        hasStreetParkingData: streetParkingSpaces.length > 0,
        streetParkingEndpoint: STREET_PARKING_SEGMENT_ENDPOINT_NAME,
        streetParkingStatus,
        totalStreetParkingSpaces: streetParkingSpaces.length,
        streetParkingUpdatedAt:
          streetParkingSpaces.find((item) => item.updatedAt)?.updatedAt || null,
        availabilityEndpoint: PARKING_AVAILABILITY_ENDPOINT_NAME,
        availabilityStatus: availabilityFetchStatus,
        updatedAt: parkingLots.find((item) => item.updatedAt)?.updatedAt || null,
        tokenReady: true,
      },
    })
  } catch {
    sendParkingError({
      response,
      city,
      endpoint: CAR_PARK_ENDPOINT_NAME,
      errorStage: 'unknown',
      tokenReady: false,
    })
  }
}
