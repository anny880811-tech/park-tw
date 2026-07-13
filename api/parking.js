import {
  getTdxAccessToken,
  hasTdxCredentials,
} from '../server/tdxAuth.js'

const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']

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
    await getTdxAccessToken()

    sendJson(response, 200, {
      parkingLots: [],
      streetParkingSpaces: [],
      meta: {
        source: 'tdx',
        mode: 'tdx-auth-ready',
        tokenReady: true,
        message: 'TDX token flow is ready. Parking API integration is not implemented yet.',
      },
    })
  } catch {
    sendJson(response, 502, {
      parkingLots: [],
      streetParkingSpaces: [],
      meta: {
        source: 'tdx',
        mode: 'tdx-auth-error',
        tokenReady: false,
        message: 'Failed to prepare TDX token flow.',
      },
    })
  }
}
