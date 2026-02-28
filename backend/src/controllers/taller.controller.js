import Taller from '../models/taller.model.js'
import Usuario from '../models/usuario.model.js'

//=============APIS EXTERNAS =====================
import { getClima } from "../services/clima.service.js"
import { getFrase } from "../services/frases.service.js"
import { getDatoCurioso } from "../services/curiosidades.service.js"

const dashboard = async (req, res) => {
    const clima = await getClima();
    const frase = await getFrase();
    const dato = await getDatoCurioso();

    res.render("dashboard", {
        clima,
        frase,
        dato
    });
};
// ============ FUNCIONES PARA TALLERES ============
// Crear taller (solo admin)
const crearTaller = async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            ambito,
            profesorId,
            fechaInicio,
            fechaFin,
            fechaLimiteInscripcion,
            cupoMaximo
        } = req.body;

        // Verificar que el profesor existe
        const profesor = await Usuario.findOne({ _id: profesorId, rol: 'profesor', activo: true });
        if (!profesor) {
            return res.status(400).json({
                mensaje: 'El profesor especificado no existe o no está activo'
            });
        }

        const taller = new Taller({
            titulo,
            descripcion,
            ambito,
            profesorId,
            fechaInicio,
            fechaFin,
            fechaLimiteInscripcion,
            cupoMaximo,
            creadoPor: req.usuarioId
        });

        await taller.save();

        res.status(201).json({
            mensaje: 'Taller creado exitosamente',
            taller
        });
    } catch (error) {
        console.error('Error al crear taller:', error);
        res.status(500).json({
            mensaje: 'Error al crear taller',
            error: error.message
        });
    }
};

// Listar talleres con filtros y paginación
const listarTalleres = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            ambito,
            estado,
            profesorId,
            disponible,
            search
        } = req.query;

        const skip = (page - 1) * limit;
        let query = {};

        // Filtros
        if (ambito) query.ambito = ambito;
        if (estado) query.estado = estado;
        if (profesorId) query.profesorId = profesorId;

        // Filtro de disponible
        if (disponible === 'true') {
            const ahora = new Date();
            query.fechaLimiteInscripcion = { $gte: ahora };
            query.estado = 'pendiente';
        }

        if (search) {
            query.$or = [
                { titulo: { $regex: search, $options: 'i' } },
                { descripcion: { $regex: search, $options: 'i' } }
            ];
        }

        // Si es alumno, filtrar por su ámbito
        if (req.usuarioRol === 'alumno' && req.usuarioAmbito) {
            query.$or = [
                { ambito: req.usuarioAmbito },
                { ambito: 'ambos' }
            ];
        }

        // Si es profesor, ver solo sus talleres
        if (req.usuarioRol === 'profesor') {
            query.profesorId = req.usuarioId;
        }

        const [talleres, total] = await Promise.all([
            Taller.find(query)
                .populate('profesorId', 'nombre email')
                .populate('alumnosInscritos.alumnoId', 'nombre email ambito')
                .skip(skip)
                .limit(parseInt(limit))
                .sort({ fechaInicio: 1 }),
            Taller.countDocuments(query)
        ]);

        // Añadir información adicional para cada taller
        const ahora = new Date();
        const talleresConInfo = talleres.map(taller => {
            const tallerObj = taller.toObject();

            // Calcular cupos disponibles
            const alumnosInscritos = taller.alumnosInscritos?.length || 0;
            tallerObj.cuposDisponibles = taller.cupoMaximo - alumnosInscritos;

            // Verificar si puede inscribirse
            const fechaLimite = new Date(taller.fechaLimiteInscripcion);

            tallerObj.inscripcionAbierta =
                taller.estado === 'pendiente' &&
                ahora <= fechaLimite &&
                alumnosInscritos < taller.cupoMaximo;

            return tallerObj;
        });

        res.json({
            talleres: talleresConInfo,
            paginacion: {
                total,
                pagina: parseInt(page),
                totalPaginas: Math.ceil(total / limit),
                porPagina: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error al listar talleres:', error);
        res.status(500).json({
            mensaje: 'Error al listar talleres',
            error: error.message
        });
    }
};

// Obtener taller por ID
const obtenerTaller = async (req, res) => {
    try {
        const taller = await Taller.findById(req.params.id)
            .populate('profesorId', 'nombre email')
            .populate('alumnosInscritos.alumnoId', 'nombre email ambito')
            .populate('creadoPor', 'nombre email');

        if (!taller) {
            return res.status(404).json({ mensaje: 'Taller no encontrado' });
        }

        // Verificar permisos
        if (req.usuarioRol === 'profesor' && taller.profesorId._id.toString() !== req.usuarioId) {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver este taller' });
        }

        const tallerObj = taller.toObject();
        tallerObj.cuposDisponibles = taller.cupoMaximo - (taller.alumnosInscritos?.length || 0);

        const ahora = new Date();
        const fechaLimite = new Date(taller.fechaLimiteInscripcion);
        tallerObj.inscripcionAbierta =
            taller.estado === 'pendiente' &&
            ahora <= fechaLimite &&
            (taller.alumnosInscritos?.length || 0) < taller.cupoMaximo;

        res.json({ taller: tallerObj });
    } catch (error) {
        console.error('Error al obtener taller:', error);
        res.status(500).json({
            mensaje: 'Error al obtener taller',
            error: error.message
        });
    }
};

// Actualizar taller (solo admin)
const actualizarTaller = async (req, res) => {
    try {
        const taller = await Taller.findById(req.params.id);

        if (!taller) {
            return res.status(404).json({ mensaje: 'Taller no encontrado' });
        }

        // No permitir actualizar si ya tiene alumnos inscritos (excepto admin)
        if (taller.alumnosInscritos.length > 0 && req.usuarioRol !== 'admin') {
            return res.status(400).json({
                mensaje: 'No se puede actualizar un taller con alumnos inscritos'
            });
        }

        const {
            titulo,
            descripcion,
            ambito,
            profesorId,
            fechaInicio,
            fechaFin,
            fechaLimiteInscripcion,
            cupoMaximo
        } = req.body;

        if (profesorId) {
            const profesor = await Usuario.findOne({ _id: profesorId, rol: 'profesor' });
            if (!profesor) {
                return res.status(400).json({ mensaje: 'Profesor no válido' });
            }
        }

        taller.titulo = titulo || taller.titulo;
        taller.descripcion = descripcion || taller.descripcion;
        taller.ambito = ambito || taller.ambito;
        taller.profesorId = profesorId || taller.profesorId;
        taller.fechaInicio = fechaInicio || taller.fechaInicio;
        taller.fechaFin = fechaFin || taller.fechaFin;
        taller.fechaLimiteInscripcion = fechaLimiteInscripcion || taller.fechaLimiteInscripcion;
        taller.cupoMaximo = cupoMaximo || taller.cupoMaximo;

        await taller.save();

        res.json({
            mensaje: 'Taller actualizado',
            taller
        });
    } catch (error) {
        console.error('Error al actualizar taller:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar taller',
            error: error.message
        });
    }
};

// Inscribir alumno a taller - VERSIÓN CORREGIDA
const inscribirAlumno = async (req, res) => {
    try {
        console.log('📝 Intento de inscripción recibido:', req.body);
        console.log('👤 Usuario:', req.usuarioId, req.usuarioRol, req.usuarioAmbito);

        const { tallerId } = req.body;

        if (!tallerId) {
            return res.status(400).json({
                mensaje: 'Debe proporcionar el ID del taller'
            });
        }

        if (req.usuarioRol !== 'alumno') {
            return res.status(403).json({
                mensaje: 'Solo alumnos pueden inscribirse'
            });
        }

        const [taller, alumno] = await Promise.all([
            Taller.findById(tallerId),
            Usuario.findById(req.usuarioId)
        ]);

        if (!taller) {
            return res.status(404).json({
                mensaje: 'Taller no encontrado'
            });
        }

        if (!alumno) {
            return res.status(404).json({
                mensaje: 'Alumno no encontrado'
            });
        }

        console.log('✅ Taller encontrado:', taller.titulo);
        console.log('✅ Alumno encontrado:', alumno.nombre);

        // Verificar si ya está inscrito
        if (alumno.talleresInscritos && alumno.talleresInscritos.includes(tallerId)) {
            return res.status(400).json({
                mensaje: 'Ya estás inscrito en este taller'
            });
        }

        // VERIFICAR LÍMITE DE 2 TALLERES
        const talleresInscritos = alumno.talleresInscritos || [];
        if (talleresInscritos.length >= 2) {
            return res.status(400).json({
                mensaje: `No puedes inscribirte a más de 2 talleres. Ya tienes ${talleresInscritos.length} taller(es).`
            });
        }

        // Verificar todas las condiciones
        const ahora = new Date();
        const fechaLimite = new Date(taller.fechaLimiteInscripcion);

        console.log('📅 Fecha actual:', ahora);
        console.log('📅 Fecha límite:', fechaLimite);
        console.log('📅 Estado taller:', taller.estado);
        console.log('📅 Cupo disponible:', taller.cupoDisponible());

        if (taller.estado !== 'pendiente') {
            return res.status(400).json({
                mensaje: `El taller no está en estado pendiente (estado actual: ${taller.estado})`
            });
        }

        if (ahora > fechaLimite) {
            return res.status(400).json({
                mensaje: 'La fecha límite de inscripción ha pasado'
            });
        }

        if (taller.ambito !== 'ambos' && taller.ambito !== alumno.ambito) {
            return res.status(400).json({
                mensaje: `Este taller no está disponible para tu ámbito (${alumno.ambito})`
            });
        }

        if (!taller.cupoDisponible()) {
            return res.status(400).json({
                mensaje: 'El taller no tiene cupos disponibles'
            });
        }

        // ¡TODAS LAS VERIFICACIONES PASARON! Inscribir al alumno
        console.log('✅ Todas las verificaciones pasaron. Inscribiendo...');

        alumno.talleresInscritos = alumno.talleresInscritos || [];
        alumno.talleresInscritos.push(tallerId);

        taller.alumnosInscritos = taller.alumnosInscritos || [];
        taller.alumnosInscritos.push({
            alumnoId: req.usuarioId,
            fechaInscripcion: new Date()
        });

        await Promise.all([alumno.save(), taller.save()]);

        console.log('✅ Inscripción exitosa!');

        res.json({
            mensaje: '✅ Inscripción exitosa',
            taller: taller.titulo,
            talleresRestantes: 2 - (alumno.talleresInscritos.length)
        });

    } catch (error) {
        console.error('❌ Error en inscripción:', error);
        res.status(500).json({
            mensaje: 'Error al inscribirse',
            error: error.message
        });
    }
};

// Cancelar inscripción
const cancelarInscripcion = async (req, res) => {
    try {
        const { tallerId } = req.params;

        const [taller, alumno] = await Promise.all([
            Taller.findById(tallerId),
            Usuario.findById(req.usuarioId)
        ]);

        if (!taller || !alumno) {
            return res.status(404).json({ mensaje: 'Taller o alumno no encontrado' });
        }

        if (!alumno.talleresInscritos.includes(tallerId)) {
            return res.status(400).json({ mensaje: 'No estás inscrito en este taller' });
        }

        if (new Date() > taller.fechaInicio) {
            return res.status(400).json({
                mensaje: 'No puedes cancelar la inscripción después de que el taller ha comenzado'
            });
        }

        alumno.talleresInscritos = alumno.talleresInscritos.filter(
            id => id.toString() !== tallerId
        );

        taller.alumnosInscritos = taller.alumnosInscritos.filter(
            inscripcion => inscripcion.alumnoId.toString() !== req.usuarioId
        );

        await Promise.all([alumno.save(), taller.save()]);

        res.json({ mensaje: 'Inscripción cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar inscripción:', error);
        res.status(500).json({
            mensaje: 'Error al cancelar inscripción',
            error: error.message
        });
    }
};

// Obtener alumnos inscritos a un taller (profesor/admin)
const obtenerAlumnosInscritos = async (req, res) => {
    try {
        const taller = await Taller.findById(req.params.id)
            .populate('alumnosInscritos.alumnoId', 'nombre email ambito');

        if (!taller) {
            return res.status(404).json({ mensaje: 'Taller no encontrado' });
        }

        if (req.usuarioRol === 'profesor' && taller.profesorId.toString() !== req.usuarioId) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para ver los alumnos de este taller'
            });
        }

        const alumnos = taller.alumnosInscritos.map(inscripcion => ({
            id: inscripcion.alumnoId._id,
            nombre: inscripcion.alumnoId.nombre,
            email: inscripcion.alumnoId.email,
            ambito: inscripcion.alumnoId.ambito,
            fechaInscripcion: inscripcion.fechaInscripcion
        }));

        res.json({
            taller: taller.titulo,
            totalAlumnos: alumnos.length,
            alumnos
        });
    } catch (error) {
        console.error('Error al obtener alumnos inscritos:', error);
        res.status(500).json({
            mensaje: 'Error al obtener alumnos inscritos',
            error: error.message
        });
    }
};

// Eliminar taller (solo admin)
const eliminarTaller = async (req, res) => {
    try {
        const taller = await Taller.findById(req.params.id);

        if (!taller) {
            return res.status(404).json({ mensaje: 'Taller no encontrado' });
        }

        if (taller.alumnosInscritos.length > 0) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar un taller con alumnos inscritos'
            });
        }

        await taller.deleteOne();

        res.json({ mensaje: 'Taller eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar taller:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar taller',
            error: error.message
        });
    }
};

// Verificar alertas de inscripción para alumnos
const verificarAlertas = async (req, res) => {
    try {
        if (req.usuarioRol !== 'alumno') {
            return res.json({ alertas: [] });
        }

        const alumno = await Usuario.findById(req.usuarioId);
        const ahora = new Date();

        const talleresProximos = await Taller.find({
            $or: [
                { ambito: req.usuarioAmbito },
                { ambito: 'ambos' }
            ],
            fechaLimiteInscripcion: {
                $gt: ahora,
                $lt: new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000)
            },
            estado: 'pendiente',
            _id: { $nin: alumno.talleresInscritos }
        });

        const alertas = talleresProximos.map(taller => ({
            tipo: 'inscripcion_proxima',
            mensaje: `El taller "${taller.titulo}" cierra inscripciones el ${new Date(taller.fechaLimiteInscripcion).toLocaleDateString()}`,
            tallerId: taller._id
        }));

        if (alumno.talleresInscritos.length < 2) {
            const talleresDisponibles = await Taller.countDocuments({
                $or: [
                    { ambito: req.usuarioAmbito },
                    { ambito: 'ambos' }
                ],
                fechaLimiteInscripcion: { $gt: ahora },
                estado: 'pendiente',
                _id: { $nin: alumno.talleresInscritos }
            });

            if (talleresDisponibles > 0) {
                alertas.push({
                    tipo: 'cupo_disponible',
                    mensaje: `Todavía puedes inscribirte a ${2 - alumno.talleresInscritos.length} taller(es) más`,
                    talleresDisponibles
                });
            }
        }

        res.json({ alertas });
    } catch (error) {
        console.error('Error al verificar alertas:', error);
        res.status(500).json({
            mensaje: 'Error al verificar alertas',
            error: error.message
        });
    }
};

// ============ EXPORTAR TODAS LAS FUNCIONES ============
export default {
    crearTaller,
    listarTalleres,
    obtenerTaller,
    actualizarTaller,
    inscribirAlumno,
    cancelarInscripcion,
    obtenerAlumnosInscritos,
    eliminarTaller,
    verificarAlertas
}