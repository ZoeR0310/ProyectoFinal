import express from 'express'
const router = express.Router()

import tallerController from '../controllers/taller.controller.js'
import autenticarToken from '../middlewares/auth.middleware.js'
import {
    esAdmin,
    esProfesor,
    esAlumno,
    verificarAmbitoAlumno
} from '../middlewares/roles.middleware.js'
import {
    validarTaller,
    validarInscripcion
} from '../middlewares/validation.middleware.js'

// Todas las rutas requieren autenticación
router.use(autenticarToken)

// Rutas públicas (para todos los roles autenticados)
router.get('/', tallerController.listarTalleres)
router.get('/alertas', tallerController.verificarAlertas)
router.get('/:id', tallerController.obtenerTaller)

// Rutas para alumnos
router.post('/inscribir',
    esAlumno,
    verificarAmbitoAlumno,
    validarInscripcion,
    tallerController.inscribirAlumno
)

router.delete('/:tallerId/cancelar',
    esAlumno,
    tallerController.cancelarInscripcion
)

// Rutas para profesores y admin
router.get('/:id/alumnos',
    esProfesor,
    tallerController.obtenerAlumnosInscritos
)

// Rutas solo para admin
router.post('/',
    esAdmin,
    validarTaller,
    tallerController.crearTaller
)

router.put('/:id',
    esAdmin,
    tallerController.actualizarTaller
)

router.delete('/:id',
    esAdmin,
    tallerController.eliminarTaller
)

export default router