import request from 'supertest';
import app from '../server.js';
import Usuario from '../src/models/usuario.model.js';
import mongoose from 'mongoose';

describe('Autenticación', () => {
    beforeEach(async () => {
        await Usuario.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('POST /api/auth/login - éxito', async () => {
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

    test('POST /api/auth/login - debe rechazar intento de inyección NoSQL', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: { $ne: null },
                password: { $ne: null }
            });

        expect([400, 401]).toContain(res.statusCode);
    });

    test('GET /api/usuarios - sin token debe dar 401', async () => {
        const res = await request(app).get('/api/usuarios');
        expect(res.statusCode).toBe(401);
    });
});