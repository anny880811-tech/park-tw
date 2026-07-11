const variantClassMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline-primary',
  danger: 'btn-danger',
}

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
}) => {
  const variantClass = variantClassMap[variant] || variantClassMap.primary
  const buttonClassName = ['btn', variantClass, className].filter(Boolean).join(' ')

  return (
    <button
      className={buttonClassName}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}

export default Button
