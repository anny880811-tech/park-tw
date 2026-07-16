import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  OPEN_STREET_MAP_TILE_LAYER,
  USER_LOCATION_ZOOM,
} from '../../constants/map.js'
import { PARKING_TYPES } from '../../models/parkingModel.js'
import { normalizePosition } from '../../utils/coordinates.js'
import { getGoogleMapsDirectionsUrl } from '../../utils/navigation.js'

const createMapIcon = ({ className, html, iconAnchor, iconSize, popupAnchor }) => {
  return L.divIcon({
    className,
    html,
    iconAnchor,
    iconSize,
    popupAnchor,
  })
}

const userLocationIcon = createMapIcon({
  className: 'parking-map-marker parking-map-marker--user',
  html: '<span></span>',
  iconAnchor: [13, 13],
  iconSize: [26, 26],
  popupAnchor: [0, -13],
})
const parkingLotIcon = createMapIcon({
  className: 'parking-map-marker parking-map-marker--lot',
  html: '<span>P</span>',
  iconAnchor: [16, 40],
  iconSize: [32, 40],
  popupAnchor: [0, -40],
})
const streetParkingIcon = createMapIcon({
  className: 'parking-map-marker parking-map-marker--street',
  html: '<span>S</span>',
  iconAnchor: [14, 14],
  iconSize: [28, 28],
  popupAnchor: [0, -14],
})

const MapCenterSync = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    map.setView([center.latitude, center.longitude], zoom, {
      animate: true,
    })
  }, [center.latitude, center.longitude, map, zoom])

  return null
}

const getParkingTypeLabel = (item) => {
  if (item.type === PARKING_TYPES.STREET || item.road) {
    return '路邊停車格'
  }

  return '停車場'
}

const getAvailableSpacesText = (item) => {
  if (Number.isFinite(item.availableSpaces)) {
    return `${item.availableSpaces} 格`
  }

  if (item.type === PARKING_TYPES.STREET || item.road) {
    return '僅提供收費路段，無即時格位'
  }

  return '資料未提供'
}

const getMarkerKey = (item, index) => {
  return `${item.type || 'parking'}-${item.id || item.sectionId || item.spaceId || index}`
}

const HomeParkingMap = ({
  parkingLots = [],
  streetParkingSpaces = [],
  userPosition,
}) => {
  const normalizedUserPosition = normalizePosition(userPosition)
  const mapCenter = normalizedUserPosition || DEFAULT_MAP_CENTER
  const mapZoom = normalizedUserPosition ? USER_LOCATION_ZOOM : DEFAULT_MAP_ZOOM
  const parkingLotMarkers = useMemo(() => {
    return parkingLots
      .map((item, index) => ({
        item,
        key: getMarkerKey(item, index),
        position: normalizePosition(item),
      }))
      .filter((marker) => marker.position)
  }, [parkingLots])
  const streetParkingMarkers = useMemo(() => {
    return streetParkingSpaces
      .map((item, index) => ({
        item,
        key: getMarkerKey(item, index),
        position: normalizePosition(item),
      }))
      .filter((marker) => marker.position)
  }, [streetParkingSpaces])

  return (
    <MapContainer
      center={[mapCenter.latitude, mapCenter.longitude]}
      className="parking-map"
      scrollWheelZoom={false}
      zoom={mapZoom}
    >
      <MapCenterSync center={mapCenter} zoom={mapZoom} />
      <TileLayer
        attribution={OPEN_STREET_MAP_TILE_LAYER.attribution}
        url={OPEN_STREET_MAP_TILE_LAYER.url}
      />

      {normalizedUserPosition && (
        <Marker
          icon={userLocationIcon}
          position={[normalizedUserPosition.latitude, normalizedUserPosition.longitude]}
        >
          <Popup>
            <strong>目前位置</strong>
          </Popup>
        </Marker>
      )}

      {parkingLotMarkers.map(({ item, key, position }) => (
        <Marker
          icon={parkingLotIcon}
          key={key}
          position={[position.latitude, position.longitude]}
        >
          <Popup>
            <div className="parking-map__popup">
              <strong>{item.name || '停車位置'}</strong>
              <span>{getParkingTypeLabel(item)}</span>
              {(item.address || item.road) && <span>{item.address || item.road}</span>}
              {item.displayDistance && <span>距離：{item.displayDistance}</span>}
              <span>剩餘車位：{getAvailableSpacesText(item)}</span>
              <a
                href={getGoogleMapsDirectionsUrl(position)}
                rel="noopener noreferrer"
                target="_blank"
              >
                前往停車場
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {streetParkingMarkers.map(({ item, key, position }) => (
        <Marker
          icon={streetParkingIcon}
          key={key}
          position={[position.latitude, position.longitude]}
        >
          <Popup>
            <div className="parking-map__popup">
              <strong>{item.name || '停車位置'}</strong>
              <span>{getParkingTypeLabel(item)}</span>
              {(item.address || item.road) && <span>{item.address || item.road}</span>}
              {item.displayDistance && <span>距離：{item.displayDistance}</span>}
              <span>剩餘車位：{getAvailableSpacesText(item)}</span>
              <a
                href={getGoogleMapsDirectionsUrl(position)}
                rel="noopener noreferrer"
                target="_blank"
              >
                前往停車場
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default HomeParkingMap
