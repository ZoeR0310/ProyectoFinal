// Formatear fecha a string YYYY-MM-DD
export const formatDateToInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// Formatear fecha para mostrar
export const formatDateToDisplay = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// Calcular días restantes hasta una fecha
export const getDiasRestantes = (fechaLimite) => {
  if (!fechaLimite) return 0
  const ahora = new Date()
  const limite = new Date(fechaLimite)
  const diff = limite - ahora
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Verificar si la inscripción está abierta
export const inscripcionAbierta = (taller) => {
  if (!taller) return false
  
  const ahora = new Date()
  const fechaLimite = new Date(taller.fechaLimiteInscripcion)
  const alumnosInscritos = taller.alumnosInscritos?.length || 0
  
  return taller.estado === 'pendiente' &&
    ahora <= fechaLimite &&
    alumnosInscritos < taller.cupoMaximo
}

// Obtener color según estado
export const getColorByEstado = (estado) => {
  const colores = {
    pendiente: '#f39c12',
    en_curso: '#2ecc71',
    finalizado: '#2c3e50',
    cancelado: '#e74c3c'
  }
  return colores[estado] || '#95a5a6'
}

// Capitalizar primera letra
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Traducir ámbito
export const translateAmbito = (ambito) => {
  const traducciones = {
    preparatoria: 'Preparatoria',
    universidad: 'Universidad',
    ambos: 'Ambos'
  }
  return traducciones[ambito] || ambito
}

// Traducir estado
export const translateEstado = (estado) => {
  const traducciones = {
    pendiente: 'Pendiente',
    en_curso: 'En Curso',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado'
  }
  return traducciones[estado] || estado
}

// Validar email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Generar mensaje de error amigable
export const getErrorMessage = (error) => {
  if (error.response?.data?.mensaje) {
    return error.response.data.mensaje
  }
  if (error.response?.data?.errores) {
    return error.response.data.errores.map(e => e.msg || e.message).join(', ')
  }
  if (error.message) {
    return error.message
  }
  return 'Error desconocido'
}