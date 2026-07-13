import {
  getTdxAccessToken,
  hasTdxCredentials,
} from '../server/tdxAuth.js'
import { normalizeTdxParkingLot } from '../server/tdxParkingMapper.js'

const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']
const DEFAULT_CITY = 'Taichung'
const TDX_PARKING_API_BASE_URL = 'https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/CarPark/City'
const SAFE_ENDPOINT_NAME = 'Parking/OffStreet/CarPark/City'
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

const buildTdxParkingUrl = (city) => {
  const params = new URLSearchParams({
    $top: '20',
    $format: 'JSON',
  })

  return `${TDX_PARKING_API_BASE_URL}/${encodeURIComponent(city)}?${params.toString()}`
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

const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data)
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
      sendJson(response, 502, {
        parkingLots: [],
        streetParkingSpaces: [],
        meta: {
          source: 'tdx',
          mode: 'minimal-api-error',
          city,
          endpoint: SAFE_ENDPOINT_NAME,
          errorStage: 'tdx-auth',
          tokenReady: false,
          message: 'Failed to fetch TDX parking data.',
          detail: 'TDX parking request failed.',
        },
      })
      return
    }

    const tdxResponse = await fetch(buildTdxParkingUrl(city), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!tdxResponse.ok) {
      sendJson(response, 502, {
        parkingLots: [],
        streetParkingSpaces: [],
        meta: {
          source: 'tdx',
          mode: 'minimal-api-error',
          city,
          endpoint: SAFE_ENDPOINT_NAME,
          errorStage: 'tdx-fetch',
          status: tdxResponse.status,
          tokenReady: true,
          message: 'Failed to fetch TDX parking data.',
          detail: 'TDX parking request failed.',
        },
      })
      return
    }

    let rawParkingData

    try {
      rawParkingData = await tdxResponse.json()
    } catch {
      sendJson(response, 502, {
        parkingLots: [],
        streetParkingSpaces: [],
        meta: {
          source: 'tdx',
          mode: 'minimal-api-error',
          city,
          endpoint: SAFE_ENDPOINT_NAME,
          errorStage: 'tdx-parse',
          tokenReady: true,
          message: 'Failed to fetch TDX parking data.',
          detail: 'TDX parking request failed.',
        },
      })
      return
    }

    let parkingLots

    try {
      parkingLots = extractCarParks(rawParkingData).map(normalizeTdxParkingLot)
    } catch {
      sendJson(response, 502, {
        parkingLots: [],
        streetParkingSpaces: [],
        meta: {
          source: 'tdx',
          mode: 'minimal-api-error',
          city,
          endpoint: SAFE_ENDPOINT_NAME,
          errorStage: 'mapper',
          tokenReady: true,
          message: 'Failed to fetch TDX parking data.',
          detail: 'TDX parking request failed.',
        },
      })
      return
    }

    sendJson(response, 200, {
      parkingLots,
      streetParkingSpaces: [],
      meta: {
        source: 'tdx',
        mode: 'minimal-api-integration',
        city,
        count: parkingLots.length,
        tokenReady: true,
      },
    })
  } catch {
    sendJson(response, 502, {
      parkingLots: [],
      streetParkingSpaces: [],
      meta: {
        source: 'tdx',
        mode: 'minimal-api-error',
        city,
        endpoint: SAFE_ENDPOINT_NAME,
        errorStage: 'unknown',
        tokenReady: false,
        message: 'Failed to fetch TDX parking data.',
        detail: 'TDX parking request failed.',
      },
    })
  }
}
