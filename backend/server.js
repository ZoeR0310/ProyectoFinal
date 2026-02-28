import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './src/config/db.js'
import errorHandler from './src/middlewares/error.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

connectDB()

const app = express()

// Configuração CORS completa
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logs
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`)
  next()
})

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')))

// ============ RUTAS API ============
import authRoutes from './src/routes/auth.routes.js'
import usuarioRoutes from './src/routes/usuario.routes.js'
import tallerRoutes from './src/routes/taller.routes.js'

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/talleres', tallerRoutes)

// ============ RUTAS PÁGINAS ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'))
})

app.get('/profesor-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profesor-dashboard.html'))
})

app.get('/alumno-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'alumno-dashboard.html'))
})

// ============ RUTA DE PRUEBA ============
app.get('/api/test', (req, res) => {
  res.json({
    mensaje: 'API funcionando',
    version: '2.0.0',
    roles: ['admin', 'profesor', 'alumno']
  })
})

// ============ MIDDLEWARE ERRORES ============
app.use(errorHandler)

// ============ 404 ============
app.use((req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada',
    error: `${req.method} ${req.url}`
  })
})

// ============ INICIAR ============
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando en http://localhost:${PORT}`)
  console.log(`🌐 Login: http://localhost:${PORT}`)
  console.log(`👤 Admin: http://localhost:${PORT}/admin-dashboard`)
  console.log(`👨‍🏫 Profesor: http://localhost:${PORT}/profesor-dashboard`)
  console.log(`👨‍🎓 Alumno: http://localhost:${PORT}/alumno-dashboard`)
  console.log(`🚀 API Test: http://localhost:${PORT}/api/test`)
})

export default app