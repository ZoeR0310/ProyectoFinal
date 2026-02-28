import mongoose from 'mongoose'

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    rol: { type: String, enum: ['admin', 'profesor', 'alumno'], default: 'alumno', required: true },
    ambito: { type: String, enum: ['preparatoria', 'universidad', null], default: null },
    talleresInscritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Taller' }],
    fechaRegistro: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false })

const Usuario = mongoose.model('Usuario', usuarioSchema)
export default Usuario