import api from './api'

export const usuarioService = {
  listar: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString()
    const response = await api.get(`/usuarios?${queryParams}`)
    return response.data
  },

  obtener: async (id) => {
    const response = await api.get(`/usuarios/${id}`)
    return response.data
  },

  crear: async (data) => {
    const response = await api.post('/usuarios', data)
    return response.data
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data)
    return response.data
  },

  eliminar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`)
    return response.data
  }
}