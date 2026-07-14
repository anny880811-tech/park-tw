import {
  getTdxAccessToken,
  hasTdxCredentials,
} from '../server/tdxAuth.js'
import {
  mergeTdxParkingLotWithAvailability,
  normalizeTdxParkingAvailability,
  normalizeTdxParkingLot,
} from '../server/tdxParkingMapper.js'

const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']
const DEFAULT_CITY = 'Taichung'
const TDX_PARKING_API_BASE_URL = 'https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet'
const CAR_PARK_ENDPOINT = 'CarPark'
const PARKING_AVAILABILITY_ENDPOINT = 'ParkingAvailability'
const CAR_PARK_ENDPOINT_NAME = 'Parking/OffStreet/CarPark/City'
const PARKING_AVAILABILITY_ENDPOINT_NAME = 'Parking/OffStreet/ParkingAvailability/City'
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

const buildTdxParkingUrl = (endpoint, city) => {
  const params = new URLSearchParams({
    $top: '20',
    $format: 'JSON',
  })

  return `${TDX_PARKING_API_BASE_URL}/${endpoint}/City/${encodeURIComponent(city)}?${params.toString()}`
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
  const tdxResponse = await fetch(buildTdxParkingUrl(endpoint, city), {
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
        buildTdxParkingUrl(PARKING_AVAILABILITY_ENDPOINT, city),
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

    sendJson(response, 200, {
      parkingLots,
      streetParkingSpaces: [],
      meta: {
        source: 'tdx',
        mode: 'proxy',
        city,
        hasCarParkData: carParks.length > 0,
        hasAvailabilityData: availabilities.length > 0,
        totalCarParks: carParks.length,
        totalAvailabilities: availabilities.length,
        mergedParkingLots: parkingLots.length,
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
