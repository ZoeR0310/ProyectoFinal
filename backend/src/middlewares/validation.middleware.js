import { body, validationResult } from 'express-validator'

// Validar creación de taller
const validarTaller = [
    body('titulo')
        .notEmpty().withMessage('El título es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El título debe tener entre 3 y 100 caracteres'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 500 }).withMessage('La descripción debe tener entre 10 y 500 caracteres'),
    body('ambito')
        .isIn(['preparatoria', 'universidad', 'ambos']).withMessage('Ámbito no válido'),
    body('profesorId')
        .notEmpty().withMessage('El ID del profesor es obligatorio')
        .isMongoId().withMessage('ID de profesor no válido'),
    body('fechaInicio')
        .isISO8601().withMessage('Fecha de inicio no válida')
        .custom((value, { req }) => {
            if (new Date(value) < new Date()) {
                throw new Error('La fecha de inicio no puede ser en el pasado')
            }
            return true
        }),
    body('fechaFin')
        .isISO8601().withMessage('Fecha de fin no válida')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.fechaInicio)) {
                throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
            }
            return true
        }),
    body('fechaLimiteInscripcion')
        .isISO8601().withMessage('Fecha límite no válida')
        .custom((value, { req }) => {
            if (new Date(value) >= new Date(req.body.fechaInicio)) {
                throw new Error('La fecha límite debe ser anterior a la fecha de inicio')
            }
            return true
        }),
    body('cupoMaximo')
        .isInt({ min: 1, max: 100 }).withMessage('El cupo debe ser entre 1 y 100'),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() })
        }
        next()
    }
]

// Validar registro de usuario (solo admin)
const validarRegistroUsuario = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('email')
        .isEmail().withMessage('Email no válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('rol')
        .isIn(['admin', 'profesor', 'alumno']).withMessage('Rol no válido'),
    body('ambito')
        .custom((value, { req }) => {
            if (req.body.rol === 'alumno' && !value) {
                throw new Error('El ámbito es obligatorio para alumnos')
            }
            if (req.body.rol !== 'alumno' && value) {
                throw new Error('Solo los alumnos pueden tener ámbito')
            }
            return true
        })
        .isIn(['preparatoria', 'universidad', null]).withMessage('Ámbito no válido'),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() })
        }
        next()
    }
]

// Validar inscripción a taller
const validarInscripcion = [
    body('tallerId')
        .isMongoId().withMessage('ID de taller no válido'),

    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() })
        }
        next()
    }
]

export {
    validarTaller,
    validarRegistroUsuario,
    validarInscripcion
}