import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [debug, setDebug] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setDebug('🔄 Conectando al servidor...\n')

    try {
      const result = await login(email, password)
      
      setDebug(prev => prev + `✅ Login exitoso\n`)
      
      if (result.success) {
        setDebug(prev => prev + `✅ Redirigiendo a ${result.dashboard}...\n`)
        navigate(result.dashboard)
      } else {
        setMessage(`❌ ${result.error}`)
        setDebug(prev => prev + `❌ Error: ${result.error}\n`)
      }
    } catch (error) {
      setMessage('❌ Error de conexión')
      setDebug(prev => prev + `❌ Error: ${error.message}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="forms-container">
        <div className="form login-form active">
          <h2>Iniciar Sesión</h2>
          <p className="subtitle">Sistema de Gestión de Talleres</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                type="email"
                id="loginEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label htmlFor="loginPassword">Contraseña</label>
              <input
                type="password"
                id="loginPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {message && <div className="message" dangerouslySetInnerHTML={{ __html: message }} />}
          
          <div 
            style={{
              marginTop: '20px',
              padding: '10px',
              background: '#f0f0f0',
              borderRadius: '5px',
              fontSize: '12px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {debug}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login