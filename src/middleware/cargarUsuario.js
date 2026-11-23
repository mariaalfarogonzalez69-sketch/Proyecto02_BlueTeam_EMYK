// Pone al usuario de la sesión en req.usuario (acuerdo del equipo).
// En la sesión del SERVIDOR están el rol y los permisos; la cookie solo lleva el id.
module.exports = function cargarUsuario(req, res, next) {
  req.usuario = (req.session && req.session.usuario) || null;
  res.locals.usuario = req.usuario; // disponible en las vistas EJS
  next();
};