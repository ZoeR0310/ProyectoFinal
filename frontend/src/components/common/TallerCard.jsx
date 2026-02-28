const TallerCard = ({ taller, onVer, onEditar, onEliminar, esAdmin = false }) => {
  return (
    <div className={`card taller-card ${taller.estado}`}>
      <div className="card-header">
        <h3>{taller.titulo}</h3>
        <span className={`estado-badge ${taller.estado}`}>
          {taller.estado.replace('_', ' ')}
        </span>
      </div>
      <p className="ambito">Ámbito: {taller.ambito}</p>
      <p className="profesor">Profesor: {taller.profesorId?.nombre || 'N/A'}</p>
      <p className="fechas">
        Inicio: {new Date(taller.fechaInicio).toLocaleDateString()}<br />
        Fin: {new Date(taller.fechaFin).toLocaleDateString()}
      </p>
      <p className="cupo">Cupos: {taller.alumnosInscritos?.length || 0}/{taller.cupoMaximo}</p>
      <div className="card-actions">
        <button onClick={() => onVer(taller._id)} className="btn-view">
          Ver detalles
        </button>
        {esAdmin && (
          <>
            <button onClick={() => onEditar(taller._id)} className="btn-edit">
              Editar
            </button>
            <button onClick={() => onEliminar(taller._id)} className="btn-delete">
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default TallerCard