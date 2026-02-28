import { useState, useEffect } from 'react'
import { tallerService } from '../services/tallerService'
import { useAuth } from './useAuth'

export const useTalleres = (initialFilters = {}) => {
  const { token } = useAuth()
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paginacion, setPaginacion] = useState({})
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    ...initialFilters
  })

  const cargarTalleres = async () => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await tallerService.listar(filters)
      setTalleres(data.talleres || [])
      setPaginacion(data.paginacion || {})
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar talleres')
      console.error('Error cargando talleres:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarTalleres()
  }, [filters.page, filters.limit, filters.search, filters.estado, filters.ambito])

  const inscribir = async (tallerId) => {
    try {
      const data = await tallerService.inscribir(tallerId)
      await cargarTalleres() // Recargar después de inscribir
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.mensaje || 'Error al inscribirse' 
      }
    }
  }

  const cancelarInscripcion = async (tallerId) => {
    try {
      const data = await tallerService.cancelarInscripcion(tallerId)
      await cargarTalleres()
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.mensaje || 'Error al cancelar inscripción' 
      }
    }
  }

  const cambiarPagina = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const aplicarFiltros = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
  }

  return {
    talleres,
    loading,
    error,
    paginacion,
    filters,
    cargarTalleres,
    inscribir,
    cancelarInscripcion,
    cambiarPagina,
    aplicarFiltros
  }
}

export default useTalleres