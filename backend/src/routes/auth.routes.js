import express from 'express'
const router = express.Router()

import authController from '../controllers/auth.controller.js'
import autenticarToken from '../middlewares/auth.middleware.js'

router.post('/login', authController.login)
router.post('/registro', authController.registro)
router.get('/perfil', autenticarToken, authController.perfil)

export default router