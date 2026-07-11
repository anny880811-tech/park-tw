import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-layout__content">{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout
