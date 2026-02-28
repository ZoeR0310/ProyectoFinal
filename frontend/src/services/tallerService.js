import api from './api'

export const tallerService = {
  // Talleres
  listar: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await api.get(`/talleres?${queryParams}`)
      return response.data
    } catch (error) {
      console.error('Erro ao listar talleres:', error.response || error)
      throw error
    }
  },

  obtener: async (id) => {
    try {
      const response = await api.get(`/talleres/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter taller:', error.response || error)
      throw error
    }
  },

  crear: async (data) => {
    try {
      console.log('📤 Enviando datos para crear taller:', data)
      
      // Validar datos antes de enviar
      if (!data.titulo || !data.descripcion || !data.ambito || !data.profesorId || 
          !data.fechaInicio || !data.fechaFin || !data.fechaLimiteInscripcion || !data.cupoMaximo) {
        throw new Error('Todos los campos son obligatorios')
      }
      
      const response = await api.post('/talleres', data)
      console.log('✅ Taller creado:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Erro ao criar taller:', error.response || error)
      if (error.response) {
        console.error('📦 Status:', error.response.status)
        console.error('📦 Data:', error.response.data)
      }
      throw error
    }
  },

  actualizar: async (id, data) => {
    try {
      const response = await api.put(`/talleres/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar taller:', error.response || error)
      throw error
    }
  },

  eliminar: async (id) => {
    try {
      const response = await api.delete(`/talleres/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao eliminar taller:', error.response || error)
      throw error
    }
  },

  // Inscripciones
  inscribir: async (tallerId) => {
    try {
      const response = await api.post('/talleres/inscribir', { tallerId })
      return response.data
    } catch (error) {
      console.error('Erro ao inscribir:', error.response || error)
      throw error
    }
  },

  cancelarInscripcion: async (tallerId) => {
    try {
      const response = await api.delete(`/talleres/${tallerId}/cancelar`)
      return response.data
    } catch (error) {
      console.error('Erro ao cancelar inscripción:', error.response || error)
      throw error
    }
  },

  obtenerAlumnos: async (tallerId) => {
    try {
      const response = await api.get(`/talleres/${tallerId}/alumnos`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter alumnos:', error.response || error)
      throw error
    }
  },

  verificarAlertas: async () => {
    try {
      const response = await api.get('/talleres/alertas')
      return response.data
    } catch (error) {
      console.error('Erro ao verificar alertas:', error.response || error)
      throw error
    }
  }
}

export default tallerService