// Verificar si es administrador
const esAdmin = (req, res, next) => {
    if (req.usuarioRol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso denegado. Se requieren permisos de administrador.'
        })
    }
    next()
}

// Verificar si es profesor
const esProfesor = (req, res, next) => {
    if (req.usuarioRol !== 'profesor' && req.usuarioRol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso denegado. Se requieren permisos de profesor.'
        })
    }
    next()
}

// Verificar si es alumno
const esAlumno = (req, res, next) => {
    if (req.usuarioRol !== 'alumno') {
        return res.status(403).json({
            mensaje: 'Acceso denegado. Solo alumnos pueden realizar esta acción.'
        })
    }
    next()
}

// Verificar ámbito del alumno
const verificarAmbitoAlumno = (req, res, next) => {
    if (req.usuarioRol === 'alumno' && !req.usuarioAmbito) {
        return res.status(400).json({
            mensaje: 'El alumno debe tener un ámbito asignado (preparatoria/universidad)'
        })
    }
    next()
}

export {
    esAdmin,
    esProfesor,
    esAlumno,
    verificarAmbitoAlumno
}