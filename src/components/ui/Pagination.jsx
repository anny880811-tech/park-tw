const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return
    }

    onPageChange(page)
  }

  return (
    <nav
      aria-label="停車場列表分頁"
      className={className}
    >
      <ul className="pagination justify-content-center mb-0 flex-wrap gap-1">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            aria-label="上一頁"
            className="page-link"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            type="button"
          >
            上一頁
          </button>
        </li>

        {pages.map((page) => (
          <li
            className={`page-item ${page === currentPage ? 'active' : ''}`}
            key={page}
          >
            <button
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`第 ${page} 頁`}
              className="page-link"
              onClick={() => handlePageChange(page)}
              type="button"
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            aria-label="下一頁"
            className="page-link"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            type="button"
          >
            下一頁
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
