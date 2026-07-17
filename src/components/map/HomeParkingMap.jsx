import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MOBILE_MAP_ZOOM,
  DEFAULT_MAP_ZOOM,
  OPEN_STREET_MAP_TILE_LAYER,
  USER_LOCATION_MOBILE_ZOOM,
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
const createClusterIcon = (count) => createMapIcon({
  className: 'parking-map-marker parking-map-marker--cluster',
  html: `<span>${count}</span>`,
  iconAnchor: [23, 23],
  iconSize: [46, 46],
  popupAnchor: [0, -23],
})
const parkingPopupProps = {
  autoPan: true,
  autoPanPadding: [16, 16],
  keepInView: true,
  maxWidth: 260,
  minWidth: 144,
}
const CLUSTER_MAX_ZOOM = 16
const CLUSTER_PIXEL_RADIUS = 48
const MOBILE_MAP_MEDIA_QUERY = '(max-width: 767.98px)'

const useIsMobileMap = () => {
  const [isMobileMap, setIsMobileMap] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(MOBILE_MAP_MEDIA_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia(MOBILE_MAP_MEDIA_QUERY)
    const handleChange = (event) => {
      setIsMobileMap(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isMobileMap
}

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

const createSingleMarkerCluster = (marker) => ({
  key: marker.key,
  markers: [marker],
  position: marker.position,
})

const createParkingMarkerClusters = (markers, map, zoom) => {
  if (zoom >= CLUSTER_MAX_ZOOM) {
    return markers.map(createSingleMarkerCluster)
  }

  const clusters = []

  markers.forEach((marker) => {
    const point = map.latLngToLayerPoint([
      marker.position.latitude,
      marker.position.longitude,
    ])
    const matchingCluster = clusters.find((cluster) => {
      return point.distanceTo(cluster.point) <= CLUSTER_PIXEL_RADIUS
    })

    if (!matchingCluster) {
      clusters.push({
        key: marker.key,
        latitudeSum: marker.position.latitude,
        longitudeSum: marker.position.longitude,
        markers: [marker],
        point,
        position: marker.position,
      })

      return
    }

    const nextCount = matchingCluster.markers.length + 1

    matchingCluster.markers.push(marker)
    matchingCluster.latitudeSum += marker.position.latitude
    matchingCluster.longitudeSum += marker.position.longitude
    matchingCluster.point = L.point(
      (matchingCluster.point.x * (nextCount - 1) + point.x) / nextCount,
      (matchingCluster.point.y * (nextCount - 1) + point.y) / nextCount,
    )
    matchingCluster.position = {
      latitude: matchingCluster.latitudeSum / nextCount,
      longitude: matchingCluster.longitudeSum / nextCount,
    }
  })

  return clusters.map((cluster, index) => ({
    key: cluster.markers.length === 1
      ? cluster.markers[0].key
      : `cluster-${index}-${cluster.markers.length}-${cluster.key}`,
    markers: cluster.markers,
    position: cluster.position,
  }))
}

const ParkingMarkerPopup = ({ item, position }) => (
  <Popup {...parkingPopupProps}>
    <div className="parking-map__popup">
      <strong className="parking-map__popup-title">{item.name || '停車位置'}</strong>
      <span className="parking-map__popup-type">{getParkingTypeLabel(item)}</span>
      {(item.address || item.road) && (
        <span className="parking-map__popup-address">{item.address || item.road}</span>
      )}
      {item.displayDistance && (
        <span className="parking-map__popup-meta">距離：{item.displayDistance}</span>
      )}
      <span className="parking-map__popup-meta">
        剩餘車位：{getAvailableSpacesText(item)}
      </span>
      <a
        className="parking-map__popup-directions"
        href={getGoogleMapsDirectionsUrl(position)}
        rel="noopener noreferrer"
        target="_blank"
      >
        前往停車場
      </a>
    </div>
  </Popup>
)

const ParkingMarkers = ({ parkingLotMarkers, streetParkingMarkers }) => {
  const map = useMap()
  const [mapZoom, setMapZoom] = useState(map.getZoom())

  useMapEvents({
    zoomend: () => {
      setMapZoom(map.getZoom())
    },
  })

  const markerClusters = useMemo(() => {
    const markers = [
      ...parkingLotMarkers.map((marker) => ({
        ...marker,
        icon: parkingLotIcon,
      })),
      ...streetParkingMarkers.map((marker) => ({
        ...marker,
        icon: streetParkingIcon,
      })),
    ]

    return createParkingMarkerClusters(markers, map, mapZoom)
  }, [map, mapZoom, parkingLotMarkers, streetParkingMarkers])

  return markerClusters.map((cluster) => {
    if (cluster.markers.length > 1) {
      return (
        <Marker
          icon={createClusterIcon(cluster.markers.length)}
          key={cluster.key}
          position={[cluster.position.latitude, cluster.position.longitude]}
        />
      )
    }

    const marker = cluster.markers[0]

    return (
      <Marker
        icon={marker.icon}
        key={marker.key}
        position={[marker.position.latitude, marker.position.longitude]}
      >
        <ParkingMarkerPopup item={marker.item} position={marker.position} />
      </Marker>
    )
  })
}

const HomeParkingMap = ({
  parkingLots = [],
  streetParkingSpaces = [],
  userPosition,
}) => {
  const normalizedUserPosition = normalizePosition(userPosition)
  const isMobileMap = useIsMobileMap()
  const mapCenter = normalizedUserPosition || DEFAULT_MAP_CENTER
  const mapZoom = normalizedUserPosition
    ? isMobileMap
      ? USER_LOCATION_MOBILE_ZOOM
      : USER_LOCATION_ZOOM
    : isMobileMap
      ? DEFAULT_MOBILE_MAP_ZOOM
      : DEFAULT_MAP_ZOOM
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

      <ParkingMarkers
        parkingLotMarkers={parkingLotMarkers}
        streetParkingMarkers={streetParkingMarkers}
      />
    </MapContainer>
  )
}

export default HomeParkingMap
