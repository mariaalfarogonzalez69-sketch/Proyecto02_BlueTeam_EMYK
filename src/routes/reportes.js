
const express = require('express');
const router = express.Router();

const { Compra, Evento } = require('../models');
const requierePermiso = require('../middleware/requierePermiso');

// Reporte general de ventas.
// Solo pueden acceder los usuarios con el permiso ver_reportes.
router.get(
  '/reportes/ventas',
  requierePermiso('ver_reportes'),
  async (req, res) => {
    // Obtener todos los eventos.
    const eventos = await Evento.findAll({
      attributes: ['id', 'nombre'],
      order: [['nombre', 'ASC']]
    });

    // Obtener las compras activas.
    const compras = await Compra.findAll({
      where: { estado: 'activa' },
      attributes: ['evento_id', 'cantidad', 'total']
    });

    // Agrupar las ventas por evento.
    const reportes = eventos.map(evento => {
      const comprasEvento = compras.filter(
        compra => Number(compra.evento_id) === Number(evento.id)
      );

      const cantidadCompras = comprasEvento.length;

      const entradas = comprasEvento.reduce(
        (suma, compra) => suma + Number(compra.cantidad),
        0
      );

      const recaudacion = comprasEvento.reduce(
        (suma, compra) => suma + Math.round(Number(compra.total) * 100),
        0
      ) / 100;

      return {
        evento: evento.nombre,
        compras: cantidadCompras,
        entradas,
        recaudacion: recaudacion.toFixed(2)
      };
    });

    // Calcular los totales generales.
    const totales = {
      compras: reportes.reduce(
        (suma, reporte) => suma + reporte.compras,
        0
      ),
      entradas: reportes.reduce(
        (suma, reporte) => suma + reporte.entradas,
        0
      ),
      recaudacion: reportes.reduce(
        (suma, reporte) => suma + Number(reporte.recaudacion),
        0
      ).toFixed(2)
    };

    res.render('reportes/ventas', {
      reportes,
      totales
    });
  }
);

module.exports = router;
