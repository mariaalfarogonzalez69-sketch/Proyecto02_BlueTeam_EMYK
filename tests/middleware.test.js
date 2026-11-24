
const { test } = require('node:test');
const assert = require('node:assert/strict');

const requierePermiso = require('../src/middleware/requierePermiso');
const requiereRol = require('../src/middleware/requiereRol');

// Simula los objetos req y res de Express para probar los middlewares.
async function ejecutarMiddleware(middleware, usuario) {
    let nextLlamado = false;
    let statusCode = 200;
    let vista = null;

    const req = {
        usuario,
        method: 'GET',
        originalUrl: '/ruta-prueba'
    };

    const res = {
        status(codigo) {
            statusCode = codigo;
            return this;
        },
        render(nombreVista) {
            vista = nombreVista;
            return this;
        }
    };

    await middleware(req, res, () => {
        nextLlamado = true;
    });

    return { nextLlamado, statusCode, vista };
}

// ---------- PRUEBAS DE requierePermiso ----------

test('Permite continuar cuando el usuario tiene el permiso', async () => {
    const usuario = {
        id: 1,
        rol: 'Taquillero',
        permisos: ['crear', 'editar']
    };

    const resultado = await ejecutarMiddleware(
        requierePermiso('crear'),
        usuario
    );

    assert.equal(resultado.nextLlamado, true);
    assert.equal(resultado.statusCode, 200);
});

test('Devuelve 403 cuando el usuario no tiene el permiso', async () => {
    const usuario = {
        id: 2,
        rol: 'Auditor',
        permisos: ['ver_reportes']
    };

    const resultado = await ejecutarMiddleware(
        requierePermiso('crear'),
        usuario
    );

    assert.equal(resultado.nextLlamado, false);
    assert.equal(resultado.statusCode, 403);
    assert.equal(resultado.vista, 'errores/403');
});

test('Devuelve 403 cuando no existe un usuario', async () => {
    const resultado = await ejecutarMiddleware(
        requierePermiso('crear'),
        undefined
    );

    assert.equal(resultado.nextLlamado, false);
    assert.equal(resultado.statusCode, 403);
});

// ---------- PRUEBAS DE requiereRol ----------

test('Permite continuar cuando el usuario tiene el rol requerido', async () => {
    const usuario = {
        id: 3,
        rol: 'Taquillero',
        permisos: ['crear', 'editar', 'borrar']
    };

    const resultado = await ejecutarMiddleware(
        requiereRol('Taquillero'),
        usuario
    );

    assert.equal(resultado.nextLlamado, true);
    assert.equal(resultado.statusCode, 200);
});

test('Devuelve 403 cuando el usuario no tiene el rol requerido', async () => {
    const usuario = {
        id: 2,
        rol: 'Auditor',
        permisos: ['ver_reportes']
    };

    const resultado = await ejecutarMiddleware(
        requiereRol('Taquillero'),
        usuario
    );

    assert.equal(resultado.nextLlamado, false);
    assert.equal(resultado.statusCode, 403);
    assert.equal(resultado.vista, 'errores/403');
});

test('Permite continuar cuando el usuario tiene uno de varios roles aceptados', async () => {
    const usuario = {
        id: 1,
        rol: 'SuperAdmin',
        permisos: ['crear', 'editar', 'borrar', 'ver_reportes']
    };

    const resultado = await ejecutarMiddleware(
        requiereRol('Taquillero', 'SuperAdmin'),
        usuario
    );

    assert.equal(resultado.nextLlamado, true);
    assert.equal(resultado.statusCode, 200);
});

test('Devuelve 403 cuando no existe un usuario', async () => {
    const resultado = await ejecutarMiddleware(
        requiereRol('Taquillero'),
        undefined
    );

    assert.equal(resultado.nextLlamado, false);
    assert.equal(resultado.statusCode, 403);
});
