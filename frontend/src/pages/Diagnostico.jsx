import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { usuarioService } from '../services/usuarioService'
import { tallerService } from '../services/tallerService'

const Diagnostico = () => {
  const { user, token } = useAuth()
  const [log, setLog] = useState('')
  const [loading, setLoading] = useState(false)

  const addLog = (msg) => {
    setLog(prev => prev + msg + '\n')
  }

  const testarTudo = async () => {
    setLog('')
    addLog('🚀 INICIANDO DIAGNÓSTICO...\n')
    setLoading(true)

    // 1. Verificar token
    addLog('📌 1. Verificando token...')
    if (!token) {
      addLog('❌ Token não encontrado! Faça login primeiro.')
      setLoading(false)
      return
    }
    addLog('✅ Token presente: ' + token.substring(0, 20) + '...')

    // 2. Verificar usuário
    addLog('\n📌 2. Verificando usuário...')
    addLog('👤 Usuário: ' + JSON.stringify(user, null, 2))

    // 3. Testar API de professores
    addLog('\n📌 3. Testando API de professores...')
    try {
      const data = await usuarioService.listar({ rol: 'profesor', limit: 100 })
      
      addLog('📦 Status: 200 OK')
      addLog('✅ Resposta recebida:')
      addLog(JSON.stringify(data, null, 2))

      if (data.usuarios && data.usuarios.length > 0) {
        addLog(`\n✅ ${data.usuarios.length} professores encontrados:`)
        data.usuarios.forEach(p => {
          addLog(`   - ${p.nombre} (${p.email})`)
        })
      } else {
        addLog('⚠️ Nenhum professor encontrado!')
      }
    } catch (error) {
      addLog(`❌ Erro: ${error.message}`)
      if (error.response) {
        addLog(`📦 Status: ${error.response.status}`)
        addLog(`📦 Data: ${JSON.stringify(error.response.data)}`)
      }
    }

    // 4. Testar API de talleres
    addLog('\n📌 4. Testando API de talleres...')
    try {
      const data = await tallerService.listar({ limit: 5 })
      addLog(`✅ ${data.talleres?.length || 0} talleres encontrados`)
    } catch (error) {
      addLog(`❌ Erro: ${error.message}`)
    }

    addLog('\n✅ DIAGNÓSTICO COMPLETO!')
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px' }}>
      <h1>🔍 Diagnóstico do Sistema</h1>

      <div id="status"></div>

      <button 
        onClick={testarTudo} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: '#2ecc71',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Executando...' : 'Executar Diagnóstico'}
      </button>

      <pre style={{ 
        background: '#f4f4f4', 
        padding: '10px', 
        borderRadius: '5px',
        overflow: 'auto',
        maxHeight: '500px'
      }}>
        {log}
      </pre>
    </div>
  )
}

export default Diagnostico