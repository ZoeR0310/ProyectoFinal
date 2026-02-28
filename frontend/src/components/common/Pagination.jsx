const Pagination = ({ paginacion, onPageChange }) => {
  if (!paginacion || paginacion.totalPaginas <= 1) {
    return null
  }

  const { pagina, totalPaginas } = paginacion

  const renderPageButtons = () => {
    const buttons = []
    
    for (let i = 1; i <= totalPaginas; i++) {
      if (
        i === 1 || 
        i === totalPaginas || 
        (i >= pagina - 2 && i <= pagina + 2)
      ) {
        buttons.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={i === pagina ? 'active' : ''}
          >
            {i}
          </button>
        )
      } else if (i === pagina - 3 || i === pagina + 3) {
        buttons.push(<span key={i}>...</span>)
      }
    }
    
    return buttons
  }

  return (
    <div className="pagination">
      <div className="pagination-controls">
        {pagina > 1 && (
          <button onClick={() => onPageChange(pagina - 1)}>
            « Anterior
          </button>
        )}
        
        {renderPageButtons()}
        
        {pagina < totalPaginas && (
          <button onClick={() => onPageChange(pagina + 1)}>
            Siguiente »
          </button>
        )}
      </div>
    </div>
  )
}

export default Pagination