import { Route, Routes } from 'react-router-dom'
import AboutPage from '../pages/AboutPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import ParkingPage from '../pages/ParkingPage.jsx'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<ParkingPage />} path="/parking" />
      <Route element={<AboutPage />} path="/about" />
    </Routes>
  )
}

export default AppRoutes
