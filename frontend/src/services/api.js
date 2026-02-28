import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

console.log('🔧 API URL configurada:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
})

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`📨 Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data)
    return config
  },
  (error) => {
    console.error('❌ Erro no request:', error)
    return Promise.reject(error)
  }
)

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status}`, response.data)
    return response
  },
  (error) => {
    console.error('❌ Erro na response:', error.response || error)
    
    if (error.response?.status === 401) {
      console.log('🔓 Token expirado, fazendo logout')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    
    return Promise.reject(error)
  }
)

export default api