import { useState, useEffect } from 'react'
import { usuarioService } from '../services/usuarioService'
import { useAuth } from './useAuth'

export const useUsuarios = (rol = null, initialFilters = {}) => {
  const { token } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paginacion, setPaginacion] = useState({})
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    rol,
    ...initialFilters
  })

  const cargarUsuarios = async () => {
    if (!token) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await usuarioService.listar(filters)
      setUsuarios(data.usuarios || [])
      setPaginacion(data.paginacion || {})
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar usuarios')
      console.error('Error cargando usuarios:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [filters.page, filters.limit, filters.search, filters.rol, filters.ambito])

  const crearUsuario = async (usuarioData) => {
    try {
      const data = await usuarioService.crear(usuarioData)
      await cargarUsuarios()
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.mensaje || 'Error al crear usuario' 
      }
    }
  }

  const actualizarUsuario = async (id, usuarioData) => {
    try {
      const data = await usuarioService.actualizar(id, usuarioData)
      await cargarUsuarios()
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.mensaje || 'Error al actualizar usuario' 
      }
    }
  }

  const eliminarUsuario = async (id) => {
    try {
      const data = await usuarioService.eliminar(id)
      await cargarUsuarios()
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.mensaje || 'Error al eliminar usuario' 
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
    usuarios,
    loading,
    error,
    paginacion,
    filters,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    cambiarPagina,
    aplicarFiltros
  }
}

export default useUsuarios