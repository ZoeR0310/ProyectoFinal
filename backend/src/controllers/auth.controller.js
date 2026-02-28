import Usuario from '../models/usuario.model.js'
import jwt from 'jsonwebtoken'

// ============ LOGIN ============
const login = async (req, res) => {
    try {
        console.log('🔐 Intento de login recibido:', req.body)

        const { email, password } = req.body

        // Validar campos obligatorios
        if (!email || !password) {
            console.log('❌ Campos faltantes')
            return res.status(400).json({
                mensaje: 'Email y contraseña son obligatorios'
            })
        }

        // Buscar usuario en la base de datos
        console.log('🔍 Buscando usuario:', email)
        const usuario = await Usuario.findOne({ email, activo: true })

        if (!usuario) {
            console.log('❌ Usuario no encontrado')
            return res.status(401).json({
                mensaje: 'Credenciales inválidas'
            })
        }

        console.log('✅ Usuario encontrado:', usuario.email, usuario.rol)

        // Verificar contraseña
        if (usuario.password !== password) {
            console.log('❌ Contraseña incorrecta')
            return res.status(401).json({
                mensaje: 'Credenciales inválidas'
            })
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: usuario._id,
                rol: usuario.rol,
                ambito: usuario.ambito
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        )

        console.log('✅ Token generado para:', usuario.email)

        // Determinar dashboard según rol
        let dashboard = ''
        switch (usuario.rol) {
            case 'admin':
                dashboard = '/admin-dashboard'
                break
            case 'profesor':
                dashboard = '/profesor-dashboard'
                break
            case 'alumno':
                dashboard = '/alumno-dashboard'
                break
            default:
                dashboard = '/'
        }

        // Enviar respuesta
        res.json({
            mensaje: 'Login exitoso',
            token,
            dashboard,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                ambito: usuario.ambito,
                talleresInscritos: usuario.talleresInscritos || []
            }
        })

    } catch (error) {
        console.error('❌ Error en login:', error)
        res.status(500).json({
            mensaje: 'Error al iniciar sesión',
            error: error.message
        })
    }
}

// ============ REGISTRO (SOLO ADMIN) ============
const registro = async (req, res) => {
    try {
        console.log('📝 Intento de registro:', req.body)

        const { nombre, email, password, rol, ambito } = req.body

        // Validar campos obligatorios
        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            })
        }

        // Verificar si el usuario ya existe
        const existe = await Usuario.findOne({ email })
        if (existe) {
            return res.status(400).json({
                mensaje: 'El email ya está registrado'
            })
        }

        // Crear usuario
        const usuario = new Usuario({
            nombre,
            email,
            password,
            rol,
            ambito: rol === 'alumno' ? ambito : null
        })

        await usuario.save()

        console.log('✅ Usuario creado:', usuario.email)

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                ambito: usuario.ambito
            }
        })
    } catch (error) {
        console.error('❌ Error en registro:', error)
        res.status(500).json({
            mensaje: 'Error al registrar usuario',
            error: error.message
        })
    }
}

// ============ PERFIL ============
const perfil = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuarioId)
            .select('-password')
            .populate('talleresInscritos')

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        }

        res.json({ usuario })
    } catch (error) {
        console.error('❌ Error en perfil:', error)
        res.status(500).json({
            mensaje: 'Error al obtener perfil',
            error: error.message
        })
    }
}

// ============ EXPORTAR ============
export default {
    login,
    registro,
    perfil
}