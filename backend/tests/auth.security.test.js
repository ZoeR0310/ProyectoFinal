import request from 'supertest';
import app from '../server.js';
import Usuario from '../src/models/usuario.model.js';
import jwt from 'jsonwebtoken';

describe('Pruebas de seguridad - Autenticación', () => {
    beforeAll(async () => {
        await Usuario.deleteMany({});
        await Usuario.create({
            nombre: 'Test',
            email: 'test@test.com',
            password: '123456',
            rol: 'alumno',
            ambito: 'universidad'
        });
    });

    test('NoSQL injection en login (operadores)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: { $ne: '' },
                password: { $ne: '' }
            });
        expect([400, 401]).toContain(res.statusCode);
    });

    test('Token malformado', async () => {
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', 'Bearer malformed.token.here');
        expect(res.statusCode).toBe(403);
    });

    test('Token con firma inválida', async () => {
        const tokenInvalido = jwt.sign(
            { id: 'fake', rol: 'admin' },
            'clave-incorrecta',
            { expiresIn: '1h' }
        );
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenInvalido}`);
        expect(res.statusCode).toBe(403);
    });

    test('Token expirado (simulado)', async () => {
        const tokenExpirado = jwt.sign(
            { id: 'fake', rol: 'admin' },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '0s' }
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
        const res = await request(app)
            .get('/api/usuarios')
            .set('Authorization', `Bearer ${tokenExpirado}`);
        expect(res.statusCode).toBe(403);
    });
});