// VERSIÓN DE MENTIRA (Fase 0): solo imprime en consola.
// La real (auth-sesion-auditoria) guarda en la tabla auditoria.
// Tipos: 'login_ok' | 'login_fallido' | 'cambio_rol' | 'cambio_permisos' | 'acceso_403'
// NUNCA pasar contraseñas, tokens ni códigos de entrada en "detalle".
async function registrarAuditoria(req, tipo, detalle = '') {
  console.log(`[AUDITORIA simulada] ${tipo} | ${req.method} ${req.originalUrl} | ${detalle}`);
}

module.exports = { registrarAuditoria };