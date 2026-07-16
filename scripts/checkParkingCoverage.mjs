const DEFAULT_BASE_URL = 'https://park-tw.vercel.app'
const REQUEST_DELAY_MS = 3000
const REQUEST_TIMEOUT_MS = 15000

const cities = [
  { name: '臺北市', query: 'Taipei' },
  { name: '新北市', query: 'NewTaipei' },
  { name: '桃園市', query: 'Taoyuan' },
  { name: '臺中市', query: 'Taichung' },
  { name: '臺南市', query: 'Tainan' },
  { name: '高雄市', query: 'Kaohsiung' },
  { name: '基隆市', query: 'Keelung' },
  { name: '新竹市', query: 'Hsinchu' },
  { name: '嘉義市', query: 'Chiayi' },
  { name: '新竹縣', query: 'HsinchuCounty' },
  { name: '苗栗縣', query: 'MiaoliCounty' },
  { name: '彰化縣', query: 'ChanghuaCounty' },
  { name: '南投縣', query: 'NantouCounty' },
  { name: '雲林縣', query: 'YunlinCounty' },
  { name: '嘉義縣', query: 'ChiayiCounty' },
  { name: '屏東縣', query: 'PingtungCounty' },
  { name: '宜蘭縣', query: 'YilanCounty' },
  { name: '花蓮縣', query: 'HualienCounty' },
  { name: '臺東縣', query: 'TaitungCounty' },
  { name: '澎湖縣', query: 'PenghuCounty' },
  { name: '金門縣', query: 'KinmenCounty' },
  { name: '連江縣', query: 'LienchiangCounty' },
]

const args = process.argv.slice(2)

const getArgValue = (name) => {
  const prefix = `${name}=`
  const arg = args.find((item) => item.startsWith(prefix))

  return arg ? arg.slice(prefix.length) : ''
}

const baseUrl = getArgValue('--base-url') || DEFAULT_BASE_URL
const cityFilter = getArgValue('--city')
const isDryRun = args.includes('--dry-run')
const selectedCities = cityFilter
  ? cities.filter((city) => city.query === cityFilter)
  : cities

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms)
})

const isFiniteCoordinate = (latitude, longitude) => {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180
}

const countBy = (items, predicate) => {
  return items.filter(predicate).length
}

const countDuplicateIds = (items) => {
  const seenIds = new Set()
  const duplicateIds = new Set()

  items.forEach((item) => {
    if (!item?.id) {
      return
    }

    if (seenIds.has(item.id)) {
      duplicateIds.add(item.id)
      return
    }

    seenIds.add(item.id)
  })

  return duplicateIds.size
}

const countVehicleType = (items, vehicleType) => {
  return countBy(items, (item) => {
    return Array.isArray(item.vehicleTypes)
      && item.vehicleTypes.includes(vehicleType)
  })
}

const summarizeItems = (items = []) => {
  return {
    total: items.length,
    withCoordinates: countBy(items, (item) => {
      return isFiniteCoordinate(item.latitude, item.longitude)
    }),
    withAvailableSpaces: countBy(items, (item) => Number.isFinite(item.availableSpaces)),
    withTotalSpaces: countBy(items, (item) => Number.isFinite(item.totalSpaces)),
    withVehicleTypes: countBy(items, (item) => {
      return Array.isArray(item.vehicleTypes) && item.vehicleTypes.length > 0
    }),
    carRecognized: countVehicleType(items, 'car'),
    motorcycleRecognized: countVehicleType(items, 'motorcycle'),
    duplicateIds: countDuplicateIds(items),
  }
}

const getSupportStatus = ({
  httpStatus,
  parkingLots,
  streetParkingSpaces,
  rateLimited,
  fallbackCity,
}) => {
  if (rateLimited) {
    return '受流量限制，待補測'
  }

  if ([400, 404].includes(httpStatus) || fallbackCity) {
    return 'city mapping 或 endpoint 待確認'
  }

  if ([500, 502, 503].includes(httpStatus)) {
    return 'API 或上游服務錯誤'
  }

  if (httpStatus !== 200) {
    return '待確認'
  }

  if (parkingLots.total > 0 && streetParkingSpaces.total > 0) {
    return parkingLots.withCoordinates > 0 && streetParkingSpaces.withCoordinates > 0
      ? '完整支援'
      : '部分支援'
  }

  if (parkingLots.total > 0 || streetParkingSpaces.total > 0) {
    return '部分支援'
  }

  return '目前無資料'
}

const toSupportText = (summary) => {
  if (summary.total === 0) {
    return '目前無可篩選資料'
  }

  return summary.withCoordinates > 0 ? '可' : '不可'
}

const fetchCityCoverage = async ({ name, query }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const url = new URL('/api/parking', baseUrl)

  url.searchParams.set('city', query)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    })
    const httpStatus = response.status
    let payload = null

    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    const parkingLots = summarizeItems(payload?.parkingLots || [])
    const streetParkingSpaces = summarizeItems(payload?.streetParkingSpaces || [])
    const meta = payload?.meta || {}
    const fallbackCity = Boolean(meta.city && meta.city !== query)
    const endpointStatuses = [
      meta.availabilityStatus,
      meta.streetParkingStatus,
    ].filter((status) => status !== undefined && status !== null)
    const rateLimited = httpStatus === 429 || endpointStatuses.includes(429)
    const supportStatus = getSupportStatus({
      httpStatus,
      parkingLots,
      streetParkingSpaces,
      rateLimited,
      fallbackCity,
    })

    return {
      name,
      query,
      httpStatus,
      requestedCity: query,
      responseCity: meta.city || '',
      fallbackCity,
      parkingLots,
      streetParkingSpaces,
      carRecognized: parkingLots.carRecognized + streetParkingSpaces.carRecognized,
      motorcycleRecognized:
        parkingLots.motorcycleRecognized + streetParkingSpaces.motorcycleRecognized,
      offStreet2KmSupport: toSupportText(parkingLots),
      street2KmSupport: toSupportText(streetParkingSpaces),
      availabilityStatus: meta.availabilityStatus ?? '',
      streetParkingStatus: meta.streetParkingStatus ?? '',
      supportStatus,
      note: fallbackCity
        ? `response city is ${meta.city}`
        : '',
      rateLimited,
    }
  } catch (error) {
    const isTimeout = error.name === 'AbortError'

    return {
      name,
      query,
      httpStatus: isTimeout ? 'timeout' : 'request-error',
      requestedCity: query,
      responseCity: '',
      fallbackCity: false,
      parkingLots: summarizeItems([]),
      streetParkingSpaces: summarizeItems([]),
      carRecognized: 0,
      motorcycleRecognized: 0,
      offStreet2KmSupport: '尚未確認',
      street2KmSupport: '尚未確認',
      availabilityStatus: '',
      streetParkingStatus: '',
      supportStatus: isTimeout ? 'API 或上游服務錯誤' : '待確認',
      note: isTimeout ? 'request timeout' : 'request failed',
      rateLimited: false,
    }
  } finally {
    clearTimeout(timeout)
  }
}

const printSummary = (result) => {
  console.log([
    result.name,
    `city=${result.query}`,
    `http=${result.httpStatus}`,
    `responseCity=${result.responseCity || '-'}`,
    `parkingLots=${result.parkingLots.total}`,
    `parkingLotsCoordinates=${result.parkingLots.withCoordinates}`,
    `streetParkingSpaces=${result.streetParkingSpaces.total}`,
    `streetCoordinates=${result.streetParkingSpaces.withCoordinates}`,
    `car=${result.carRecognized}`,
    `motorcycle=${result.motorcycleRecognized}`,
    `status=${result.supportStatus}`,
    result.note ? `note=${result.note}` : '',
  ].filter(Boolean).join(' | '))
}

if (isDryRun) {
  console.log(`baseUrl=${baseUrl}`)
  console.log(`delayMs=${REQUEST_DELAY_MS}`)
  console.log(`timeoutMs=${REQUEST_TIMEOUT_MS}`)
  selectedCities.forEach((city) => {
    console.log(`${city.name} | city=${city.query}`)
  })
  process.exit(0)
}

const results = []

for (let index = 0; index < selectedCities.length; index += 1) {
  const result = await fetchCityCoverage(selectedCities[index])

  results.push(result)
  printSummary(result)

  if (result.rateLimited) {
    console.log('rate-limit-detected=true')
    break
  }

  if (index < selectedCities.length - 1) {
    await wait(REQUEST_DELAY_MS)
  }
}

console.log('JSON_SUMMARY_START')
console.log(JSON.stringify({
  baseUrl,
  delayMs: REQUEST_DELAY_MS,
  timeoutMs: REQUEST_TIMEOUT_MS,
  completedCities: results.length,
  stoppedByRateLimit: results.some((result) => result.rateLimited),
  results,
}, null, 2))
console.log('JSON_SUMMARY_END')
