const DEFAULT_API_CITY = 'Taichung'

const fetchParking = async (params) => {
  const queryString = params.toString()
  const url = queryString ? `/api/parking?${queryString}` : '/api/parking'
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch parking data.')
  }

  const result = await response.json()

  if (result.meta?.mode && result.meta.mode !== 'minimal-api-integration') {
    throw new Error('Parking API did not return usable data.')
  }

  return result
}

export const getNearbyParkingFromApi = async ({ latitude, longitude } = {}) => {
  const params = new URLSearchParams()

  params.set('city', DEFAULT_API_CITY)

  if (Number.isFinite(latitude)) {
    params.set('latitude', latitude)
  }

  if (Number.isFinite(longitude)) {
    params.set('longitude', longitude)
  }

  return fetchParking(params)
}

export const searchParkingLotsFromApi = async ({ keyword } = {}) => {
  const params = new URLSearchParams()

  if (keyword) {
    params.set('keyword', keyword)
  }

  return fetchParking(params)
}
