// Encargada: Katlyn Fernández Ramos

const { registrarAuditoria } = require('../utils/auditoria');

module.exports = function requiereRol(...roles) {
    return async (req, res, next) => {
        const usuario = req.usuario;

        const tieneRol =
            usuario &&
            typeof usuario.rol === 'string' &&
            roles.includes(usuario.rol);

        if (!tieneRol) {
            try {
                await registrarAuditoria(
                    req,
                    'acceso_403',
                    `Rol requerido: ${roles.join(', ')}`
                );
            } catch (error) {
                console.error('No se pudo registrar el acceso denegado.');
            }

            return res.status(403).render('errores/403');
        }

        return next();
    };
};
