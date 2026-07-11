import { Link, NavLink } from 'react-router-dom'

const navLinkClassName = ({ isActive }) => {
  return ['nav-link', isActive ? 'active' : ''].filter(Boolean).join(' ')
}

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-md site-navbar">
      <div className="container">
        <Link className="navbar-brand brand-logo" to="/" aria-label="停哪裡首頁">
          <span className="brand-logo__mark">停</span>
          <span className="brand-logo__name">停哪裡</span>
        </Link>

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
              <NavLink className={navLinkClassName} to="/">
                首頁
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClassName} to="/parking">
                停車場
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClassName} to="/about">
                關於
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
