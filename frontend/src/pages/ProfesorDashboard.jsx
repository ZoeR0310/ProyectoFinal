import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { tallerService } from '../services/tallerService'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import ClimaWidget from '../components/widgets/ClimaWidget'
import FraseWidget from '../components/widgets/FraseWidget'
import DatoCuriosoWidget from '../components/widgets/DatoCuriosoWidget'

const ProfesorDashboard = () => {
  const { user, logout } = useAuth()
  
  const [talleres, setTalleres] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [paginacion, setPaginacion] = useState({})
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    search: '',
    estado: ''
  })
  const [estadisticas, setEstadisticas] = useState({
    activos: 0,
    totalAlumnos: 0,
    proximos: 0,
    finalizados: 0
  })
  const [modal, setModal] = useState({
    show: false,
    content: null,
    title: ''
  })

  useEffect(() => {
    cargarTalleres()
  }, [paginaActual, filtros])

  const cargarTalleres = async () => {
    setLoading(true)
    try {
      const params = {
        page: paginaActual,
        limit: 6,
        search: filtros.search,
        estado: filtros.estado
      }
      
      const data = await tallerService.listar(params)
      setTalleres(data.talleres || [])
      setPaginacion(data.paginacion || {})
      calcularEstadisticas(data.talleres || [])
    } catch (error) {
      console.error('Error cargando talleres:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstadisticas = (talleresList) => {
    setEstadisticas({
      activos: talleresList.filter(t => t.estado === 'en_curso').length,
      totalAlumnos: talleresList.reduce((sum, t) => sum + (t.alumnosInscritos?.length || 0), 0),
      proximos: talleresList.filter(t => t.estado === 'pendiente').length,
      finalizados: talleresList.filter(t => t.estado === 'finalizado').length
    })
  }

  const handleVerTaller = async (id) => {
    try {
      const data = await tallerService.obtener(id)
      const taller = data.taller
      
      setModal({
        show: true,
        title: taller.titulo,
        content: (
          <div>
            <p className="descripcion">{taller.descripcion}</p>
            <div className="info-grid">
              <div><strong>Ámbito:</strong> {taller.ambito}</div>
              <div>
                <strong>Estado:</strong>{' '}
                <span className={`estado-badge ${taller.estado}`}>
                  {taller.estado.replace('_', ' ')}
                </span>
              </div>
              <div><strong>Fecha inicio:</strong> {new Date(taller.fechaInicio).toLocaleDateString()}</div>
              <div><strong>Fecha fin:</strong> {new Date(taller.fechaFin).toLocaleDateString()}</div>
            </div>
          </div>
        )
      })
    } catch (error) {
      alert('Error al cargar detalles')
    }
  }

  const handleVerAlumnos = async (tallerId) => {
    try {
      const data = await tallerService.obtenerAlumnos(tallerId)
      
      setModal({
        show: true,
        title: 'Alumnos Inscritos',
        content: (
          <div>
            {data.alumnos?.length > 0 ? (
              data.alumnos.map((a, idx) => (
                <div key={idx} className="alumno-item" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <span><strong>{a.nombre}</strong></span>
                  <span>{a.email}</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No hay alumnos inscritos</p>
            )}
          </div>
        )
      })
    } catch (error) {
      alert('Error al cargar alumnos')
    }
  }

  const handleMarcarFinalizado = async (tallerId) => {
    if (!confirm('¿Finalizar este taller?')) return
    
    try {
      await tallerService.actualizar(tallerId, { estado: 'finalizado' })
      alert('✅ Taller finalizado')
      cargarTalleres()
    } catch (error) {
      alert('Error al actualizar taller')
    }
  }

  return (
    <div className="dashboard-container profesor-theme">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>Mis Talleres Asignados</h1>
          <p>Bienvenido, <span>{user?.nombre}</span></p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
      </header>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Talleres Activos</h3>
          <p>{estadisticas.activos}</p>
        </div>
        <div className="stat-card">
          <h3>Total Alumnos</h3>
          <p>{estadisticas.totalAlumnos}</p>
        </div>
        <div className="stat-card">
          <h3>Próximos a iniciar</h3>
          <p>{estadisticas.proximos}</p>
        </div>
        <div className="stat-card">
          <h3>Finalizados</h3>
          <p>{estadisticas.finalizados}</p>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar taller..."
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
        />
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_curso">En curso</option>
          <option value="finalizado">Finalizado</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Cargando talleres...</p>
      ) : (
        <>
          <div className="grid-container">
            {talleres.length > 0 ? (
              talleres.map(taller => (
                <div key={taller._id} className={`card taller-card ${taller.estado}`}>
                  <div className="card-header">
                    <h3>{taller.titulo}</h3>
                    <span className={`estado-badge ${taller.estado}`}>
                      {taller.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="descripcion">{taller.descripcion.substring(0, 100)}...</p>
                  <div className="info-taller">
                    <p><strong>Ámbito:</strong> {taller.ambito}</p>
                    <p><strong>Inicio:</strong> {new Date(taller.fechaInicio).toLocaleDateString()}</p>
                    <p><strong>Fin:</strong> {new Date(taller.fechaFin).toLocaleDateString()}</p>
                    <p><strong>Alumnos:</strong> {taller.alumnosInscritos?.length || 0}/{taller.cupoMaximo}</p>
                  </div>
                  <div className="card-actions">
                    <button 
                      onClick={() => handleVerTaller(taller._id)} 
                      className="btn-view"
                    >
                      Ver detalles
                    </button>
                    <button 
                      onClick={() => handleVerAlumnos(taller._id)} 
                      className="btn-view"
                    >
                      Ver alumnos
                    </button>
                    {taller.estado === 'en_curso' && (
                      <button 
                        onClick={() => handleMarcarFinalizado(taller._id)} 
                        className="btn-success"
                      >
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No tienes talleres asignados</p>
            )}
          </div>
          <Pagination 
            paginacion={paginacion}
            onPageChange={setPaginaActual}
          />
        </>
      )}

      <div 
        className="dashboard-header"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginTop: '30px', 
          alignItems: 'start' 
        }}
      >
        <ClimaWidget />
        <FraseWidget />
        <DatoCuriosoWidget />
      </div>

      <Modal 
        show={modal.show}
        onClose={() => setModal({ show: false, content: null, title: '' })}
        title={modal.title}
      >
        {modal.content}
      </Modal>
    </div>
  )
}

export default ProfesorDashboard