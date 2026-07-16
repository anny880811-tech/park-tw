import {
  VEHICLE_FILTER_OPTIONS,
  VEHICLE_FILTERS,
} from '../../constants/vehicleTypes.js'

const VehicleTypeFilter = ({
  value = VEHICLE_FILTERS.ALL,
  onChange,
  className = '',
}) => {
  return (
    <div
      aria-label="車種篩選"
      className={`vehicle-type-filter d-flex flex-wrap gap-2 ${className}`.trim()}
      role="group"
    >
      {VEHICLE_FILTER_OPTIONS.map((option) => {
        const isActive = value === option.value

        return (
          <button
            aria-pressed={isActive}
            className={`btn btn-sm ${
              isActive ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default VehicleTypeFilter
