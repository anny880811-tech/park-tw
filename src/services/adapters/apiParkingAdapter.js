const DEFAULT_API_CITY = 'Taichung'
const cachedParkingResults = new Map()
const pendingParkingRequests = new Map()

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

  const usableModes = ['minimal-api-integration', 'proxy']

  if (result.meta?.mode && !usableModes.includes(result.meta.mode)) {
    throw new Error('Parking API did not return usable data.')
  }

  return result
}

const getSafeCity = (city) => {
  return typeof city === 'string' && city.trim()
    ? city.trim()
    : DEFAULT_API_CITY
}

const fetchDefaultCityParking = async ({ city, latitude, longitude } = {}) => {
  const safeCity = getSafeCity(city)

  if (cachedParkingResults.has(safeCity)) {
    return cachedParkingResults.get(safeCity)
  }

  if (pendingParkingRequests.has(safeCity)) {
    return pendingParkingRequests.get(safeCity)
  }

  const params = new URLSearchParams()

  params.set('city', safeCity)

  if (Number.isFinite(latitude)) {
    params.set('latitude', latitude)
  }

  if (Number.isFinite(longitude)) {
    params.set('longitude', longitude)
  }

  const pendingParkingRequest = fetchParking(params)
    .then((result) => {
      cachedParkingResults.set(safeCity, result)

      return result
    })
    .finally(() => {
      pendingParkingRequests.delete(safeCity)
    })

  pendingParkingRequests.set(safeCity, pendingParkingRequest)

  return pendingParkingRequest
}

export const getNearbyParkingFromApi = async ({ city, latitude, longitude } = {}) => {
  return fetchDefaultCityParking({ city, latitude, longitude })
}

export const searchParkingLotsFromApi = async ({
  keyword,
  city,
  latitude,
  longitude,
} = {}) => {
  const result = await fetchDefaultCityParking({ city, latitude, longitude })

  return {
    ...result,
    parkingLots: filterParkingLotsByKeyword(result.parkingLots, keyword),
  }
}
