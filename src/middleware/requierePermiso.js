// Encargada: Katlyn Fernández Ramos

const { registrarAuditoria } = require('../utils/auditoria');

module.exports = function requierePermiso(permiso) {
    return async (req, res, next) => {
        const usuario = req.usuario;

        const tienePermiso =
            usuario &&
            Array.isArray(usuario.permisos) &&
            usuario.permisos.includes(permiso);

        if (!tienePermiso) {
            try {
                await registrarAuditoria(
                    req,
                    'acceso_403',
                    `Permiso requerido: ${permiso}`
                );
            } catch (error) {
                console.error('No se pudo registrar el acceso denegado.');
            }

            return res.status(403).render('errores/403', {
                mensaje: 'No tiene autorización para realizar esta operación.'
            });
        }

        return next();
    };
};
