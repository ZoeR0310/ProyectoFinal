import mongoose from 'mongoose'

const tallerSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título del taller es obligatorio'],
        trim: true
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    ambito: {
        type: String,
        enum: ['preparatoria', 'universidad', 'ambos'],
        required: true
    },
    profesorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    fechaLimiteInscripcion: {
        type: Date,
        required: true
    },
    cupoMaximo: {
        type: Number,
        required: true,
        min: 1
    },
    alumnosInscritos: [{
        alumnoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        fechaInscripcion: {
            type: Date,
            default: Date.now
        }
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'en_curso', 'finalizado', 'cancelado'],
        default: 'pendiente'
    },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
})

// Métodos
tallerSchema.methods.cupoDisponible = function () {
    const inscritos = this.alumnosInscritos ? this.alumnosInscritos.length : 0
    return inscritos < this.cupoMaximo
}

tallerSchema.methods.puedeInscribirse = function (alumnoAmbito) {
    const ahora = new Date()
    const fechaLimite = new Date(this.fechaLimiteInscripcion)

    return (this.ambito === 'ambos' || this.ambito === alumnoAmbito) &&
        this.cupoDisponible() &&
        this.estado === 'pendiente' &&
        ahora <= fechaLimite
}

const Taller = mongoose.model('Taller', tallerSchema)
export default Taller