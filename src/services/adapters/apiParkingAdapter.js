const DEFAULT_API_CITY = 'Taichung'

const filterParkingLotsByKeyword = (parkingLots = [], keyword = '') => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return parkingLots
  }

  return parkingLots.filter((item) => {
    const searchableText = [
      item.name,
      item.address,
      item.district,
    ].filter(Boolean).join(' ').toLowerCase()

    return searchableText.includes(normalizedKeyword)
  })
}

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

  params.set('city', DEFAULT_API_CITY)

  const result = await fetchParking(params)

  return {
    ...result,
    parkingLots: filterParkingLotsByKeyword(result.parkingLots, keyword),
  }
}
