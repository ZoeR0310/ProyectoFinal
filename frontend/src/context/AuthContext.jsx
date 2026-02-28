import { createContext, useState, useEffect, useContext } from 'react'
import { login as apiLogin } from '../services/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    console.log('🔄 Carregando dados do localStorage:', { storedToken, storedUser })

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        console.log('✅ Usuário carregado:', parsedUser)
      } catch (error) {
        console.error('Erro ao parsear usuário:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log('🔐 Tentando login com:', email)
      const data = await apiLogin(email, password)
      console.log('✅ Login response:', data)
      
      // Salvar no localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.usuario))
      
      setToken(data.token)
      setUser(data.usuario)
      
      return { success: true, dashboard: data.dashboard }
    } catch (error) {
      console.error('❌ Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    console.log('🔓 Fazendo logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    // Redirecionar para login
    window.location.href = '/'
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}