import express from 'express'
const router = express.Router()

import usuarioController from '../controllers/usuario.controller.js'
import autenticarToken from '../middlewares/auth.middleware.js'
import { esAdmin } from '../middlewares/roles.middleware.js'

// Todas as rotas requerem autenticação e ser admin
router.use(autenticarToken, esAdmin)

// CRUD de usuários
router.post('/', usuarioController.crearUsuario)
router.get('/', usuarioController.listarUsuarios)
router.get('/:id', usuarioController.obtenerUsuario)
router.put('/:id', usuarioController.actualizarUsuario)
router.delete('/:id', usuarioController.eliminarUsuario)

export default router