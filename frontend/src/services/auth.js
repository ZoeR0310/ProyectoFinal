import axios from 'axios'

export const login = async (email, password) => {
  try {
    // Use URL direta em vez de api
    const response = await axios.post('http://localhost:3000/api/auth/login', { 
      email, 
      password 
    })
    return response.data
  } catch (error) {
    console.error('Erro detalhado:', error.response || error)
    throw new Error(error.response?.data?.mensaje || 'Error al iniciar sesión')
  }
}