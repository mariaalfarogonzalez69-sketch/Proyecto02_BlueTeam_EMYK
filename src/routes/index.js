// Rutas principales. Cada persona registra sus propias rutas
// en src/app.js con UNA línea, en un commit aparte.
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { titulo: 'Proyecto02 BlueTeam EMYK' });
});

module.exports = router;