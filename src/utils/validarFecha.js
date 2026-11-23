const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

// Costa Rica no tiene horario de verano: siempre es UTC-6.
// Así la fecha escrita en el formulario significa lo mismo sin importar
// en qué zona horaria corra el servidor.
const DESFASE_CR = "-06:00";

// Convierte el texto del formulario (hora de Costa Rica) en una fecha real.
// Devuelve null si el formato no es válido.
function aFechaCR(valor) {
  if (typeof valor !== "string" || !FORMATO_FECHA.test(valor)) return null;
  const conSegundos = valor.length === 16 ? valor + ":00" : valor;
  const fecha = new Date(conSegundos + DESFASE_CR);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function mensajeFechaEvento(valor, ahora = new Date()) {
  const fecha = aFechaCR(valor);
  if (!fecha) return "La fecha no es válida";
  if (fecha.getTime() <= ahora.getTime()) {
    return "La fecha del evento debe ser futura";
  }
  return null;
}

module.exports = { mensajeFechaEvento, aFechaCR, FORMATO_FECHA };
