import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import ProfesorDashboard from './pages/ProfesorDashboard'
import AlumnoDashboard from './pages/AlumnoDashboard'
import Diagnostico from './pages/Diagnostico'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profesor-dashboard" element={<ProfesorDashboard />} />
        <Route path="/alumno-dashboard" element={<AlumnoDashboard />} />
        <Route path="/diagnostico" element={<Diagnostico />} />
      </Routes>
    </AuthProvider>
  )
}

export default App