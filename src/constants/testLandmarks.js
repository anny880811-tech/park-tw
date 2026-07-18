const normalizeLandmarkKeyword = (keyword = '') => {
  return keyword.trim().toLowerCase()
}

export const SEARCH_LANDMARKS = [
  {
    id: 'taichung-city-hall',
    name: '台中市政府',
    aliases: ['台中市政府', '市政府', '市政中心'],
    city: 'Taichung',
    latitude: 24.161989,
    longitude: 120.646997,
  },
  {
    id: 'taichung-station',
    name: '台中車站',
    aliases: ['台中車站', '台中火車站', '臺中車站', '臺中火車站'],
    city: 'Taichung',
    latitude: 24.136829,
    longitude: 120.685011,
  },
  {
    id: 'fengjia-night-market',
    name: '逢甲夜市',
    aliases: ['逢甲夜市', '逢甲', '逢甲商圈'],
    city: 'Taichung',
    latitude: 24.179352,
    longitude: 120.646693,
  },
  {
    id: 'yizhong-street',
    name: '一中街',
    aliases: ['一中街', '一中', '一中商圈'],
    city: 'Taichung',
    latitude: 24.149261,
    longitude: 120.684092,
  },
  {
    id: 'calligraphy-greenway',
    name: '勤美草悟道',
    aliases: ['勤美', '勤美草悟道', '草悟道'],
    city: 'Taichung',
    latitude: 24.151478,
    longitude: 120.663887,
  },
  {
    id: 'shenji-new-village',
    name: '審計新村',
    aliases: ['審計新村', '審計'],
    city: 'Taichung',
    latitude: 24.145739,
    longitude: 120.663784,
  },
  {
    id: 'national-museum-of-natural-science',
    name: '國立自然科學博物館',
    aliases: ['科博館', '自然科學博物館', '國立自然科學博物館'],
    city: 'Taichung',
    latitude: 24.157936,
    longitude: 120.666049,
  },
  {
    id: 'national-taichung-theater',
    name: '台中國家歌劇院',
    aliases: ['台中國家歌劇院', '歌劇院', '台中歌劇院'],
    city: 'Taichung',
    latitude: 24.163068,
    longitude: 120.640327,
  },
  {
    id: 'gaomei-wetlands',
    name: '高美濕地',
    aliases: ['高美濕地', '高美'],
    city: 'Taichung',
    latitude: 24.312217,
    longitude: 120.549448,
  },
  {
    id: 'lihpao-land',
    name: '麗寶樂園',
    aliases: ['麗寶樂園', '麗寶', '麗寶outlet', '麗寶OUTLET'],
    city: 'Taichung',
    latitude: 24.324807,
    longitude: 120.69573,
  },
  {
    id: 'dakeng-scenic-area',
    name: '大坑風景區',
    aliases: ['大坑', '大坑風景區', '大坑步道'],
    city: 'Taichung',
    latitude: 24.187064,
    longitude: 120.744717,
  },
  {
    id: 'rainbow-village',
    name: '彩虹眷村',
    aliases: ['彩虹眷村'],
    city: 'Taichung',
    latitude: 24.133632,
    longitude: 120.60913,
  },
]

const HOME_LANDMARK_IDS = new Set([
  'taichung-station',
  'fengjia-night-market',
  'yizhong-street',
])

export const TEST_LANDMARKS = SEARCH_LANDMARKS.filter((landmark) => {
  return HOME_LANDMARK_IDS.has(landmark.id)
})

export const findSearchLandmarkByKeyword = (keyword) => {
  const normalizedKeyword = normalizeLandmarkKeyword(keyword)

  if (!normalizedKeyword) {
    return null
  }

  return SEARCH_LANDMARKS.find((landmark) => {
    return landmark.aliases.some((alias) => {
      return normalizeLandmarkKeyword(alias) === normalizedKeyword
    })
  }) || null
}
