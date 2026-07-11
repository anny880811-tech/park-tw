import ParkingInfoCard from './ParkingInfoCard.jsx'

const NearbyParkingSection = ({
  title,
  description,
  items = [],
}) => {
  return (
    <section className="home-section">
      <div className="home-section__header">
        <h2>{title}</h2>
        {description && <p className="mb-0">{description}</p>}
      </div>

      <div className="row g-4">
        {items.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <ParkingInfoCard item={item} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default NearbyParkingSection
