import jwt from 'jsonwebtoken'

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({
            mensaje: 'Acceso denegado. Token no proporcionado.'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.usuarioId = decoded.id
        req.usuarioRol = decoded.rol
        req.usuarioAmbito = decoded.ambito
        next()
    } catch (error) {
        return res.status(403).json({
            mensaje: 'Token inválido o expirado.'
        })
    }
}

export default autenticarToken