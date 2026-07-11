const Input = ({
  id,
  label,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  helpText,
  className = '',
}) => {
  const inputClassName = [
    'form-control',
    error ? 'is-invalid' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className="ui-input">
      {label && (
        <label className="form-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        className={inputClassName}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {error && <div className="invalid-feedback">{error}</div>}
      {!error && helpText && <div className="form-text">{helpText}</div>}
    </div>
  )
}

export default Input
