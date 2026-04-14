import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import GuestPage from './GuestPage.jsx'
import CrewPage from './CrewPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/guest" />} />
        <Route path="/guest" element={<GuestPage />} />
        <Route path="/crew" element={<CrewPage />} />
      </Routes>
    </BrowserRouter>
  )
}