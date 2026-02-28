import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ MongoDB Atlas conectado correctamente')

        mongoose.connection.on('error', (err) => {
            console.error('❌ Error en conexión MongoDB:', err)
        })

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB desconectado')
        })

    } catch (error) {
        console.error('❌ Error al conectar MongoDB:', error.message)
        process.exit(1)
    }
}

export default connectDB