const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
}) => {
  const cardClassName = ['card ui-card h-100', className].filter(Boolean).join(' ')

  return (
    <article className={cardClassName}>
      <div className="card-body">
        {(title || subtitle) && (
          <div className="ui-card__header">
            {title && <h3 className="card-title ui-card__title">{title}</h3>}
            {subtitle && <p className="card-subtitle ui-card__subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="ui-card__content">{children}</div>
      </div>
      {footer && <div className="card-footer ui-card__footer">{footer}</div>}
    </article>
  )
}

export default Card
