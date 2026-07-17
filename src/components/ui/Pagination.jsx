import { MAX_PARKING_PAGES } from '../../constants/pagination.js'

const getMobilePages = (currentPage, totalPages) => {
  if (totalPages <= 2) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage >= totalPages) {
    return [totalPages - 1, totalPages]
  }

  return [currentPage, currentPage + 1]
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  maxPages = MAX_PARKING_PAGES,
  usePageSelect = false,
}) => {
  const effectiveTotalPages = maxPages
    ? Math.min(totalPages, maxPages)
    : totalPages
  const effectiveCurrentPage = Math.min(currentPage, effectiveTotalPages)

  if (effectiveTotalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: effectiveTotalPages }, (_, index) => index + 1)
  const mobilePages = getMobilePages(effectiveCurrentPage, effectiveTotalPages)
  const shouldUseDesktopPageSelect = usePageSelect || effectiveTotalPages > MAX_PARKING_PAGES

  const handlePageChange = (page) => {
    if (page < 1 || page > effectiveTotalPages || page === effectiveCurrentPage) {
      return
    }

    onPageChange(page)
  }

  return (
    <nav
      aria-label="停車場列表分頁"
      className={`parking-pagination ${className}`.trim()}
    >
      <div className="parking-pagination__mobile d-flex d-md-none align-items-center justify-content-center gap-1 flex-nowrap px-2">
        <button
          aria-label="上一頁"
          className="btn btn-outline-secondary btn-sm parking-pagination__button flex-shrink-0"
          disabled={effectiveCurrentPage === 1}
          onClick={() => handlePageChange(effectiveCurrentPage - 1)}
          type="button"
        >
          上一頁
        </button>

        {mobilePages.map((page) => (
          <button
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`第 ${page} 頁`}
            className={`btn btn-sm parking-pagination__button flex-shrink-0 ${
              page === effectiveCurrentPage ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            key={page}
            onClick={() => handlePageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}

        <select
          aria-label="選擇頁碼"
          className="form-select form-select-sm parking-pagination__select flex-shrink-1"
          onChange={(event) => handlePageChange(Number(event.target.value))}
          value={effectiveCurrentPage}
        >
          {pages.map((page) => (
            <option key={page} value={page}>
              第 {page} / {effectiveTotalPages} 頁
            </option>
          ))}
        </select>

        <button
          aria-label="下一頁"
          className="btn btn-outline-secondary btn-sm parking-pagination__button flex-shrink-0"
          disabled={effectiveCurrentPage === effectiveTotalPages}
          onClick={() => handlePageChange(effectiveCurrentPage + 1)}
          type="button"
        >
          下一頁
        </button>
      </div>

      <ul className="pagination justify-content-center align-items-center mb-0 gap-1 d-none d-md-flex">
        <li className={`page-item ${effectiveCurrentPage === 1 ? 'disabled' : ''}`}>
          <button
            aria-label="上一頁"
            className="page-link"
            disabled={effectiveCurrentPage === 1}
            onClick={() => handlePageChange(effectiveCurrentPage - 1)}
            type="button"
          >
            上一頁
          </button>
        </li>

        {shouldUseDesktopPageSelect ? (
          <li className="page-item">
            <select
              aria-label="選擇頁碼"
              className="form-select form-select-sm parking-pagination__select"
              onChange={(event) => handlePageChange(Number(event.target.value))}
              value={effectiveCurrentPage}
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  第 {page} / {effectiveTotalPages} 頁
                </option>
              ))}
            </select>
          </li>
        ) : pages.map((page) => (
          <li
            className={`page-item ${page === effectiveCurrentPage ? 'active' : ''}`}
            key={page}
          >
            <button
              aria-current={page === effectiveCurrentPage ? 'page' : undefined}
              aria-label={`第 ${page} 頁`}
              className="page-link"
              onClick={() => handlePageChange(page)}
              type="button"
            >
              {page}
            </button>
          </li>
        ))}

        <li className={`page-item ${effectiveCurrentPage === effectiveTotalPages ? 'disabled' : ''}`}>
          <button
            aria-label="下一頁"
            className="page-link"
            disabled={effectiveCurrentPage === effectiveTotalPages}
            onClick={() => handlePageChange(effectiveCurrentPage + 1)}
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
