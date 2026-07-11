import Button from './Button.jsx'
import Input from './Input.jsx'

const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = '搜尋地點或停車場',
  buttonText = '搜尋',
  disabled = false,
  className = '',
}) => {
  const searchBarClassName = [
    'search-bar d-flex flex-column flex-sm-row gap-2',
    className,
  ].filter(Boolean).join(' ')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSubmit) {
      onSubmit(event)
    }
  }

  return (
    <form className={searchBarClassName} onSubmit={handleSubmit}>
      <Input
        className="search-bar__input"
        disabled={disabled}
        id="search-bar-keyword"
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
      <Button
        className="search-bar__button"
        disabled={disabled}
        type="submit"
        variant="primary"
      >
        {buttonText}
      </Button>
    </form>
  )
}

export default SearchBar
