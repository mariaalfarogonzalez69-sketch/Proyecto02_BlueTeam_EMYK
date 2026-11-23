// VERSIÓN DE MENTIRA (Fase 0): deja pasar todo.
// La real (usuarios-roles) responde 403 si req.usuario.rol no está en la lista.
// Uso: router.post('/ruta', requierePermiso('crear'), requiereRol('Taquillero'), handler)
module.exports = function requiereRol(...roles) {
  return (req, res, next) => next();
};