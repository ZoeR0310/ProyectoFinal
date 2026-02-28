// src/services/auth.js
import api from './api'

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { 
      email, 
      password 
    })
    return response.data
  } catch (error) {
    console.error('❌ Error detallado en login:', error.response || error)
    throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión')
  }
}