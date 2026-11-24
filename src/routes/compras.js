const express = require("express");
const router = express.Router();
const sequelize = require("../config/db");

const { Compra, Evento, Comprador, Entrada } = require("../models");
const requiereSesion = require("../middleware/requiereSesion");
const requierePermiso = require("../middleware/requierePermiso");
const requiereRol = require("../middleware/requiereRol");
const { parsearId } = require("../utils/validarId");
const { generarCodigoEntrada } = require("../utils/generarCodigo");
const {
  mensajeEntradas,
  mensajeEventoVigente,
  mensajeEventoPublicado,
} = require("../utils/reglasNegocio");
const { codigoParcial, correoParcial } = require("../utils/datosSensibles");
const ErrorNegocio = require("../utils/ErrorNegocio");

router.param("id", (req, res, next, valor) => {
  if (parsearId(valor) === null) {
    return res.status(404).send("No encontrado");
  }
  next(); // si es válido, sigue a la ruta normal
});

// Todas las rutas exigen sesión.
// Vender y anular exigen, además, el permiso correspondiente y el rol Taquillero.
// Consultar compras (lista y detalle) exige el permiso crear, sin rol:
// así el SuperAdmin puede consultarlas y el Auditor recibe 403.
// En las rutas /eventos/:id/... el :id es del EVENTO;
// en las rutas /compra/:id/... el :id es de la COMPRA.

// ---------- Funciones de apoyo ----------

// Motivo por el que un evento NO admite ventas (o null si sí las admite).
// Mismo orden que dentro de la venta: vigente, publicado, cupo.
// OJO: esto solo sirve para avisar al usuario antes de mostrar el formulario.
// La protección real es la que se repite dentro de la transacción del POST.
function motivoNoDisponible(evento) {
  const disponibles = evento.capacidad - evento.entradas_vendidas;
  return (
    mensajeEventoVigente(evento.fecha) ||
    mensajeEventoPublicado(evento.publicado) ||
    (disponibles <= 0 ? "No quedan entradas disponibles" : null)
  );
}

// Los códigos completos solo se muestran justo después de la venta, y solo a
// quien la hizo, para que se los entregue al comprador. Pasado ese minuto
// (o para cualquier otra persona) solo se ven los últimos 4 caracteres.
const VENTANA_ENTREGA_MS = 60 * 1000;
function esEntregaReciente(req, compra) {
  return (
    req.query.recien === "1" &&
    Number(compra.vendida_por) === Number(req.usuario.id) &&
    Date.now() - compra.fecha_hora.getTime() <= VENTANA_ENTREGA_MS
  );
}

// Arma los datos que necesita la vista de detalle. Se entregan como objetos
// simples con solo lo necesario: así la vista no puede mostrar por accidente
// un dato que no debe. Devuelve null si la compra no existe.
async function cargarDetalle(req, id) {
  const compra = await Compra.findByPk(id, {
    include: [
      { model: Comprador, attributes: ["nombre", "correo", "telefono"] },
      { model: Entrada, attributes: ["id", "codigo", "usada"] },
    ],
    order: [[Entrada, "id", "ASC"]],
  });
  if (!compra) return null;

  const mostrarCodigos = esEntregaReciente(req, compra);
  return {
    compra: {
      id: compra.id,
      evento_id: compra.evento_id,
      fecha_hora: compra.fecha_hora,
      cantidad: compra.cantidad,
      total: compra.total,
      estado: compra.estado,
    },
    comprador: {
      nombre: compra.Comprador.nombre,
      correo: compra.Comprador.correo,
      telefono: compra.Comprador.telefono,
    },
    entradas: compra.Entradas.map((e) => ({
      codigo: mostrarCodigos ? e.codigo : codigoParcial(e.codigo),
      usada: e.usada,
    })),
    mostrarCodigos,
  };
}

// ---------- VENDER (permiso crear + rol Taquillero) ----------

// Formulario de venta: GET /eventos/:id/compra
// Si el evento no admite ventas se muestra un aviso en lugar del formulario.
router.get(
  "/eventos/:id/compra",
  requiereSesion,
  requierePermiso("crear"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");

    const noDisponible = motivoNoDisponible(evento);
    res.status(noDisponible ? 409 : 200).render("compras/form", {
      evento,
      compra: {},
      errores: [],
      noDisponible,
    });
  },
);

// Vender entradas: POST /eventos/:id/compra
// Reglas: RN-7.1 (evento no pasado), RN-7.2 (cantidad 1 a 6) y RN-7.3
// (código único: lo garantiza el UNIQUE de entradas.codigo en la base).
// Todo lo que modifica datos va en UNA transacción: o se guarda todo
// (comprador, compra, entradas y cupo) o no se guarda nada.
router.post(
  "/eventos/:id/compra",
  requiereSesion,
  requierePermiso("crear"),
  requiereRol("Taquillero"),
  async (req, res) => {
    try {
      // 1) Validar el formato de la cantidad. No toca la base de datos,
      //    así que va ANTES de abrir la transacción.
      const errorCantidad = mensajeEntradas(req.body.cantidad);
      if (errorCantidad) throw new ErrorNegocio(errorCantidad);
      const cantidad = Number(req.body.cantidad);

      // 2) Transacción: si algo lanza un error aquí adentro, se deshace todo
      const compra = await sequelize.transaction(async (t) => {
        // Se bloquea la fila del evento hasta terminar la transacción: si dos
        // taquilleros venden a la vez, el segundo espera y ve el cupo ya actualizado.
        const evento = await Evento.findByPk(req.params.id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (!evento) throw new ErrorNegocio("Evento no encontrado");

        // La fecha del evento se compara en el servidor
        const errorEvento = mensajeEventoVigente(evento.fecha);
        if (errorEvento) throw new ErrorNegocio(errorEvento);

        // Se verifica si el evento está publicado. Sino, no permite la venta.
        const errorPublicado = mensajeEventoPublicado(evento.publicado);
        if (errorPublicado) throw new ErrorNegocio(errorPublicado);

        // Cupo disponible (ya con el bloqueo, el dato es confiable)
        const disponibles = evento.capacidad - evento.entradas_vendidas;
        if (cantidad > disponibles) {
          throw new ErrorNegocio(
            `No hay suficientes entradas disponibles (quedan ${disponibles})`,
          );
        }

        // Operación 1: comprador. Los campos se eligen uno por uno.
        const comprador = await Comprador.create(
          {
            nombre: req.body.nombre,
            correo: req.body.correo,
            telefono: req.body.telefono,
          },
          { transaction: t },
        );

        // El total lo calcula el servidor, nunca viene del formulario.
        // Se hace en centavos (enteros) porque los decimales de JavaScript
        // son binarios: "10.10" * 3 daría 30.299999999999997.
        const centavos = Math.round(Number(evento.precio) * 100) * cantidad;
        const total = (centavos / 100).toFixed(2);

        // Operación 2: compra. vendida_por sale de la sesión, no del formulario.
        const nuevaCompra = await Compra.create(
          {
            evento_id: evento.id,
            comprador_id: comprador.id,
            cantidad,
            total,
            estado: "activa",
            vendida_por: req.usuario.id,
          },
          { transaction: t },
        );

        // Operación 3: una entrada por cada unidad, con código aleatorio seguro.
        // Si dos códigos coincidieran (casi imposible: 2^80 posibilidades),
        // el UNIQUE de la base lo rechaza y la transacción se deshace completa.
        const entradas = [];
        for (let i = 0; i < cantidad; i++) {
          entradas.push({
            compra_id: nuevaCompra.id,
            codigo: generarCodigoEntrada(),
          });
        }
        await Entrada.bulkCreate(entradas, { transaction: t, validate: true });

        // Operación 4: actualizar el cupo del evento
        evento.entradas_vendidas += cantidad;
        await evento.save({ transaction: t });

        return nuevaCompra;
      });

      // 3) Todo salió bien con recien=1: ver el detalle de la compra
      //    muestran los códigos completos durante un minuto (ver esEntregaReciente).
      return res.redirect(`/compra/${compra.id}?recien=1`);
    } catch (err) {
      // Errores esperados: se explican al usuario y se vuelve a mostrar el formulario
      if (
        err instanceof ErrorNegocio ||
        err.name === "SequelizeValidationError"
      ) {
        const evento = await Evento.findByPk(req.params.id);
        if (!evento) return res.status(404).send("Evento no encontrado");
        const errores =
          err instanceof ErrorNegocio
            ? [err.message]
            : err.errors.map((e) => e.message);
        return res
          .status(400)
          .render("compras/form", { evento, compra: req.body, errores });
      }
      throw err; // lo inesperado va al manejador global de errores
    }
  },
);

// ---------- CONSULTAR COMPRAS (permiso crear, sin rol) ----------

// Compras de un evento: GET /eventos/:id/compras
// Las más recientes primero. El correo del comprador se muestra parcial.
router.get(
  "/eventos/:id/compras",
  requiereSesion,
  requierePermiso("crear"),
  async (req, res) => {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).send("Evento no encontrado");

    const filas = await Compra.findAll({
      where: { evento_id: evento.id },
      include: [{ model: Comprador, attributes: ["nombre", "correo"] }],
      order: [["fecha_hora", "DESC"]],
    });

    const compras = filas.map((c) => ({
      id: c.id,
      fecha_hora: c.fecha_hora,
      cantidad: c.cantidad,
      total: c.total,
      estado: c.estado,
      comprador: c.Comprador.nombre,
      correo: correoParcial(c.Comprador.correo),
    }));

    res.render("compras/lista", { evento, compras });
  },
);

// Ver detalle de compra: GET /compra/:id
// Comprador completo; códigos de entrada parciales (salvo en la entrega reciente).
router.get(
  "/compra/:id",
  requiereSesion,
  requierePermiso("crear"),
  async (req, res) => {
    const datos = await cargarDetalle(req, req.params.id);
    if (!datos) return res.status(404).send("Compra no encontrada");
    res.render("compras/detalle", { ...datos, errores: [] });
  },
);

// ---------- ANULAR (permiso editar + rol Taquillero) ----------

// Anular compra: POST /compra/:id/anular
// - Solo se anula una compra ACTIVA, y solo una vez: el UPDATE lleva la
//   condición "estado = activa" y se mira cuántas filas cambió. Si dos personas
//   anulan a la vez, solo una logra el cambio y solo esa devuelve el cupo.
// - Las entradas quedan sin validez porque su compra pasa a "anulada": la tabla
//   entradas no tiene estado propio, así que la validación en la puerta debe
//   comprobar que compras.estado sea "activa".
// - Todo va en una transacción. Se bloquea primero el evento, igual que en la
//   venta, para que las dos operaciones siempre tomen los bloqueos en el mismo orden.
router.post(
  "/compra/:id/anular",
  requiereSesion,
  requierePermiso("editar"),
  requiereRol("Taquillero"),
  async (req, res) => {
    const compra = await Compra.findByPk(req.params.id);
    if (!compra) return res.status(404).send("Compra no encontrada");

    try {
      await sequelize.transaction(async (t) => {
        await Evento.findByPk(compra.evento_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        const [filasCambiadas] = await Compra.update(
          { estado: "anulada" },
          { where: { id: compra.id, estado: "activa" }, transaction: t },
        );
        if (filasCambiadas === 0) {
          throw new ErrorNegocio("La compra ya estaba anulada");
        }

        // Devolver el cupo (restar de forma atómica en la base de datos)
        await Evento.decrement("entradas_vendidas", {
          by: compra.cantidad,
          where: { id: compra.evento_id },
          transaction: t,
        });
      });

      return res.redirect(`/compra/${compra.id}`);
    } catch (err) {
      if (err instanceof ErrorNegocio) {
        const datos = await cargarDetalle(req, compra.id);
        return res
          .status(409)
          .render("compras/detalle", { ...datos, errores: [err.message] });
      }
      throw err; // lo inesperado va al manejador global de errores
    }
  },
);

module.exports = router;
