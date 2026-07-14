const DEFAULT_API_CITY = 'Taichung'
let cachedParkingResult = null
let pendingParkingRequest = null

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

const fetchDefaultCityParking = async ({ latitude, longitude } = {}) => {
  if (cachedParkingResult) {
    return cachedParkingResult
  }

  if (pendingParkingRequest) {
    return pendingParkingRequest
  }

  const params = new URLSearchParams()

  params.set('city', DEFAULT_API_CITY)

  if (Number.isFinite(latitude)) {
    params.set('latitude', latitude)
  }

  if (Number.isFinite(longitude)) {
    params.set('longitude', longitude)
  }

  pendingParkingRequest = fetchParking(params)
    .then((result) => {
      cachedParkingResult = result

      return result
    })
    .finally(() => {
      pendingParkingRequest = null
    })

  return pendingParkingRequest
}

export const getNearbyParkingFromApi = async ({ latitude, longitude } = {}) => {
  return fetchDefaultCityParking({ latitude, longitude })
}

export const searchParkingLotsFromApi = async ({
  keyword,
  latitude,
  longitude,
} = {}) => {
  const result = await fetchDefaultCityParking({ latitude, longitude })

  return {
    ...result,
    parkingLots: filterParkingLotsByKeyword(result.parkingLots, keyword),
  }
}
