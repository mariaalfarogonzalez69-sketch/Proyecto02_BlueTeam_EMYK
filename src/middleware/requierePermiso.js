// VERSIÓN DE MENTIRA (Fase 0): deja pasar todo.
// La real (usuarios-roles) responde 403 si el rol no tiene el permiso.
// Uso: router.post('/eventos', requierePermiso('crear'), handler)
// Permisos: 'crear' | 'editar' | 'borrar' | 'ver_reportes'
module.exports = function requierePermiso(permiso) {
  return (req, res, next) => next();
};