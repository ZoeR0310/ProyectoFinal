const request = require('supertest');
const app = require('../server');
const Usuario = require('../src/models/usuario.model');

describe('Usuarios API', () => {
    let token;
    let usuarioId;

    beforeAll(async () => {
        await Usuario.deleteMany({});

        // Crear admin para pruebas
        const admin = await Usuario.create({
            nombre: 'Admin Test',
            email: 'admin@test.com',
            password: '123456',
            rol: 'admin'
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@test.com',
                password: '123456'
            });

        token = loginRes.body.token;
    });

    test('POST /api/usuarios - crear alumno', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Alumno Test',
                email: 'alumno@test.com',
                password: '123456',
                rol: 'alumno',
                ambito: 'universidad'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.usuario.email).toBe('alumno@test.com');
        expect(res.body.usuario.rol).toBe('alumno');

        usuarioId = res.body.usuario.id;
    });

    test('GET /api/usuarios - listar usuarios con filtros', async () => {
        const res = await request(app)
            .get('/api/usuarios?rol=alumno&page=1&limit=5')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('usuarios');
        expect(res.body).toHaveProperty('paginacion');
    });

    test('POST /api/usuarios - validar datos incorrectos', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Test',
                email: 'email-invalido',
                password: '123',
                rol: 'alumno'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errores');
    });
});