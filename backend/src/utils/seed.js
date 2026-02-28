import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import Usuario from '../models/usuario.model.js'
import Taller from '../models/taller.model.js'

const seedDatabase = async () => {
    try {
        console.log('🔄 Conectando a MongoDB...')
        console.log('📁 .env path:', path.resolve(__dirname, '../../.env'))

        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ Conectado a MongoDB')

        // Limpar base de dados
        console.log('🧹 Limpiando base de datos...')
        await Usuario.deleteMany({})
        await Taller.deleteMany({})
        console.log('✅ Base de datos limpiada')

        // Criar usuários de teste
        console.log('👤 Creando usuarios de prueba...')

        const admin = await Usuario.create({
            nombre: 'Admin Principal',
            email: 'admin@test.com',
            password: '123456',
            rol: 'admin'
        })
        console.log('✅ Admin creado: admin@test.com / 123456')

        const profesor = await Usuario.create({
            nombre: 'Profesor García',
            email: 'profesor@test.com',
            password: '123456',
            rol: 'profesor'
        })
        console.log('✅ Profesor creado: profesor@test.com / 123456')

        const alumnoPrepa = await Usuario.create({
            nombre: 'Ana López',
            email: 'ana@test.com',
            password: '123456',
            rol: 'alumno',
            ambito: 'preparatoria'
        })
        console.log('✅ Alumno Preparatoria creado: ana@test.com / 123456')

        const alumnoUni = await Usuario.create({
            nombre: 'Carlos Ruiz',
            email: 'carlos@test.com',
            password: '123456',
            rol: 'alumno',
            ambito: 'universidad'
        })
        console.log('✅ Alumno Universidad creado: carlos@test.com / 123456')

        // Criar datas para os talleres
        const fechaInicio = new Date()
        fechaInicio.setDate(fechaInicio.getDate() + 7)

        const fechaFin = new Date(fechaInicio)
        fechaFin.setDate(fechaFin.getDate() + 30)

        const fechaLimite = new Date(fechaInicio)
        fechaLimite.setDate(fechaLimite.getDate() - 3)

        // Criar talleres
        console.log('📚 Creando talleres de prueba...')

        await Taller.create([
            {
                titulo: 'Taller de Matemáticas Avanzadas',
                descripcion: 'Curso intensivo de cálculo y álgebra para universitarios',
                ambito: 'universidad',
                profesorId: profesor._id,
                fechaInicio,
                fechaFin,
                fechaLimiteInscripcion: fechaLimite,
                cupoMaximo: 20,
                creadoPor: admin._id
            },
            {
                titulo: 'Taller de Robótica para Jóvenes',
                descripcion: 'Introducción a la robótica educativa con Arduino',
                ambito: 'preparatoria',
                profesorId: profesor._id,
                fechaInicio,
                fechaFin,
                fechaLimiteInscripcion: fechaLimite,
                cupoMaximo: 15,
                creadoPor: admin._id
            },
            {
                titulo: 'Programación Web Full Stack',
                descripcion: 'Aprende HTML, CSS, JavaScript, Node.js y MongoDB',
                ambito: 'ambos',
                profesorId: profesor._id,
                fechaInicio,
                fechaFin,
                fechaLimiteInscripcion: fechaLimite,
                cupoMaximo: 25,
                creadoPor: admin._id
            }
        ])

        console.log('✅ Talleres creados correctamente')

        // Verificar que los datos se guardaron
        const usuariosCount = await Usuario.countDocuments()
        const talleresCount = await Taller.countDocuments()

        console.log('\n📊 RESUMEN:')
        console.log(`Total usuarios: ${usuariosCount}`)
        console.log(`Total talleres: ${talleresCount}`)
        console.log('\n👥 USUARIOS CREADOS:')
        console.log('Admin:     admin@test.com / 123456')
        console.log('Profesor:  profesor@test.com / 123456')
        console.log('Alumna:    ana@test.com / 123456 (Preparatoria)')
        console.log('Alumno:    carlos@test.com / 123456 (Universidad)')

        console.log('\n✅ SEED COMPLETADO CON ÉXITO')
        process.exit(0)

    } catch (error) {
        console.error('❌ ERROR:', error)

        if (error.message.includes('Usuario')) {
            console.log('\n🔍 ERROR: No se encuentra el modelo Usuario')
            console.log('Verifique que el archivo existe en: src/models/usuario.model.js')
        }

        if (error.message.includes('Taller')) {
            console.log('\n🔍 ERROR: No se encuentra el modelo Taller')
            console.log('Verifique que el archivo existe en: src/models/taller.model.js')
        }

        process.exit(1)
    }
}

seedDatabase()