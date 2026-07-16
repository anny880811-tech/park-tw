export const getGoogleMapsDirectionsUrl = ({ latitude, longitude }) => {
  const params = new URLSearchParams({
    api: '1',
    destination: `${latitude},${longitude}`,
    travelmode: 'driving',
  })

  return `https://www.google.com/maps/dir/?${params.toString()}`
}
