import {
  getTdxAccessToken,
  hasTdxCredentials,
} from '../server/tdxAuth.js'
import { normalizeTdxParkingLot } from '../server/tdxParkingMapper.js'

const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']
const DEFAULT_CITY = 'Taipei'
const TDX_PARKING_API_BASE_URL = 'https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/CarPark/City'

const getCity = (request) => {
  const requestUrl = new URL(request.url, 'http://localhost')
  const city = requestUrl.searchParams.get('city') || DEFAULT_CITY

  return /^[A-Za-z]+$/.test(city) ? city : DEFAULT_CITY
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
    const city = getCity(request)
    const accessToken = await getTdxAccessToken()
    const tdxResponse = await fetch(buildTdxParkingUrl(city), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!tdxResponse.ok) {
      throw new Error(`TDX parking endpoint responded with status ${tdxResponse.status}.`)
    }

    const rawParkingData = await tdxResponse.json()
    const parkingLots = extractCarParks(rawParkingData).map(normalizeTdxParkingLot)

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
        tokenReady: false,
        message: 'Failed to fetch TDX parking data.',
        detail: 'TDX parking request failed.',
      },
    })
  }
}
