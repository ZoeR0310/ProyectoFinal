import Taller from '../models/taller.model.js'
import Usuario from '../models/usuario.model.js'

//=============APIS EXTERNAS =====================
import { getClima } from "../services/clima.service.js"
import { getFrase } from "../services/frases.service.js"
import { getDatoCurioso } from "../services/curiosidades.service.js"

const dashboard = async (req, res) => {
    const clima = await getClima()
    const frase = await getFrase()
    const dato = await getDatoCurioso()

    res.render("dashboard", {
        clima,
        frase,
        dato
    })
}

// ============ FUNCIONES PARA USUARIOS ============
// Crear usuario (solo admin)
const crearUsuario = async (req, res) => {
    try {
        console.log('📝 Creando usuario:', req.body)

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

        // Validar ámbito para alumnos
        if (rol === 'alumno' && !ambito) {
            return res.status(400).json({
                mensaje: 'El ámbito es obligatorio para alumnos'
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
            mensaje: 'Usuario creado exitosamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                ambito: usuario.ambito,
                activo: usuario.activo
            }
        })
    } catch (error) {
        console.error('❌ Error al crear usuario:', error)
        res.status(500).json({
            mensaje: 'Error al crear usuario',
            error: error.message
        })
    }
}

// Listar usuarios con filtros y paginación
const listarUsuarios = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            rol,
            ambito,
            activo,
            search
        } = req.query

        const skip = (page - 1) * limit
        let query = {}

        // Filtros
        if (rol) query.rol = rol
        if (ambito) query.ambito = ambito
        if (activo !== undefined) query.activo = activo === 'true'

        if (search) {
            query.$or = [
                { nombre: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }

        const [usuarios, total] = await Promise.all([
            Usuario.find(query)
                .select('-password')
                .populate('talleresInscritos')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ fechaRegistro: -1 }),
            Usuario.countDocuments(query)
        ])

        res.json({
            usuarios,
            paginacion: {
                total,
                pagina: parseInt(page),
                totalPaginas: Math.ceil(total / limit),
                porPagina: parseInt(limit)
            }
        })
    } catch (error) {
        console.error('Error al listar usuarios:', error)
        res.status(500).json({
            mensaje: 'Error al listar usuarios',
            error: error.message
        })
    }
}

// Obtener usuario por ID
const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id)
            .select('-password')
            .populate('talleresInscritos')

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        }

        res.json({ usuario })
    } catch (error) {
        console.error('Error al obtener usuario:', error)
        res.status(500).json({
            mensaje: 'Error al obtener usuario',
            error: error.message
        })
    }
}

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, ambito, activo } = req.body
        const usuario = await Usuario.findById(req.params.id)

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        }

        // Actualizar campos
        if (nombre) usuario.nombre = nombre
        if (email) usuario.email = email
        if (password) usuario.password = password
        if (rol) usuario.rol = rol
        if (ambito !== undefined) usuario.ambito = ambito
        if (activo !== undefined) usuario.activo = activo

        await usuario.save()

        res.json({
            mensaje: 'Usuario actualizado',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                ambito: usuario.ambito,
                activo: usuario.activo
            }
        })
    } catch (error) {
        console.error('Error al actualizar usuario:', error)
        res.status(500).json({
            mensaje: 'Error al actualizar usuario',
            error: error.message
        })
    }
}

// Eliminar usuario (soft delete)
const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id)

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' })
        }

        // Soft delete - solo desactivar
        usuario.activo = false
        await usuario.save()

        res.json({ mensaje: 'Usuario desactivado correctamente' })
    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        res.status(500).json({
            mensaje: 'Error al eliminar usuario',
            error: error.message
        })
    }
}

// ============ EXPORTAR TODAS LAS FUNCIONES ============
export default {
    dashboard,
    crearUsuario,
    listarUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario
}