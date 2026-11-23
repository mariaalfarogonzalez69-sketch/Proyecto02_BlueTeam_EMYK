const express = require("express");
const router = express.Router();

const { Compra, Evento } = require("../models");
const requiereSesion = require("../middleware/requiereSesion");
const requierePermiso = require("../middleware/requierePermiso");
const requiereRol = require("../middleware/requiereRol");
const { parsearId } = require('../utils/validarId');

router.param('id', (req, res, next, valor) => {
  if (parsearId(valor) === null) {
    return res.status(404).send('No encontrado');
  }
  next();   // si es válido, sigue a la ruta normal
});

// Todas las rutas exigen sesión.
// Vender y anular exigen, además, el permiso correspondiente y el rol Taquillero.
// Consultar compras (lista y detalle) exige el permiso crear, sin rol:
// así el SuperAdmin puede consultarlas y el Auditor recibe 403.
// En las rutas /eventos/:id/... el :id es del EVENTO;
// en las rutas /compra/:id/... el :id es de la COMPRA.

// ---------- VENDER (permiso crear + rol Taquillero) ----------

// Formulario de venta: GET /eventos/:id/compra
router.get(
  "/eventos/:id/compra",
  requiereSesion,
  requierePermiso("crear"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    res.render("compras/form", { evento, compra: {}, errores: [] });
  },
);

// Vender entradas: POST /eventos/:id/compra
// TODO: lógica de la venta (validaciones, RN-7.1 a RN-7.3, total calculado
// en el servidor, códigos únicos y cupo, todo en una transacción).
router.post(
  "/eventos/:id/compra",
  requiereSesion,
  requierePermiso("crear"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    res.render("compras/form", { evento, compra: {}, errores: [] });
  },
);

// ---------- CONSULTAR COMPRAS (permiso crear, sin rol) ----------

// Compras de un evento: GET /eventos/:id/compras
// TODO: ordenar por fecha_hora descendente y mostrar datos sensibles parcialmente.
router.get(
  "/eventos/:id/compras",
  requiereSesion,
  requierePermiso("crear"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    const compras = await Compra.findAll({ where: { evento_id: evento.id } });
    res.render("compras/lista", { evento, compras });
  },
);

// Ver detalle de compra: GET /compra/:id
// TODO: incluir comprador y entradas (códigos parciales).
router.get(
  "/compra/:id",
  requiereSesion,
  requierePermiso("crear"),
  async (req, res) => {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) return res.status(404).send("Compra no encontrada");
    res.render("compras/detalle", { compra });
  },
);

// ---------- ANULAR (permiso editar + rol Taquillero) ----------

// Anular compra: POST /compra/:id/anular
// TODO: lógica de anulación (solo compras activas, devolver el cupo una sola
// vez y dejar sin validez las entradas, todo en una transacción).
router.post(
  "/compra/:id/anular",
  requiereSesion,
  requierePermiso("editar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) return res.status(404).send("Compra no encontrada");
    res.render("compras/detalle", { compra });
  },
);

module.exports = router;
