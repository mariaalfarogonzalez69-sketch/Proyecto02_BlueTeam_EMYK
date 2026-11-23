const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();

const { Evento } = require("../models");
const requiereSesion = require("../middleware/requiereSesion");
const requierePermiso = require("../middleware/requierePermiso");
const requiereRol = require("../middleware/requiereRol");
const { parsearId } = require("../utils/validarId");
const { mensajeFechaEvento } = require("../utils/validarFecha");

router.param("id", (req, res, next, valor) => {
  if (parsearId(valor) === null) {
    return res.status(404).send("No encontrado");
  }
  next(); // si es válido, sigue a la ruta normal
});

// Todas las rutas exigen sesión.
// Las que muestran un formulario de escritura o modifican datos exigen,
// además, el permiso correspondiente y el rol Taquillero.
// OJO: /eventos/nuevo va ANTES de /eventos/:id; si no, Express tomaría
// la palabra "nuevo" como si fuera un id.

// ---------- LISTAR (solo sesión) ----------

// Listar: GET /eventos
// Buscar: GET /eventos?q=evento
router.get("/eventos", requiereSesion, async (req, res) => {
  // q debe ser un texto. Con ?q=a&q=b llega un arreglo y .trim() fallaría,
  // así que cualquier cosa que no sea texto se trata como búsqueda vacía.
  // El largo máximo (120) es el mismo del nombre del evento.
  const q =
    typeof req.query.q === "string" ? req.query.q.trim().slice(0, 120) : "";
  // % y _ son comodines de LIKE: se escapan (con \) para buscarlos como texto normal
  const patron = q.replace(/[\\%_]/g, "\\$&");
  const where = q ? { nombre: { [Op.iLike]: `%${patron}%` } } : {}; // Sequelize lo manda como parámetro
  const eventos = await Evento.findAll({ where, order: [["fecha", "ASC"]] });
  res.render("eventos/lista", { eventos, q });
});

// ---------- CREAR (permiso crear + rol Taquillero) ----------

// Formulario de crear: GET /eventos/nuevo
router.get(
  "/eventos/nuevo",
  requiereSesion,
  requierePermiso("crear"),
  requiereRol("Taquillero"),
  (req, res) => {
    res.render("eventos/form", { evento: null, errores: [] });
  },
);

// Guardar nuevo evento: POST /eventos
router.post(
  "/eventos",
  requiereSesion,
  requierePermiso("crear"),
  requiereRol("Taquillero"),
  async (req, res) => {
    // Regla: al crear, la fecha debe ser válida y futura
    const errorFecha = mensajeFechaEvento(req.body.fecha);
    if (errorFecha) {
      return res
        .status(400)
        .render("eventos/form", { evento: req.body, errores: [errorFecha] });
    }

    try {
      // Se eligen los campos uno por uno: nunca se pasa req.body completo
      await Evento.create({
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        lugar: req.body.lugar,
        fecha: req.body.fecha,
        capacidad: req.body.capacidad,
        precio: req.body.precio,
      });
      res.redirect("/eventos");
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).render("eventos/form", {
          evento: req.body,
          errores: ["Ya existe un evento con ese código"],
        });
      }
      if (err.name === "SequelizeValidationError") {
        return res.status(400).render("eventos/form", {
          evento: req.body,
          errores: err.errors.map((e) => e.message),
        });
      }
      throw err;
    }
  },
);

// ---------- VER DETALLE (solo sesión) ----------

// Ver detalle: GET /eventos/:id
router.get("/eventos/:id", requiereSesion, async (req, res) => {
  const evento = await Evento.findByPk(req.params.id);
  if (!evento) return res.status(404).send("Evento no encontrado");
  res.render("eventos/detalle", { evento });
});

// ---------- EDITAR (permiso editar + rol Taquillero) ----------

// Formulario de editar: GET /eventos/:id/editar
router.get(
  "/eventos/:id/editar",
  requiereSesion,
  requierePermiso("editar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    res.render("eventos/form", { evento, errores: [] });
  },
);

// Guardar cambios: POST /eventos/:id/editar
router.post(
  "/eventos/:id/editar",
  requiereSesion,
  requierePermiso("editar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    
    // La regla "fecha futura" solo se exige si la fecha CAMBIÓ: así un evento
    // que ya pasó se puede editar sin tocar su fecha.
    // Se tolera menos de 1 minuto de diferencia porque el campo del
    // formulario no trae los segundos.
    const nueva = new Date(req.body.fecha);
    const fechaCambio =
      typeof req.body.fecha !== "string" ||
      Number.isNaN(nueva.getTime()) ||
      Math.abs(nueva - evento.fecha) >= 60000;
    if (fechaCambio) {
      const errorFecha = mensajeFechaEvento(req.body.fecha);
      if (errorFecha) {
        return res.status(400).render("eventos/form", {
          evento: { ...req.body, id: evento.id },
          errores: [errorFecha],
        });
      }
    }

    try {
      evento.codigo = req.body.codigo;
      evento.nombre = req.body.nombre;
      evento.lugar = req.body.lugar;
      evento.fecha = req.body.fecha;
      evento.capacidad = req.body.capacidad;
      evento.precio = req.body.precio;
      await evento.save();
      res.redirect(`/eventos/${evento.id}`);
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).render("eventos/form", {
          evento: { ...req.body, id: evento.id },
          errores: ["Ya existe un evento con ese código"],
        });
      }
      if (err.name === "SequelizeValidationError") {
        return res.status(400).render("eventos/form", {
          evento: { ...req.body, id: evento.id },
          errores: err.errors.map((e) => e.message),
        });
      }
      throw err;
    }
  },
);

// ---------- ELIMINAR (permiso borrar + rol Taquillero) ----------

// Confirmar eliminar: GET /eventos/:id/eliminar
router.get(
  "/eventos/:id/eliminar",
  requiereSesion,
  requierePermiso("borrar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    res.render("eventos/eliminar", { evento, error: null });
  },
);

// Eliminar: POST /eventos/:id/eliminar
router.post(
  "/eventos/:id/eliminar",
  requiereSesion,
  requierePermiso("borrar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");

    try {
      await evento.destroy();
      res.redirect("/eventos");
    } catch (err) {
      if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).render("eventos/eliminar", {
          evento,
          error: "No se puede eliminar: el evento tiene compras registradas",
        });
      }
      throw err;
    }
  },
);

// ---------- PUBLICAR (permiso editar + rol Taquillero) ----------

// Publicar: POST /eventos/:id/publicar
router.post(
  "/eventos/:id/publicar",
  requiereSesion,
  requierePermiso("editar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");
    evento.publicado = true;
    await evento.save();
    res.redirect(`/eventos/${evento.id}`);
  },
);

module.exports = router;
