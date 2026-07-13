const fetchParking = async (params) => {
  const queryString = params.toString()
  const url = queryString ? `/api/parking?${queryString}` : '/api/parking'
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch parking data.')
  }

  return response.json()
}

export const getNearbyParkingFromApi = async ({ latitude, longitude } = {}) => {
  const params = new URLSearchParams()

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
