const TDX_TOKEN_ENDPOINT = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token'
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000
const REQUIRED_ENV = ['TDX_CLIENT_ID', 'TDX_CLIENT_SECRET']

let cachedToken = null
let tokenExpiresAt = 0

export const hasTdxCredentials = () => {
  return REQUIRED_ENV.every((key) => Boolean(process.env[key]))
}

const getMissingEnv = () => {
  return REQUIRED_ENV.filter((key) => !process.env[key])
}

const isTokenValid = () => {
  return Boolean(cachedToken) && Date.now() < tokenExpiresAt - TOKEN_EXPIRY_BUFFER_MS
}

export const getTdxAccessToken = async () => {
  if (!hasTdxCredentials()) {
    const missingEnv = getMissingEnv()

    throw new Error(`TDX environment variables are not configured: ${missingEnv.join(', ')}`)
  }

  if (isTokenValid()) {
    return cachedToken
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.TDX_CLIENT_ID,
    client_secret: process.env.TDX_CLIENT_SECRET,
  })

  const response = await fetch(TDX_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error('Failed to fetch TDX access token.')
  }

  const tokenResponse = await response.json()

  if (!tokenResponse.access_token) {
    throw new Error('TDX token response does not include an access token.')
  }

  cachedToken = tokenResponse.access_token
  tokenExpiresAt = Date.now() + ((tokenResponse.expires_in || 0) * 1000)

  return cachedToken
}
