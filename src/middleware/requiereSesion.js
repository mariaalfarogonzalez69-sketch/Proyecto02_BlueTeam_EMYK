// VERSIÓN DE MENTIRA (Fase 0): deja pasar todo.
// La real (auth-sesion-auditoria) redirige al login si no hay sesión válida.
module.exports = function requiereSesion(req, res, next) {
  next();
};