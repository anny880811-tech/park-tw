const variantClassMap = {
  primary: 'text-bg-primary',
  success: 'text-bg-success',
  warning: 'text-bg-warning',
  danger: 'text-bg-danger',
  secondary: 'text-bg-secondary',
}

const Badge = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variantClass = variantClassMap[variant] || variantClassMap.primary
  const badgeClassName = ['badge', variantClass, className].filter(Boolean).join(' ')

  return <span className={badgeClassName}>{children}</span>
}

export default Badge
