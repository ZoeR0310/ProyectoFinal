import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { tallerService } from '../services/tallerService'
import Modal from '../components/common/Modal'
import ClimaWidget from '../components/widgets/ClimaWidget'
import FraseWidget from '../components/widgets/FraseWidget'
import DatoCuriosoWidget from '../components/widgets/DatoCuriosoWidget'

const AlumnoDashboard = () => {
  const { user, logout, updateUser } = useAuth()
  
  const [talleres, setTalleres] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    search: '',
    ambito: ''
  })
  const [tallerSeleccionado, setTallerSeleccionado] = useState(null)
  const [modal, setModal] = useState({
    show: false,
    type: '',
    content: null,
    title: ''
  })

  useEffect(() => {
    cargarTalleres()
  }, [filtros])

  const cargarTalleres = async () => {
    setLoading(true)
    try {
      const params = {
        limit: 50,
        search: filtros.search,
        ambito: filtros.ambito
      }
      
      const data = await tallerService.listar(params)
      
      // Ordenar: pendientes primero
      const talleresOrdenados = (data.talleres || []).sort((a, b) => {
        const orden = { 'pendiente': 1, 'en_curso': 2, 'finalizado': 3 }
        return (orden[a.estado] || 4) - (orden[b.estado] || 4)
      })
      
      setTalleres(talleresOrdenados)
    } catch (error) {
      console.error('Error cargando talleres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInscribir = (id, titulo) => {
    setTallerSeleccionado(id)
    setModal({
      show: true,
      type: 'inscripcion',
      title: 'Confirmar Inscripción',
      content: (
        <div>
          <p>¿Inscribirse al taller "{titulo}"?</p>
        </div>
      )
    })
  }

  const confirmarInscripcion = async () => {
    if (!tallerSeleccionado) return

    try {
      const data = await tallerService.inscribir(tallerSeleccionado)
      
      // Atualizar o usuário no contexto
      const updatedUser = { 
        ...user, 
        talleresInscritos: [...(user.talleresInscritos || []), tallerSeleccionado] 
      }
      updateUser(updatedUser)
      
      alert('✅ ¡Inscripción exitosa!')
      setModal({ show: false, type: '', content: null, title: '' })
      cargarTalleres()
    } catch (error) {
      alert(`❌ ${error.response?.data?.mensaje || 'Error al inscribirse'}`)
    }
  }

  const handleVerMisTalleres = async () => {
    const misTalleres = user?.talleresInscritos || []

    if (misTalleres.length === 0) {
      alert('No estás inscrito en ningún taller')
      return
    }

    try {
      const data = await tallerService.listar({ limit: 100 })
      const talleresInscritos = data.talleres.filter(t => 
        misTalleres.includes(t._id)
      )

      setModal({
        show: true,
        type: 'mis-talleres',
        title: 'Mis Talleres',
        content: (
          <div>
            <div id="misTalleresLista">
              {talleresInscritos.map(t => (
                <div key={t._id} className="card">
                  <h4>{t.titulo}</h4>
                  <p>{t.descripcion}</p>
                  <p>Estado: {t.estado}</p>
                  <p>Profesor: {t.profesorId?.nombre}</p>
                </div>
              ))}
            </div>
            
            <div className="panel-info" style={{ marginTop: '20px' }}>
              <ClimaWidget />
              <FraseWidget />
              <DatoCuriosoWidget />
            </div>
          </div>
        )
      })
    } catch (error) {
      alert('Error al cargar talleres')
    }
  }

  const misTalleresCount = user?.talleresInscritos?.length || 0

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>Talleres Disponibles</h1>
          <p>Bienvenido, <span>{user?.nombre}</span></p>
          <p>Ámbito: <span>{user?.ambito === 'preparatoria' ? 'Preparatoria' : 'Universidad'}</span></p>
        </div>
        <div className="mis-talleres-info">
          <p>Mis talleres: <span>{misTalleresCount}/2</span></p>
          <button onClick={handleVerMisTalleres} className="btn-view">Ver mis talleres</button>
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <div className="filters">
        <input
          type="text"
          id="searchInput"
          placeholder="Buscar taller..."
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
        />
        <select
          id="filtroAmbito"
          value={filtros.ambito}
          onChange={(e) => setFiltros({ ...filtros, ambito: e.target.value })}
        >
          <option value="">Todos los ámbitos</option>
          <option value="preparatoria">Preparatoria</option>
          <option value="universidad">Universidad</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Cargando talleres...</p>
      ) : (
        <div id="talleresList" className="talleres-grid">
          {talleres.length > 0 ? (
            talleres.map(taller => {
              const yaInscrito = user?.talleresInscritos?.includes(taller._id)
              const puedeInscribirse = !yaInscrito &&
                misTalleresCount < 2 &&
                taller.inscripcionAbierta === true

              const diasRestantes = taller.fechaLimiteInscripcion ?
                Math.ceil((new Date(taller.fechaLimiteInscripcion) - new Date()) / (1000 * 60 * 60 * 24)) : 0

              let statusMessage = ''
              if (yaInscrito) {
                statusMessage = '<span className="inscrito-badge">✓ Ya inscrito</span>'
              } else if (misTalleresCount >= 2) {
                statusMessage = '<span className="error">Límite de 2 talleres alcanzado</span>'
              } else if (taller.estado !== 'pendiente') {
                statusMessage = '<span className="no-disponible">Taller no disponible</span>'
              } else if (diasRestantes < 0) {
                statusMessage = '<span className="no-disponible">Inscripción cerrada</span>'
              } else if (taller.cuposDisponibles <= 0) {
                statusMessage = '<span className="error">Cupo lleno</span>'
              } else if (taller.inscripcionAbierta) {
                statusMessage = (
                  <button 
                    onClick={() => handleInscribir(taller._id, taller.titulo)} 
                    className="btn-create"
                  >
                    📝 Inscribirme ({taller.cuposDisponibles} cupos)
                  </button>
                )
              } else {
                statusMessage = '<span className="no-disponible">No disponible</span>'
              }

              return (
                <div key={taller._id} className={`card taller-card ${taller.estado} ${yaInscrito ? 'inscrito' : ''}`}>
                  <div className="card-header">
                    <h3>{taller.titulo}</h3>
                    <span className={`estado-badge ${taller.estado}`}>
                      {taller.estado === 'pendiente' ? '📅 Pendiente' :
                       taller.estado === 'en_curso' ? '▶️ En curso' : '✅ Finalizado'}
                    </span>
                  </div>
                  <p className="descripcion">{taller.descripcion}</p>
                  <div className="info-taller">
                    <p><strong>Ámbito:</strong> {
                      taller.ambito === 'preparatoria' ? 'Preparatoria' :
                      taller.ambito === 'universidad' ? 'Universidad' : 'Ambos'
                    }</p>
                    <p><strong>Profesor:</strong> {taller.profesorId?.nombre || 'N/A'}</p>
                    <p><strong>Inicio:</strong> {new Date(taller.fechaInicio).toLocaleDateString()}</p>
                    <p><strong>Fin:</strong> {new Date(taller.fechaFin).toLocaleDateString()}</p>
                    <p><strong>Cupos:</strong> {taller.alumnosInscritos?.length || 0}/{taller.cupoMaximo}</p>
                    {taller.estado === 'pendiente' && (
                      <p><strong>Inscripción hasta:</strong> {new Date(taller.fechaLimiteInscripcion).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="card-actions">
                    {statusMessage}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="empty-message">No hay talleres disponibles</p>
          )}
        </div>
      )}

      <Modal 
        show={modal.show}
        onClose={() => setModal({ show: false, type: '', content: null, title: '' })}
        title={modal.title}
      >
        {modal.content}
        {modal.type === 'inscripcion' && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={confirmarInscripcion} className="btn-create">Confirmar</button>
            <button onClick={() => setModal({ show: false, type: '', content: null, title: '' })} className="btn-cancel">Cancelar</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AlumnoDashboard