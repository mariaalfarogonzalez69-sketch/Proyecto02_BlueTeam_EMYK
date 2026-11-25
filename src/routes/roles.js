
const express = require('express');
const router = express.Router();

const sequelize = require('../config/db');
const {
    Rol,
    Usuario,
    Permiso,
    RolPermiso
} = require('../models/asociacionesUsuariosRoles');

const requiereSesion = require('../middleware/requiereSesion');
const requiereRol = require('../middleware/requiereRol');
const { registrarAuditoria } = require('../utils/auditoria');

const PERMISOS_VALIDOS = ['crear', 'editar', 'borrar', 'ver_reportes'];
const ROLES_PROTEGIDOS = ['SuperAdmin', 'Auditor', 'Taquillero'];

// Todas las rutas de roles requieren sesión y rol SuperAdmin.
router.use(requiereSesion, requiereRol('SuperAdmin'));

async function cargarPermisos(opciones = {}) {
    return Permiso.findAll({
        order: [['nombre', 'ASC']],
        ...opciones
    });
}

function permisosSeleccionados(body = {}) {
    const recibidos = body.permisos;

    const lista = recibidos === undefined
        ? []
        : Array.isArray(recibidos)
            ? recibidos
            : [recibidos];

    return [...new Set(lista.map(String))];
}

function idValido(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

// Listar roles y sus permisos.
router.get('/roles', async (req, res, next) => {
    try {
        const roles = await Rol.findAll({
            include: [{
                model: Permiso,
                as: 'Permisos',
                attributes: ['id', 'nombre'],
                through: { attributes: [] }
            }],
            order: [['id', 'ASC']]
        });

        return res.render('roles/index', {
            titulo: 'Gestión de roles',
            roles,
            mensaje: typeof req.query.mensaje === 'string'
                ? req.query.mensaje
                : ''
        });
    } catch (error) {
        console.error('Error al consultar roles:', error.message);
        error.status = 500;
        return next(error);
    }
});

// Formulario para crear un rol.
router.get('/roles/nuevo', async (req, res, next) => {
    try {
        const permisos = await cargarPermisos();

        return res.render('roles/nuevo', {
            titulo: 'Crear rol',
            permisos,
            error: null,
            datos: {}
        });
    } catch (error) {
        console.error('Error al cargar formulario de rol:', error.message);
        error.status = 500;
        return next(error);
    }
});

// Crear rol y asignar sus permisos.
router.post('/roles', async (req, res, next) => {
    const nombre = typeof req.body.nombre === 'string'
        ? req.body.nombre.trim()
        : '';

    const seleccionados = permisosSeleccionados(req.body);

    try {
        const permisos = await cargarPermisos();

        if (!nombre || nombre.length > 50) {
            return res.status(400).render('roles/nuevo', {
                titulo: 'Crear rol',
                permisos,
                error: 'El nombre es obligatorio y no puede superar 50 caracteres.',
                datos: { nombre }
            });
        }

        if (ROLES_PROTEGIDOS.includes(nombre)) {
            return res.status(400).render('roles/nuevo', {
                titulo: 'Crear rol',
                permisos,
                error: 'Ese nombre está reservado para un rol del sistema.',
                datos: { nombre }
            });
        }

        if (seleccionados.some(p => !PERMISOS_VALIDOS.includes(p))) {
            return res.status(400).render('roles/nuevo', {
                titulo: 'Crear rol',
                permisos,
                error: 'La selección contiene permisos no válidos.',
                datos: { nombre }
            });
        }

        const existentes = await Permiso.findAll({
            where: { nombre: seleccionados }
        });

        if (existentes.length !== seleccionados.length) {
            return res.status(400).render('roles/nuevo', {
                titulo: 'Crear rol',
                permisos,
                error: 'Uno o más permisos no existen.',
                datos: { nombre }
            });
        }

        let rolCreado;

        await sequelize.transaction(async (transaction) => {
            rolCreado = await Rol.create(
                { nombre },
                { transaction }
            );

            if (existentes.length) {
                await RolPermiso.bulkCreate(
                    existentes.map(permiso => ({
                        rol_id: rolCreado.id,
                        permiso_id: permiso.id
                    })),
                    { transaction }
                );
            }
        });

        // La auditoría se registra después de confirmar la transacción.
        await registrarAuditoria(
            req,
            'cambio_rol',
            `Se creó el rol ${nombre} con ID ${rolCreado.id}.`
        );

        if (existentes.length) {
            await registrarAuditoria(
                req,
                'cambio_permisos',
                `Se asignaron permisos al nuevo rol ${nombre}.`
            );
        }

        return res.redirect('/roles?mensaje=creado');
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const permisos = await cargarPermisos();

            return res.status(400).render('roles/nuevo', {
                titulo: 'Crear rol',
                permisos,
                error: 'Ya existe un rol con ese nombre.',
                datos: { nombre }
            });
        }

        console.error('Error al crear rol:', error.message);
        error.status = 500;
        return next(error);
    }
});

// Formulario para editar nombre y permisos.
router.get('/roles/:id/editar', async (req, res, next) => {
    if (!idValido(req.params.id)) {
        return res.status(400).send('Identificador de rol inválido.');
    }

    try {
        const rol = await Rol.findByPk(Number(req.params.id), {
            include: [{
                model: Permiso,
                as: 'Permisos',
                attributes: ['id', 'nombre'],
                through: { attributes: [] }
            }]
        });

        if (!rol) {
            const error = new Error('Rol no encontrado.');
            error.status = 404;
            return next(error);
        }

        const permisos = await cargarPermisos();

        return res.render('roles/editar', {
            titulo: 'Editar rol',
            rol,
            permisos,
            error: null
        });
    } catch (error) {
        console.error('Error al cargar rol:', error.message);
        error.status = 500;
        return next(error);
    }
});

// Actualizar nombre y permisos del rol.
router.post('/roles/:id/editar', async (req, res, next) => {
    if (!idValido(req.params.id)) {
        return res.status(400).send('Identificador de rol inválido.');
    }

    const nombre = typeof req.body.nombre === 'string'
        ? req.body.nombre.trim()
        : '';

    const seleccionados = permisosSeleccionados(req.body);

    let transaccion;

    try {
        transaccion = await sequelize.transaction();

        // Bloquear el rol durante toda la operación de edición.
        const rol = await Rol.findByPk(Number(req.params.id), {
            transaction: transaccion,
            lock: transaccion.LOCK.UPDATE
        });

        if (!rol) {
            await transaccion.rollback();
            const error = new Error('Rol no encontrado.');
            error.status = 404;
            return next(error);
        }

        // Obtener los permisos actuales dentro de la misma transacción.
        const permisosAnterioresRegistros = await rol.getPermisos({
            transaction: transaccion
        });

        rol.Permisos = permisosAnterioresRegistros;

        const permisos = await cargarPermisos({
            transaction: transaccion
        });

        const mostrarError = async (mensaje) => {
            await transaccion.rollback();

            return res.status(400).render('roles/editar', {
                titulo: 'Editar rol',
                rol,
                permisos,
                error: mensaje
            });
        };

        if (!nombre || nombre.length > 50) {
            return mostrarError(
                'El nombre es obligatorio y no puede superar 50 caracteres.'
            );
        }

        // No permitir renombrar los roles del sistema.
        if (
            ROLES_PROTEGIDOS.includes(rol.nombre) &&
            nombre !== rol.nombre
        ) {
            return mostrarError(
                'No se puede cambiar el nombre de un rol del sistema.'
            );
        }

        if (
            ROLES_PROTEGIDOS.includes(nombre) &&
            nombre !== rol.nombre
        ) {
            return mostrarError(
                'Ese nombre está reservado para un rol del sistema.'
            );
        }

        if (seleccionados.some(p => !PERMISOS_VALIDOS.includes(p))) {
            return mostrarError(
                'La selección contiene permisos no válidos.'
            );
        }

        const existentes = await Permiso.findAll({
            where: { nombre: seleccionados },
            transaction: transaccion
        });

        if (existentes.length !== seleccionados.length) {
            return mostrarError(
                'Uno o más permisos no existen.'
            );
        }

        const permisosNuevos = [...seleccionados].sort();

        const permisosAnteriores = permisosAnterioresRegistros
            .map(p => p.nombre)
            .sort();

        const cambioPermisos =
            JSON.stringify(permisosAnteriores) !==
            JSON.stringify(permisosNuevos);

        const cambioNombre = rol.nombre !== nombre;

        // El SuperAdmin conserva siempre todos sus permisos.
        if (rol.nombre === 'SuperAdmin' && cambioPermisos) {
            return mostrarError(
                'No se pueden modificar los permisos del rol SuperAdmin.'
            );
        }

        rol.nombre = nombre;

        await rol.save({
            transaction: transaccion
        });

        if (cambioPermisos) {
            await RolPermiso.destroy({
                where: { rol_id: rol.id },
                transaction: transaccion
            });

            if (existentes.length) {
                await RolPermiso.bulkCreate(
                    existentes.map(permiso => ({
                        rol_id: rol.id,
                        permiso_id: permiso.id
                    })),
                    { transaction: transaccion }
                );
            }
        }

        await transaccion.commit();

        // Registrar los cambios después del commit.
        if (cambioNombre) {
            await registrarAuditoria(
                req,
                'cambio_rol',
                `Se cambió el nombre del rol con ID ${rol.id}.`
            );
        }

        if (cambioPermisos) {
            await registrarAuditoria(
                req,
                'cambio_permisos',
                `Se actualizaron los permisos del rol ${rol.nombre}.`
            );
        }

        return res.redirect('/roles?mensaje=actualizado');
    } catch (error) {
        if (transaccion && !transaccion.finished) {
            await transaccion.rollback();
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            try {
                const rol = await Rol.findByPk(Number(req.params.id), {
                    include: [{
                        model: Permiso,
                        as: 'Permisos',
                        through: { attributes: [] }
                    }]
                });

                if (!rol) {
                    const error = new Error('Rol no encontrado.');
                    error.status = 404;
                    return next(error);
                }

                const permisos = await cargarPermisos();

                return res.status(400).render('roles/editar', {
                    titulo: 'Editar rol',
                    rol,
                    permisos,
                    error: 'Ya existe un rol con ese nombre.'
                });
            } catch (errorCarga) {
                console.error(
                    'Error al recuperar el rol:',
                    errorCarga.message
                );

                errorCarga.status = 500;
                return next(errorCarga);
            }
        }

        console.error('Error al editar rol:', error.message);
        error.status = 500;
        return next(error);
    }
});

// Eliminar rol únicamente si no es protegido y no tiene usuarios.
router.post('/roles/:id/eliminar', async (req, res, next) => {
    if (!idValido(req.params.id)) {
        return res.status(400).send('Identificador de rol inválido.');
    }

    try {
        let resultado;

        await sequelize.transaction(async (transaction) => {
            const rol = await Rol.findByPk(Number(req.params.id), {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

            if (!rol) {
                resultado = { estado: 'no-encontrado' };
                return;
            }

            if (ROLES_PROTEGIDOS.includes(rol.nombre)) {
                resultado = { estado: 'protegido' };
                return;
            }

            const usuariosAsignados = await Usuario.count({
                where: { rol_id: rol.id },
                transaction
            });

            if (usuariosAsignados > 0) {
                resultado = { estado: 'con-usuarios' };
                return;
            }

            // Contar los permisos antes de eliminar el rol.
            const cantidadPermisos = await rol.countPermisos({
                transaction
            });

            // Conservar los datos antes de eliminar el registro.
            resultado = {
                estado: 'eliminado',
                id: rol.id,
                nombre: rol.nombre,
                cantidadPermisos
            };

            await rol.destroy({ transaction });
        });

        if (resultado.estado === 'no-encontrado') {
            const error = new Error('Rol no encontrado.');
            error.status = 404;
            return next(error);
        }

        if (resultado.estado === 'protegido') {
            return res.status(400).send(
                'No se puede eliminar un rol del sistema.'
            );
        }

        if (resultado.estado === 'con-usuarios') {
            return res.status(400).send(
                'No se puede eliminar un rol que tiene usuarios asignados.'
            );
        }

        await registrarAuditoria(
            req,
            'cambio_rol',
            `Se eliminó el rol ${resultado.nombre} con ID ${resultado.id}.`
        );

        // Registrar cambio de permisos únicamente si existían asignaciones.
        if (resultado.cantidadPermisos > 0) {
            await registrarAuditoria(
                req,
                'cambio_permisos',
                `Se eliminaron ${resultado.cantidadPermisos} asignaciones de permisos del rol ${resultado.nombre}.`
            );
        }

        return res.redirect('/roles?mensaje=eliminado');
    } catch (error) {
        console.error('Error al eliminar rol:', error.message);
        error.status = 500;
        return next(error);
    }
});

module.exports = router;
