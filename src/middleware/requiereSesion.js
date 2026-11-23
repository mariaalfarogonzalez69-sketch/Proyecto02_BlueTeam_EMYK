// Exige sesión válida. Si venció o no existe, manda al login con un mensaje.
module.exports = function requiereSesion(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login?motivo=sesion');
};