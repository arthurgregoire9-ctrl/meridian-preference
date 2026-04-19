import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './LandingPage.jsx'
import GuestPage from './GuestPage.jsx'
import CrewPage from './CrewPage.jsx'
import AdminPage from './AdminPage.jsx'
import SuperAdminPage from './SuperAdminPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/guest/:token" element={<GuestPage />} />
        <Route path="/crew/:token" element={<CrewPage />} />
        <Route path="/superadmin" element={<SuperAdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)