export const VEHICLE_FILTERS = {
  ALL: 'all',
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
}

export const VEHICLE_FILTER_OPTIONS = [
  {
    label: '全部',
    value: VEHICLE_FILTERS.ALL,
  },
  {
    label: '汽車',
    value: VEHICLE_FILTERS.CAR,
  },
  {
    label: '機車',
    value: VEHICLE_FILTERS.MOTORCYCLE,
  },
]

export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_FILTERS.CAR]: '汽車',
  [VEHICLE_FILTERS.MOTORCYCLE]: '機車',
}
