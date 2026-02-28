const request = require('supertest');
const app = require('../server');
const Usuario = require('../src/models/usuario.model');

describe('Autenticación', () => {
    beforeEach(async () => {
        await Usuario.deleteMany({});
    });

    test('POST /api/auth/login - éxito', async () => {
        // Crear usuario primero
        await Usuario.create({
            nombre: 'Test',
            email: 'test@test.com',
            password: '123456',
            rol: 'alumno',
            ambito: 'universidad'
        });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: '123456'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.usuario.email).toBe('test@test.com');
    });

    test('POST /api/auth/login - credenciales inválidas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'noexiste@test.com',
                password: '123456'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.mensaje).toBe('Credenciales inválidas');
    });
});