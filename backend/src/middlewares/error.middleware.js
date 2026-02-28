const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err)

    // Error de Mongoose
    if (err.name === 'ValidationError') {
        const errores = Object.values(err.errors).map(e => e.message)
        return res.status(400).json({
            mensaje: 'Error de validación',
            errores
        })
    }

    if (err.code === 11000) {
        return res.status(400).json({
            mensaje: 'Error de duplicado',
            error: 'El valor ya existe en la base de datos'
        })
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            mensaje: 'ID no válido',
            error: 'El formato del ID es incorrecto'
        })
    }

    // Error personalizado
    if (err.status) {
        return res.status(err.status).json({
            mensaje: err.message
        })
    }

    // Error por defecto
    res.status(500).json({
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    })
}

export default errorHandler