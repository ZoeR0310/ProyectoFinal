import request from 'supertest';
import app from '../server.js';
import Usuario from '../src/models/usuario.model.js';

describe('Usuarios API', () => {
    let token;
    let usuarioId;
    let alumnoToken;

    beforeAll(async () => {
        await Usuario.deleteMany({});

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

        const alumno = await Usuario.create({
            nombre: 'Alumno Test',
            email: 'alumno@test.com',
            password: '123456',
            rol: 'alumno',
            ambito: 'universidad'
        });

        const loginAlumno = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'alumno@test.com',
                password: '123456'
            });

        alumnoToken = loginAlumno.body.token;
    });

    test('POST /api/usuarios - crear alumno (admin)', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Alumno Test',
                email: 'alumno2@test.com',
                password: '123456',
                rol: 'alumno',
                ambito: 'universidad'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.usuario.email).toBe('alumno2@test.com');
        expect(res.body.usuario.rol).toBe('alumno');

        usuarioId = res.body.usuario.id;
    });

    test('GET /api/usuarios - listar usuarios con filtros (admin)', async () => {
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
        expect(res.body.mensaje || res.body.errores).toBeDefined();
    });

    test('POST /api/usuarios - email duplicado debe dar error', async () => {
        await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Primero',
                email: 'duplicado@test.com',
                password: '123456',
                rol: 'alumno',
                ambito: 'universidad'
            });

        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Segundo',
                email: 'duplicado@test.com',
                password: '123456',
                rol: 'alumno',
                ambito: 'universidad'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.mensaje || res.body.errores).toBeDefined();
    });

    test('POST /api/usuarios - alumno no puede crear usuarios', async () => {
        const res = await request(app)
            .post('/api/usuarios')
            .set('Authorization', `Bearer ${alumnoToken}`)
            .send({
                nombre: 'Otro',
                email: 'otro@test.com',
                password: '123456',
                rol: 'alumno',
                ambito: 'universidad'
            });

        expect(res.statusCode).toBe(403);
    });
});