
const express = require('express');
const router = express.Router();

const sequelize = require('../config/db');
const { Usuario, Rol, Permiso } = require('../models/asociacionesUsuariosRoles');
const { hashPassword } = require('../utils/password');
const requiereSesion = require('../middleware/requiereSesion');
const requiereRol = require('../middleware/requiereRol');
const { registrarAuditoria } = require('../utils/auditoria');

function limpiar(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

function idValido(id) {
    return /^\d+$/.test(String(id)) && Number(id) > 0;
}

function datosUsuarioValidos({ username, correo, nombre, identificacion }) {
    return (
        username.length >= 1 && username.length <= 50 &&
        correo.length <= 120 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) &&
        nombre.length >= 1 && nombre.length <= 100 &&
        identificacion.length >= 1 && identificacion.length <= 30
    );
}

function errorInterno(res) {
    return res.status(500).send('Ocurrió un error interno. Intente nuevamente.');
}

// Consultar usuarios: SuperAdmin, Auditor y Taquillero.
router.get(
    '/usuarios',
    requiereSesion,
    requiereRol('SuperAdmin', 'Auditor', 'Taquillero'),
    async (req, res) => {
        try {
            const usuarios = await Usuario.findAll({
                attributes: { exclude: ['password_hash'] },
                include: [{
                    model: Rol,
                    as: 'Rol',
                    attributes: ['id', 'nombre'],
                    include: [{
                        model: Permiso,
                        as: 'Permisos',
                        attributes: ['nombre'],
                        through: { attributes: [] }
                    }]
                }],
                order: [['id', 'ASC']]
            });

            return res.render('usuarios/index', {
                titulo: 'Usuarios',
                usuarios,
                mensaje: limpiar(req.query.mensaje),
                esSuperAdmin: req.usuario?.rol === 'SuperAdmin'
            });
        } catch (error) {
            console.error('Error al consultar usuarios:', error.message);
            return errorInterno(res);
        }
    }
);

// Formulario de creación: solo SuperAdmin.
router.get(
    '/usuarios/nuevo',
    requiereSesion,
    requiereRol('SuperAdmin'),
    async (req, res) => {
        try {
            const roles = await Rol.findAll({
                order: [['nombre', 'ASC']]
            });

            return res.render('usuarios/nuevo', {
                titulo: 'Crear usuario',
                roles,
                datos: {},
                error: null
            });
        } catch (error) {
            console.error('Error al cargar formulario:', error.message);
            return errorInterno(res);
        }
    }
);

// Crear usuario: solo SuperAdmin.
router.post(
    '/usuarios',
    requiereSesion,
    requiereRol('SuperAdmin'),
    async (req, res) => {
        const username = limpiar(req.body.username);
        const correo = limpiar(req.body.correo).toLowerCase();
        const nombre = limpiar(req.body.nombre);
        const identificacion = limpiar(req.body.identificacion);

        const password = typeof req.body.password === 'string'
            ? req.body.password
            : '';

        const rolId = Number(req.body.rol_id);

        const datos = {
            username,
            correo,
            nombre,
            identificacion
        };

        try {
            const roles = await Rol.findAll({
                order: [['nombre', 'ASC']]
            });

            const rol = Number.isInteger(rolId) && rolId > 0
                ? await Rol.findByPk(rolId)
                : null;

            if (
                !datosUsuarioValidos(datos) ||
                password.length < 8 ||
                password.length > 128 ||
                !rol
            ) {
                return res.status(400).render('usuarios/nuevo', {
                    titulo: 'Crear usuario',
                    roles,
                    datos,
                    error: 'Revise los datos. La contraseña debe tener entre 8 y 128 caracteres y debe seleccionar un rol válido.'
                });
            }

            const hash = await hashPassword(password);

            await Usuario.create({
                username,
                correo,
                nombre,
                identificacion,
                password_hash: hash,
                rol_id: rol.id
            });

            return res.redirect('/usuarios?mensaje=creado');
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const roles = await Rol.findAll({
                    order: [['nombre', 'ASC']]
                });

                return res.status(400).render('usuarios/nuevo', {
                    titulo: 'Crear usuario',
                    roles,
                    datos,
                    error: 'El nombre de usuario, correo o identificación ya está registrado.'
                });
            }

            console.error('Error al crear usuario:', error.message);
            return errorInterno(res);
        }
    }
);

// Formulario de edición: solo SuperAdmin.
router.get(
    '/usuarios/:id/editar',
    requiereSesion,
    requiereRol('SuperAdmin'),
    async (req, res) => {
        if (!idValido(req.params.id)) {
            return res.status(400).send('Identificador de usuario inválido.');
        }

        try {
            const usuario = await Usuario.findByPk(Number(req.params.id), {
                attributes: { exclude: ['password_hash'] }
            });

            if (!usuario) {
                return res.status(404).send('Usuario no encontrado.');
            }

            const roles = await Rol.findAll({
                order: [['nombre', 'ASC']]
            });

            return res.render('usuarios/editar', {
                titulo: 'Editar usuario',
                usuario,
                roles,
                error: null
            });
        } catch (error) {
            console.error('Error al cargar usuario:', error.message);
            return errorInterno(res);
        }
    }
);

// Editar username, nombre, identificación, correo, rol y contraseña opcional:
// solo SuperAdmin.
router.post(
    '/usuarios/:id/editar',
    requiereSesion,
    requiereRol('SuperAdmin'),
    async (req, res) => {
        if (!idValido(req.params.id)) {
            return res.status(400).send('Identificador de usuario inválido.');
        }

        const username = limpiar(req.body.username);
        const nombre = limpiar(req.body.nombre);
        const identificacion = limpiar(req.body.identificacion);
        const correo = limpiar(req.body.correo).toLowerCase();

        const password = typeof req.body.password === 'string'
            ? req.body.password
            : '';

        const rolId = Number(req.body.rol_id);

        let transaccion;

        try {
            transaccion = await sequelize.transaction();

            const usuario = await Usuario.findByPk(Number(req.params.id), {
                transaction: transaccion,
                lock: transaccion.LOCK.UPDATE
            });

            if (!usuario) {
                await transaccion.rollback();
                return res.status(404).send('Usuario no encontrado.');
            }

            const roles = await Rol.findAll({
                order: [['nombre', 'ASC']],
                transaction: transaccion
            });

            const rol = Number.isInteger(rolId) && rolId > 0
                ? await Rol.findByPk(rolId, {
                    transaction: transaccion
                })
                : null;

            const datosValidos =
                username.length >= 1 &&
                username.length <= 50 &&
                nombre.length >= 1 &&
                nombre.length <= 100 &&
                identificacion.length >= 1 &&
                identificacion.length <= 30 &&
                correo.length <= 120 &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) &&
                rol &&
                (!password || (password.length >= 8 && password.length <= 128));

            if (!datosValidos) {
                usuario.username = username;
                usuario.nombre = nombre;
                usuario.identificacion = identificacion;
                usuario.correo = correo;

                if (rol) {
                    usuario.rol_id = rol.id;
                }

                await transaccion.rollback();

                return res.status(400).render('usuarios/editar', {
                    titulo: 'Editar usuario',
                    usuario,
                    roles,
                    error: 'Revise los datos. Username (1-50), nombre (1-100), identificación (1-30), correo válido y contraseña opcional (8-128 caracteres).'
                });
            }

            // Bloquear la fila del rol SuperAdmin para proteger
            // la comprobación del último administrador.
            const rolSuperAdmin = await Rol.findOne({
                where: { nombre: 'SuperAdmin' },
                transaction: transaccion,
                lock: transaccion.LOCK.UPDATE
            });

            const estabaEnSuperAdmin =
                rolSuperAdmin &&
                Number(usuario.rol_id) === Number(rolSuperAdmin.id);

            const nuevoRolEsSuperAdmin =
                rolSuperAdmin &&
                Number(rol.id) === Number(rolSuperAdmin.id);

            if (estabaEnSuperAdmin && !nuevoRolEsSuperAdmin) {
                const cantidadSuperAdmin = await Usuario.count({
                    where: { rol_id: rolSuperAdmin.id },
                    transaction: transaccion
                });

                if (cantidadSuperAdmin <= 1) {
                    usuario.username = username;
                    usuario.nombre = nombre;
                    usuario.identificacion = identificacion;
                    usuario.correo = correo;

                    await transaccion.rollback();

                    return res.status(400).render('usuarios/editar', {
                        titulo: 'Editar usuario',
                        usuario,
                        roles,
                        error: 'No se puede cambiar el rol del último SuperAdmin.'
                    });
                }
            }

            const rolAnterior = usuario.rol_id;

            usuario.username = username;
            usuario.nombre = nombre;
            usuario.identificacion = identificacion;
            usuario.correo = correo;
            usuario.rol_id = rol.id;

            if (password) {
                usuario.password_hash = await hashPassword(password);
            }

            await usuario.save({
                transaction: transaccion
            });

            await transaccion.commit();

            if (Number(rolAnterior) !== Number(rol.id)) {
                await registrarAuditoria(
                    req,
                    'cambio_rol',
                    `Se modificó el rol del usuario con ID ${usuario.id}.`
                );
            }

            return res.redirect('/usuarios?mensaje=actualizado');
        } catch (error) {
            if (transaccion && !transaccion.finished) {
                await transaccion.rollback();
            }

            if (error.name === 'SequelizeUniqueConstraintError') {
                try {
                    const usuario = await Usuario.findByPk(Number(req.params.id), {
                        attributes: { exclude: ['password_hash'] }
                    });

                    if (!usuario) {
                        return res.status(404).send('Usuario no encontrado.');
                    }

                    usuario.username = username;
                    usuario.nombre = nombre;
                    usuario.identificacion = identificacion;
                    usuario.correo = correo;

                    if (idValido(rolId)) {
                        usuario.rol_id = rolId;
                    }

                    const roles = await Rol.findAll({
                        order: [['nombre', 'ASC']]
                    });

                    return res.status(400).render('usuarios/editar', {
                        titulo: 'Editar usuario',
                        usuario,
                        roles,
                        error: 'El username, correo o identificación ya está registrado.'
                    });
                } catch (errorCarga) {
                    console.error(
                        'Error al recuperar usuario:',
                        errorCarga.message
                    );
                    return errorInterno(res);
                }
            }

            console.error('Error al editar usuario:', error.message);
            return errorInterno(res);
        }
    }
);

// Eliminar usuario: no permite eliminarse a sí mismo ni al último SuperAdmin.
router.post(
    '/usuarios/:id/eliminar',
    requiereSesion,
    requiereRol('SuperAdmin'),
    async (req, res) => {
        if (!idValido(req.params.id)) {
            return res.status(400).send('Identificador de usuario inválido.');
        }

        let transaccion;

        try {
            transaccion = await sequelize.transaction();

            const usuario = await Usuario.findByPk(Number(req.params.id), {
                transaction: transaccion,
                lock: transaccion.LOCK.UPDATE
            });

            if (!usuario) {
                await transaccion.rollback();
                return res.status(404).send('Usuario no encontrado.');
            }

            if (String(usuario.id) === String(req.usuario.id)) {
                await transaccion.rollback();
                return res.status(400).send('No puede eliminar su propia cuenta.');
            }

            const rolSuperAdmin = await Rol.findOne({
                where: { nombre: 'SuperAdmin' },
                transaction: transaccion,
                lock: transaccion.LOCK.UPDATE
            });

            if (
                rolSuperAdmin &&
                Number(usuario.rol_id) === Number(rolSuperAdmin.id)
            ) {
                const cantidadSuperAdmin = await Usuario.count({
                    where: { rol_id: rolSuperAdmin.id },
                    transaction: transaccion
                });

                if (cantidadSuperAdmin <= 1) {
                    await transaccion.rollback();
                    return res.status(400).send('No se puede eliminar al último SuperAdmin.');
                }
            }

            await usuario.destroy({
                transaction: transaccion
            });

            await transaccion.commit();

            return res.redirect('/usuarios?mensaje=eliminado');
        } catch (error) {
            if (transaccion && !transaccion.finished) {
                await transaccion.rollback();
            }

            console.error('Error al eliminar usuario:', error.message);
            return errorInterno(res);
        }
    }
);

module.exports = router;
