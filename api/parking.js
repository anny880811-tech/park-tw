const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']

const sendJson = (response, statusCode, data) => {
  response.status(statusCode).json(data)
}

const hasRequiredEnvironment = () => {
  return REQUIRED_ENV.every((key) => Boolean(process.env[key]))
}

export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    sendJson(response, 405, {
      message: 'Method not allowed.',
    })
    return
  }

  if (!hasRequiredEnvironment()) {
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

  sendJson(response, 200, {
    parkingLots: [],
    streetParkingSpaces: [],
    meta: {
      source: 'tdx',
      mode: 'proxy-skeleton',
      message: 'TDX API integration is not implemented yet.',
    },
  })
}
