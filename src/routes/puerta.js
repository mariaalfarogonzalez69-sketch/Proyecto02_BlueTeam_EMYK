// RFD-7.5: validación de entradas en la puerta (Persona 4).
// Solo responde "válida", "ya usada" o "no válida": nunca dice quién compró
// ni si el código existe pero pertenece a una compra anulada.
const express = require('express');
const router = express.Router();

const sequelize = require('../config/db');
const { Compra, Entrada } = require('../models');
const requierePermiso = require('../middleware/requierePermiso');
const requiereRol = require('../middleware/requiereRol');

// Formato de los códigos de entrada: letras, números, guion y guion bajo.
const FORMATO_CODIGO = /^[A-Za-z0-9_-]{1,64}$/;

const RESULTADOS = {
  valida:   { estado: 200, texto: 'Entrada válida. Puede ingresar.' },
  ya_usada: { estado: 409, texto: 'Esta entrada ya fue usada.' },
  no_valida:{ estado: 404, texto: 'Entrada no válida.' }
};

// Pantalla de validación.
router.get(
  '/puerta',
  requierePermiso('editar'),
  requiereRol('Taquillero'),
  (req, res) => {
    res.render('puerta/validar', { resultado: null });
  }
);

// Validar un código. El cambio a "usada" se hace en una sola operación
// condicionada (usada = false), así dos lecturas simultáneas no pasan las dos.
router.post(
  '/puerta/validar',
  requierePermiso('editar'),
  requiereRol('Taquillero'),
  async (req, res) => {
    const codigo = typeof req.body.codigo === 'string' ? req.body.codigo.trim() : '';

    let clave = 'no_valida';

    if (FORMATO_CODIGO.test(codigo)) {
      clave = await sequelize.transaction(async (t) => {
        const entrada = await Entrada.findOne({ where: { codigo }, transaction: t });
        if (!entrada) return 'no_valida';

        // Se bloquea la compra para no validar mientras otra persona la anula.
        const compra = await Compra.findByPk(entrada.compra_id, {
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        if (!compra || compra.estado !== 'activa') return 'no_valida';

        const [filas] = await Entrada.update(
          { usada: true, fecha_uso: new Date() },
          { where: { id: entrada.id, usada: false }, transaction: t }
        );
        return filas === 1 ? 'valida' : 'ya_usada';
      });
    }

    const r = RESULTADOS[clave];
    // El código escrito NO se devuelve a la vista ni se guarda en registros.
    res.status(r.estado).render('puerta/validar', {
      resultado: { clave, texto: r.texto }
    });
  }
);

module.exports = router;