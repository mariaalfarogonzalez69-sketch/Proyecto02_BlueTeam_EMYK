// Auditoría REAL (UTN-09): guarda el evento en la tabla "auditoria".
// Firma acordada con el equipo: registrarAuditoria(req, tipo, detalle)
// El 4.º parámetro es opcional y solo lo usa el login fallido.
const sequelize = require('../config/db');

const TIPOS = ['login_ok', 'login_fallido', 'cambio_rol', 'cambio_permisos', 'acceso_403'];

async function registrarAuditoria(req, tipo, detalle = '', extra = {}) {
  try {
    if (!TIPOS.includes(tipo)) throw new Error(`tipo de evento no válido: ${tipo}`);

    // En el login_ok el usuario recién quedó en la sesión nueva, no en req.usuario
    const usuario = (req.session && req.session.usuario) || req.usuario || null;

    await sequelize.query(
      `INSERT INTO auditoria (tipo_evento, usuario_id, username_intentado, ip, ruta, detalle)
       VALUES (:tipo, :usuarioId, :username, :ip, :ruta, :detalle)`,
      {
        replacements: {
          tipo,
          usuarioId: usuario ? usuario.id : null,
          username: extra.usernameIntentado ? String(extra.usernameIntentado).slice(0, 50) : null,
          ip: String(req.ip || '').slice(0, 45),
          // Sin el query string: ahí podrían viajar datos que no deben quedar guardados
          ruta: String(req.originalUrl || '').split('?')[0].slice(0, 200),
          // NUNCA pasar contraseñas, tokens ni códigos de entrada aquí
          detalle: String(detalle).slice(0, 500),
        },
      }
    );
  } catch (err) {
    // Un fallo de auditoría no debe tumbar la petición del usuario
    console.error('No se pudo registrar la auditoría:', err.message);
  }
}

module.exports = { registrarAuditoria };