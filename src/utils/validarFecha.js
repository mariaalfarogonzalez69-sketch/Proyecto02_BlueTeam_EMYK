const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

function mensajeFechaEvento(valor, ahora = new Date()) {
  if (typeof valor !== "string" || !FORMATO_FECHA.test(valor)) {
    return "La fecha no es válida";
  }
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    return "La fecha no es válida";
  }
  if (fecha.getTime() <= ahora.getTime()) {
    return "La fecha del evento debe ser futura";
  }
  return null;
}

module.exports = { mensajeFechaEvento, FORMATO_FECHA };