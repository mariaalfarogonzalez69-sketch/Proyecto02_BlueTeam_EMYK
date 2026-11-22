// TEMPORAL (Fase 0): usuario con rol fijo para trabajar sin login real.
// La rama auth-sesion-auditoria lo reemplaza por el usuario de la sesión.
// Acuerdo del equipo: todas leen al usuario actual desde req.usuario.
const PERMISOS_POR_ROL = {
  SuperAdmin: ['crear', 'editar', 'borrar', 'ver_reportes'],
  Auditor: ['ver_reportes'],
  Taquillero: ['crear', 'editar', 'borrar'],
};

module.exports = function usuarioSimulado(req, res, next) {
  // El rol se puede cambiar en el .env para probar pantallas de cada rol
  const rol = process.env.USUARIO_SIMULADO_ROL || 'SuperAdmin';
  req.usuario = {
    id: 1,
    username: rol.toLowerCase(),
    rol,
    permisos: PERMISOS_POR_ROL[rol] || [],
  };
  res.locals.usuario = req.usuario; // disponible en las vistas EJS
  next();
};