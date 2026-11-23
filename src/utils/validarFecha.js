// Captura: año, mes, día, hora, minuto y (opcional) segundos.
const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

// Costa Rica no tiene horario de verano: siempre es UTC-6.
// Así la fecha escrita en el formulario significa lo mismo sin importar
// en qué zona horaria corra el servidor.
const DESFASE_CR = "-06:00";

// ¿Existe esa fecha en el calendario? JavaScript "arregla" fechas imposibles
// (30 de febrero pasa a ser 2 de marzo), por eso se revisa a mano.
function existeEnCalendario(anio, mes, dia, hora, minuto, segundo) {
  if (mes < 1 || mes > 12) return false;
  const diasDelMes = new Date(Date.UTC(anio, mes, 0)).getUTCDate(); // día 0 del mes siguiente = último día de este mes
  if (dia < 1 || dia > diasDelMes) return false;
  return hora <= 23 && minuto <= 59 && segundo <= 59;
}

// Convierte el texto del formulario (hora de Costa Rica) en una fecha real.
// Devuelve null si el formato no es válido o la fecha no existe.
function aFechaCR(valor) {
  if (typeof valor !== "string") return null;
  const m = FORMATO_FECHA.exec(valor);
  if (!m) return null;

  const [anio, mes, dia, hora, minuto] = m.slice(1, 6).map(Number);
  const segundo = m[6] === undefined ? 0 : Number(m[6]);
  if (!existeEnCalendario(anio, mes, dia, hora, minuto, segundo)) return null;

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
