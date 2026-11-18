// Rutas principales. Cada persona registra sus propias rutas
// en src/app.js con UNA línea, en un commit aparte.
const express = require('express');
const router = express.Router();

const requiereSesion = require('../middleware/requiereSesion');
const requierePermiso = require('../middleware/requierePermiso');
const { registrarAuditoria } = require('../utils/auditoria');

// EJEMPLO de uso de las funciones acordadas (se puede borrar después)
router.get('/ejemplo', requiereSesion, requierePermiso('ver_reportes'), async (req, res) => {
  await registrarAuditoria(req, 'login_ok', 'ejemplo de uso');
  res.json({ usuario: req.usuario });
});

router.get('/', (req, res) => {
  res.render('index', { titulo: 'Proyecto02 BlueTeam EMYK' });
});

module.exports = router;