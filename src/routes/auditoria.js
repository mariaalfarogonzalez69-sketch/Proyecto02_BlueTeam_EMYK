// Pantalla de consulta de la auditoría (UTN-09): solo para el SuperAdmin.
const express = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const { registrarAuditoria } = require('../utils/auditoria');

const router = express.Router();
const TIPOS = ['login_ok', 'login_fallido', 'cambio_rol', 'cambio_permisos', 'acceso_403'];
const FECHA = /^\d{4}-\d{2}-\d{2}$/; // AAAA-MM-DD

// Revisa el rol directamente. Cuando Katlyn suba la real, se cambia por requiereRol('SuperAdmin').
async function soloSuperAdmin(req, res, next) {
  if (req.usuario && req.usuario.rol === 'SuperAdmin') return next();
  await registrarAuditoria(req, 'acceso_403', 'intento de ver la auditoría sin ser SuperAdmin');
  return res.status(403).send('Acceso denegado.');
}

router.get('/auditoria', soloSuperAdmin, async (req, res, next) => {
  try {
    const tipo = TIPOS.includes(req.query.tipo) ? req.query.tipo : '';
    const desde = FECHA.test(req.query.desde || '') ? req.query.desde : '';
    const hasta = FECHA.test(req.query.hasta || '') ? req.query.hasta : '';

    // Los pedazos de SQL son fijos; los valores del usuario van SIEMPRE como parámetros
    const filtros = [];
    const rep = {};
    if (tipo)  { filtros.push('a.tipo_evento = :tipo'); rep.tipo = tipo; }
    if (desde) { filtros.push('a.fecha_hora >= CAST(:desde AS date)'); rep.desde = desde; }
    if (hasta) { filtros.push("a.fecha_hora < CAST(:hasta AS date) + INTERVAL '1 day'"); rep.hasta = hasta; }
    const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

    const registros = await sequelize.query(
      `SELECT a.id, a.tipo_evento, a.ip, a.ruta, a.detalle, a.fecha_hora,
              COALESCE(u.username, a.username_intentado) AS usuario
         FROM auditoria a LEFT JOIN usuarios u ON u.id = a.usuario_id
         ${where}
        ORDER BY a.fecha_hora DESC
        LIMIT 200`,
      { replacements: rep, type: QueryTypes.SELECT }
    );

    res.render('auditoria', { registros, tipos: TIPOS, filtro: { tipo, desde, hasta } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;