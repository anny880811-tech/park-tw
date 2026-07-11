const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-md site-navbar">
      <div className="container">
        <a className="navbar-brand brand-logo" href="#" aria-label="停哪裡首頁">
          <span className="brand-logo__mark">停</span>
          <span className="brand-logo__name">停哪裡</span>
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#siteNavbar"
          aria-controls="siteNavbar"
          aria-expanded="false"
          aria-label="切換導覽選單"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="siteNavbar">
          <ul className="navbar-nav ms-md-auto mt-3 mt-md-0 gap-md-2">
            <li className="nav-item">
              <a className="nav-link" href="#">
                首頁
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                停車場
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                關於
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
