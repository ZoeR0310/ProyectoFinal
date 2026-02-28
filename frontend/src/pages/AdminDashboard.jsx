import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { tallerService } from '../services/tallerService'
import { usuarioService } from '../services/usuarioService'
import Modal from '../components/common/Modal'
import Pagination from '../components/common/Pagination'
import StatCard from '../components/common/StatCard'
import TallerCard from '../components/common/TallerCard'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  
  // Estados
  const [vistaActual, setVistaActual] = useState('talleres')
  const [paginaActual, setPaginaActual] = useState(1)
  const [talleres, setTalleres] = useState([])
  const [profesores, setProfesores] = useState([])
  const [alumnos, setAlumnos] = useState([])
  const [paginacion, setPaginacion] = useState({})
  const [estadisticas, setEstadisticas] = useState({
    talleres: 0,
    profesores: 0,
    alumnos: 0,
    inscripciones: 0
  })
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    ambito: ''
  })
  const [modal, setModal] = useState({
    show: false,
    content: null,
    title: ''
  })
  const [loading, setLoading] = useState(false)

  // Formularios
  const [nuevoTaller, setNuevoTaller] = useState({
    titulo: '',
    descripcion: '',
    ambito: '',
    profesorId: '',
    fechaInicio: '',
    fechaFin: '',
    fechaLimiteInscripcion: '',
    cupoMaximo: 20
  })
  
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    ambito: ''
  })

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstadisticas()
    cargarVistaActual()
  }, [vistaActual, paginaActual, filtros])

  const cargarEstadisticas = async () => {
    try {
      const [talleresRes, profesoresRes, alumnosRes] = await Promise.all([
        tallerService.listar({ limit: 1 }),
        usuarioService.listar({ rol: 'profesor', limit: 1 }),
        usuarioService.listar({ rol: 'alumno', limit: 1 })
      ])

      let totalInscripciones = 0
      if (talleresRes.talleres) {
        totalInscripciones = talleresRes.talleres.reduce(
          (sum, t) => sum + (t.alumnosInscritos?.length || 0), 0
        )
      }

      setEstadisticas({
        talleres: talleresRes.paginacion?.total || 0,
        profesores: profesoresRes.paginacion?.total || 0,
        alumnos: alumnosRes.paginacion?.total || 0,
        inscripciones: totalInscripciones
      })
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const cargarVistaActual = async () => {
    setLoading(true)
    try {
      switch (vistaActual) {
        case 'talleres':
          await cargarTalleres()
          break
        case 'profesores':
          await cargarProfesores()
          break
        case 'alumnos':
          await cargarAlumnos()
          break
        case 'crear':
          await cargarProfesoresSelect()
          break
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarTalleres = async () => {
    const params = {
      page: paginaActual,
      limit: 6,
      search: filtros.search,
      estado: filtros.estado,
      ambito: filtros.ambito
    }
    
    const data = await tallerService.listar(params)
    setTalleres(data.talleres || [])
    setPaginacion(data.paginacion || {})
  }

  const cargarProfesores = async () => {
    const params = {
      rol: 'profesor',
      page: paginaActual,
      limit: 6,
      search: filtros.search
    }
    
    const data = await usuarioService.listar(params)
    setProfesores(data.usuarios || [])
    setPaginacion(data.paginacion || {})
  }

  const cargarAlumnos = async () => {
    const params = {
      rol: 'alumno',
      page: paginaActual,
      limit: 6,
      search: filtros.search,
      ambito: filtros.ambito
    }
    
    const data = await usuarioService.listar(params)
    setAlumnos(data.usuarios || [])
    setPaginacion(data.paginacion || {})
  }

  const cargarProfesoresSelect = async () => {
    const data = await usuarioService.listar({ rol: 'profesor', limit: 100 })
    setProfesores(data.usuarios || [])
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
              <div><strong>Profesor:</strong> {taller.profesorId?.nombre}</div>
              <div>
                <strong>Estado:</strong>{' '}
                <span className={`estado-badge ${taller.estado}`}>
                  {taller.estado.replace('_', ' ')}
                </span>
              </div>
              <div><strong>Inicio:</strong> {new Date(taller.fechaInicio).toLocaleDateString()}</div>
              <div><strong>Fin:</strong> {new Date(taller.fechaFin).toLocaleDateString()}</div>
              <div><strong>Límite:</strong> {new Date(taller.fechaLimiteInscripcion).toLocaleDateString()}</div>
              <div><strong>Cupos:</strong> {taller.alumnosInscritos?.length || 0}/{taller.cupoMaximo}</div>
            </div>
            
            <h3>Alumnos Inscritos ({taller.alumnosInscritos?.length || 0})</h3>
            <div className="alumnos-list">
              {taller.alumnosInscritos?.length > 0 ? (
                taller.alumnosInscritos.map((a, idx) => (
                  <div key={idx} className="alumno-item">
                    <span>{a.alumnoId?.nombre}</span>
                    <span>{a.alumnoId?.email}</span>
                    <span>{a.alumnoId?.ambito}</span>
                    <span>{new Date(a.fechaInscripcion).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p>No hay alumnos inscritos</p>
              )}
            </div>
          </div>
        )
      })
    } catch (error) {
      alert('Error al cargar detalles del taller')
    }
  }

  const handleEliminarTaller = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este taller?')) return
    
    try {
      await tallerService.eliminar(id)
      alert('✅ Taller eliminado')
      cargarTalleres()
      cargarEstadisticas()
    } catch (error) {
      alert(`❌ ${error.response?.data?.mensaje || 'Error al eliminar'}`)
    }
  }

 const handleCrearTaller = async (e) => {
  e.preventDefault()
  
  console.log('📝 Datos del formulario:', nuevoTaller)
  
  // Validaciones básicas
  if (!nuevoTaller.titulo || !nuevoTaller.titulo.trim()) {
    alert('❌ El título es obligatorio')
    return
  }
  
  if (!nuevoTaller.descripcion || !nuevoTaller.descripcion.trim()) {
    alert('❌ La descripción es obligatoria')
    return
  }
  
  if (!nuevoTaller.ambito) {
    alert('❌ Debe seleccionar un ámbito')
    return
  }
  
  if (!nuevoTaller.profesorId) {
    alert('❌ Debe seleccionar un profesor')
    return
  }
  
  if (!nuevoTaller.fechaInicio) {
    alert('❌ Debe seleccionar una fecha de inicio')
    return
  }
  
  if (!nuevoTaller.fechaFin) {
    alert('❌ Debe seleccionar una fecha de fin')
    return
  }
  
  if (!nuevoTaller.fechaLimiteInscripcion) {
    alert('❌ Debe seleccionar una fecha límite de inscripción')
    return
  }
  
  if (!nuevoTaller.cupoMaximo || nuevoTaller.cupoMaximo < 1) {
    alert('❌ El cupo máximo debe ser al menos 1')
    return
  }

  // Validar que la fecha límite sea anterior a la fecha de inicio
  const fechaInicio = new Date(nuevoTaller.fechaInicio)
  const fechaLimite = new Date(nuevoTaller.fechaLimiteInscripcion)
  
  if (fechaLimite >= fechaInicio) {
    alert('❌ La fecha límite de inscripción debe ser anterior a la fecha de inicio')
    return
  }

  // Validar que la fecha fin sea posterior a la fecha inicio
  const fechaFin = new Date(nuevoTaller.fechaFin)
  if (fechaFin <= fechaInicio) {
    alert('❌ La fecha de fin debe ser posterior a la fecha de inicio')
    return
  }

  setLoading(true)
  
  try {
    console.log('🚀 Enviando datos al servidor...')
    const response = await tallerService.crear(nuevoTaller)
    console.log('✅ Respuesta del servidor:', response)
    
    alert('✅ Taller creado exitosamente')
    
    // Resetear formulario
    setNuevoTaller({
      titulo: '',
      descripcion: '',
      ambito: '',
      profesorId: '',
      fechaInicio: '',
      fechaFin: '',
      fechaLimiteInscripcion: '',
      cupoMaximo: 20
    })
    
    // Volver a la vista de talleres
    setVistaActual('talleres')
    
    // Recargar datos
    await cargarEstadisticas()
    await cargarTalleres()
    
  } catch (error) {
    console.error('❌ Error detalhado:', error)
    
    let mensajeError = 'Error al crear taller'
    
    if (error.response) {
      console.error('📦 Status:', error.response.status)
      console.error('📦 Data:', error.response.data)
      
      if (error.response.data.mensaje) {
        mensajeError = error.response.data.mensaje
      } else if (error.response.data.errores) {
        mensajeError = error.response.data.errores.map(e => e.msg || e.message).join(', ')
      }
    } else if (error.message) {
      mensajeError = error.message
    }
    
    alert(`❌ ${mensajeError}`)
  } finally {
    setLoading(false)
  }
}

  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    
    if (!nuevoUsuario.rol) {
      alert('❌ Debe seleccionar un rol')
      return
    }

    if (nuevoUsuario.rol === 'alumno' && !nuevoUsuario.ambito) {
      alert('❌ Debe seleccionar un ámbito')
      return
    }

    try {
      await usuarioService.crear(nuevoUsuario)
      alert('✅ Usuario creado exitosamente')
      setVistaActual('profesores')
      setNuevoUsuario({
        nombre: '',
        email: '',
        password: '',
        rol: '',
        ambito: ''
      })
      cargarEstadisticas()
      cargarProfesores()
    } catch (error) {
      console.error('Error al crear usuario:', error)
      alert(`❌ ${error.response?.data?.mensaje || 'Error al crear usuario'}`)
    }
  }

  const handleToggleActivo = async (id, activo) => {
    const accion = activo ? 'desactivar' : 'activar'
    if (!confirm(`¿${accion} este usuario?`)) return

    try {
      await usuarioService.actualizar(id, { activo: !activo })
      if (vistaActual === 'profesores') cargarProfesores()
      if (vistaActual === 'alumnos') cargarAlumnos()
    } catch (error) {
      alert('Error al actualizar usuario')
    }
  }

  return (
    <div className="dashboard-container admin-theme">
      <header className="dashboard-header">
        <div className="user-info">
          <h1>Panel de Administración</h1>
          <p>Bienvenido, <span>{user?.nombre}</span></p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
      </header>

      <div className="stats-container">
        <StatCard 
          titulo="Talleres Activos" 
          valor={estadisticas.talleres}
          onClick={() => setVistaActual('talleres')}
        />
        <StatCard 
          titulo="Profesores" 
          valor={estadisticas.profesores}
          onClick={() => setVistaActual('profesores')}
        />
        <StatCard 
          titulo="Alumnos" 
          valor={estadisticas.alumnos}
          onClick={() => setVistaActual('alumnos')}
        />
        <StatCard 
          titulo="Inscripciones" 
          valor={estadisticas.inscripciones}
        />
      </div>

      <div className="view-selector">
        <button 
          className={`view-btn ${vistaActual === 'talleres' ? 'active' : ''}`}
          onClick={() => setVistaActual('talleres')}
        >
          Talleres
        </button>
        <button 
          className={`view-btn ${vistaActual === 'profesores' ? 'active' : ''}`}
          onClick={() => setVistaActual('profesores')}
        >
          Profesores
        </button>
        <button 
          className={`view-btn ${vistaActual === 'alumnos' ? 'active' : ''}`}
          onClick={() => setVistaActual('alumnos')}
        >
          Alumnos
        </button>
        <button 
          className={`view-btn ${vistaActual === 'crear' ? 'active' : ''}`}
          onClick={() => setVistaActual('crear')}
        >
          + Nuevo Taller
        </button>
        <button 
          className={`view-btn ${vistaActual === 'crear-usuario' ? 'active' : ''}`}
          onClick={() => setVistaActual('crear-usuario')}
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Vista Talleres */}
      {vistaActual === 'talleres' && (
        <div className="view active">
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
            <select
              value={filtros.ambito}
              onChange={(e) => setFiltros({ ...filtros, ambito: e.target.value })}
            >
              <option value="">Todos los ámbitos</option>
              <option value="preparatoria">Preparatoria</option>
              <option value="universidad">Universidad</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>
          
          {loading ? (
            <p className="loading">Cargando talleres...</p>
          ) : (
            <>
              <div className="grid-container">
                {talleres.length > 0 ? (
                  talleres.map(taller => (
                    <TallerCard
                      key={taller._id}
                      taller={taller}
                      onVer={handleVerTaller}
                      onEditar={(id) => {}}
                      onEliminar={handleEliminarTaller}
                      esAdmin={true}
                    />
                  ))
                ) : (
                  <p className="empty-message">No hay talleres disponibles</p>
                )}
              </div>
              <Pagination 
                paginacion={paginacion}
                onPageChange={(page) => setPaginaActual(page)}
              />
            </>
          )}
        </div>
      )}

      {/* Vista Profesores */}
      {vistaActual === 'profesores' && (
        <div className="view active">
          <div className="filters">
            <input
              type="text"
              placeholder="Buscar profesor..."
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            />
          </div>
          
          {loading ? (
            <p className="loading">Cargando profesores...</p>
          ) : (
            <>
              <div className="grid-container">
                {profesores.length > 0 ? (
                  profesores.map(profesor => (
                    <div key={profesor._id} className="card profesor-card">
                      <h3>{profesor.nombre}</h3>
                      <p>{profesor.email}</p>
                      <p>{profesor.activo ? '✓ Activo' : '✗ Inactivo'}</p>
                      <div className="card-actions">
                        <button 
                          onClick={() => alert(`Profesor: ${profesor.nombre}`)}
                          className="btn-view"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => {}}
                          className="btn-edit"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleToggleActivo(profesor._id, profesor.activo)}
                          className="btn-toggle"
                        >
                          {profesor.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No hay profesores</p>
                )}
              </div>
              <Pagination 
                paginacion={paginacion}
                onPageChange={(page) => setPaginaActual(page)}
              />
            </>
          )}
        </div>
      )}

      {/* Vista Alumnos */}
      {vistaActual === 'alumnos' && (
        <div className="view active">
          <div className="filters">
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            />
            <select
              value={filtros.ambito}
              onChange={(e) => setFiltros({ ...filtros, ambito: e.target.value })}
            >
              <option value="">Todos los ámbitos</option>
              <option value="preparatoria">Preparatoria</option>
              <option value="universidad">Universidad</option>
            </select>
          </div>
          
          {loading ? (
            <p className="loading">Cargando alumnos...</p>
          ) : (
            <>
              <div className="grid-container">
                {alumnos.length > 0 ? (
                  alumnos.map(alumno => (
                    <div key={alumno._id} className="card alumno-card">
                      <h3>{alumno.nombre}</h3>
                      <p>{alumno.email}</p>
                      <p>Ámbito: {alumno.ambito || 'N/A'}</p>
                      <p>Talleres: {alumno.talleresInscritos?.length || 0}/2</p>
                      <div className="card-actions">
                        <button 
                          onClick={() => alert(`Alumno: ${alumno.nombre}`)}
                          className="btn-view"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => {}}
                          className="btn-edit"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">No hay alumnos</p>
                )}
              </div>
              <Pagination 
                paginacion={paginacion}
                onPageChange={(page) => setPaginaActual(page)}
              />
            </>
          )}
        </div>
      )}

      {/* Vista Crear Taller */}
      {vistaActual === 'crear' && (
        <div className="view active">
          <h2>Crear Nuevo Taller</h2>
          <form onSubmit={handleCrearTaller} className="form-crear">
            <div className="form-group">
              <label>Título del Taller</label>
              <input
                type="text"
                value={nuevoTaller.titulo}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, titulo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                rows="4"
                value={nuevoTaller.descripcion}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, descripcion: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Ámbito</label>
              <select
                value={nuevoTaller.ambito}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, ambito: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="preparatoria">Preparatoria</option>
                <option value="universidad">Universidad</option>
                <option value="ambos">Ambos</option>
              </select>
            </div>
            <div className="form-group">
              <label>Profesor</label>
              <select
                value={nuevoTaller.profesorId}
                onChange={(e) => setNuevoTaller({ ...nuevoTaller, profesorId: e.target.value })}
                required
              >
                <option value="">Seleccionar profesor...</option>
                {profesores.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.nombre} ({p.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  value={nuevoTaller.fechaInicio}
                  onChange={(e) => setNuevoTaller({ ...nuevoTaller, fechaInicio: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  value={nuevoTaller.fechaFin}
                  onChange={(e) => setNuevoTaller({ ...nuevoTaller, fechaFin: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha Límite Inscripción</label>
                <input
                  type="date"
                  value={nuevoTaller.fechaLimiteInscripcion}
                  onChange={(e) => setNuevoTaller({ ...nuevoTaller, fechaLimiteInscripcion: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cupo Máximo</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={nuevoTaller.cupoMaximo}
                  onChange={(e) => setNuevoTaller({ ...nuevoTaller, cupoMaximo: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-create">Crear Taller</button>
          </form>
        </div>
      )}

      {/* Vista Crear Usuario */}
      {vistaActual === 'crear-usuario' && (
        <div className="view active">
          <h2>Crear Nuevo Usuario</h2>
          <form onSubmit={handleCrearUsuario} className="form-crear">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={nuevoUsuario.email}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                minLength="6"
                value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select
                value={nuevoUsuario.rol}
                onChange={(e) => {
                  setNuevoUsuario({ 
                    ...nuevoUsuario, 
                    rol: e.target.value,
                    ambito: e.target.value === 'alumno' ? nuevoUsuario.ambito : ''
                  })
                }}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="admin">Administrador</option>
                <option value="profesor">Profesor</option>
                <option value="alumno">Alumno</option>
              </select>
            </div>
            
            {nuevoUsuario.rol === 'alumno' && (
              <div className="form-group">
                <label>Ámbito (solo para alumnos)</label>
                <select
                  value={nuevoUsuario.ambito}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, ambito: e.target.value })}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="preparatoria">Preparatoria</option>
                  <option value="universidad">Universidad</option>
                </select>
              </div>
            )}
            
            <button type="submit" className="btn-create">Crear Usuario</button>
          </form>
        </div>
      )}

      {/* Modal */}
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

export default AdminDashboard