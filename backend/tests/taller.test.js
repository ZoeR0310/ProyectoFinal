const request = require('supertest');
const app = require('../server');
const Usuario = require('../src/models/usuario.model');
const Taller = require('../src/models/taller.model');

describe('Talleres API', () => {
    let token;
    let adminId;
    let profesorId;
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

        // Login para obtener token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: '123456'
            });

        token = loginRes.body.token;
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

    test('PUT /api/talleres/:id - actualizar taller', async () => {
        const res = await request(app)
            .put(`/api/talleres/${tallerId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: 'Taller de Prueba Actualizado'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.taller.titulo).toBe('Taller de Prueba Actualizado');
    });

    test('DELETE /api/talleres/:id - eliminar taller', async () => {
        const res = await request(app)
            .delete(`/api/talleres/${tallerId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.mensaje).toBe('Taller eliminado correctamente');
    });
});