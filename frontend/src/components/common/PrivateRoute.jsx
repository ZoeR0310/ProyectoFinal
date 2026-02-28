import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const PrivateRoute = ({ children, rol }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />
  }

  if (rol && user?.rol !== rol) {
    return <Navigate to="/" />
  }

  return children
}

export default PrivateRoute