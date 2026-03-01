import request from 'supertest';
import app from '../server.js';
import Usuario from '../src/models/usuario.model.js';
import Taller from '../src/models/taller.model.js';

describe('Talleres API', () => {
    let token;
    let adminId;
    let profesorId;
    let profesorToken;
    let otroProfesorToken;
    let tallerId;

    beforeAll(async () => {
        // Limpiar base de datos
        await Usuario.deleteMany({});
        await Taller.deleteMany({});

        // Crear admin
        const admin = await Usuario.create({
            nombre: 'Admin Test',
            email: 'admin@test.com',
            password: '123456',
            rol: 'admin'
        });
        adminId = admin._id;

        // Crear profesor
        const profesor = await Usuario.create({
            nombre: 'Profesor Test',
            email: 'profesor@test.com',
            password: '123456',
            rol: 'profesor'
        });
        profesorId = profesor._id;

        // Crear otro profesor
        const otroProfesor = await Usuario.create({
            nombre: 'Otro Profesor',
            email: 'otroprof@test.com',
            password: '123456',
            rol: 'profesor'
        });

        // Login admin
        const loginAdmin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: '123456' });
        token = loginAdmin.body.token;

        // Login profesor principal
        const loginProf = await request(app)
            .post('/api/auth/login')
            .send({ email: 'profesor@test.com', password: '123456' });
        profesorToken = loginProf.body.token;

        // Login otro profesor
        const loginOtroProf = await request(app)
            .post('/api/auth/login')
            .send({ email: 'otroprof@test.com', password: '123456' });
        otroProfesorToken = loginOtroProf.body.token;
    });

    test('POST /api/talleres - crear taller (admin)', async () => {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() + 7);

        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 30);

        const fechaLimite = new Date(fechaInicio);
        fechaLimite.setDate(fechaLimite.getDate() - 3);

        const res = await request(app)
            .post('/api/talleres')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: 'Taller de Prueba',
                descripcion: 'Descripción del taller de prueba',
                ambito: 'universidad',
                profesorId: profesorId.toString(),
                fechaInicio: fechaInicio.toISOString(),
                fechaFin: fechaFin.toISOString(),
                fechaLimiteInscripcion: fechaLimite.toISOString(),
                cupoMaximo: 20
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('taller');
        expect(res.body.taller.titulo).toBe('Taller de Prueba');

        tallerId = res.body.taller._id;
    });

    test('GET /api/talleres - listar talleres con paginación', async () => {
        const res = await request(app)
            .get('/api/talleres?page=1&limit=5')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('talleres');
        expect(res.body).toHaveProperty('paginacion');
        expect(Array.isArray(res.body.talleres)).toBe(true);
    });

    test('GET /api/talleres/:id - obtener taller por ID', async () => {
        const res = await request(app)
            .get(`/api/talleres/${tallerId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.taller._id).toBe(tallerId);
    });

    test('PUT /api/talleres/:id - actualizar taller (admin)', async () => {
        const res = await request(app)
            .put(`/api/talleres/${tallerId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: 'Taller de Prueba Actualizado'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.taller.titulo).toBe('Taller de Prueba Actualizado');
    });


    test('PUT /api/talleres/:id - profesor no puede actualizar taller ajeno', async () => {
        const res = await request(app)
            .put(`/api/talleres/${tallerId}`)
            .set('Authorization', `Bearer ${otroProfesorToken}`)
            .send({ titulo: 'Intento de cambio' });

        expect(res.statusCode).toBe(403);
    });

    test('DELETE /api/talleres/:id - admin puede eliminar taller', async () => {
        const res = await request(app)
            .delete(`/api/talleres/${tallerId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Taller eliminado correctamente');
    });

    test('GET /api/talleres - paginación con valores extremos', async () => {
        const res = await request(app)
            .get('/api/talleres?page=999999&limit=100000')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.talleres.length).toBeLessThanOrEqual(100);
    });
});