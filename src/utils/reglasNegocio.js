//RN-7.2: Máximo 6 entradas por compra
function mensajeEntradas(valor) {
  if (typeof valor !== "string" || !/^(0|[1-9]\d*)$/.test(valor)) {
    return "Las entradas a comprar deben ser un número entero";
  }
  const n = Number(valor);
  if (n < 1 || n > 6) return "Las entradas a comprar deben ser entre 1 y 6";
  return null;
}

// Regla adicional: solo se venden eventos publicados.
function mensajeEventoPublicado(publicado) {
  if (publicado !== true) {
    return "El evento no está publicado: no se venden entradas";
  }
  return null;
}

//RN-7.1: No se venden entradas de eventos pasados.
function mensajeEventoVigente(fechaEvento, ahora = new Date()) {
  if (!(fechaEvento instanceof Date) || Number.isNaN(fechaEvento.getTime())) {
    return "El evento no tiene una fecha válida";
  }
  if (fechaEvento.getTime() <= ahora.getTime()) {
    return "El evento ya pasó: no se venden entradas";
  }
  return null;
}

//RN-7.3: Cada entrada tiene un código único.
// No es una función: la garantiza el UNIQUE de entradas.codigo en la base de
// datos (y unique: true en el modelo Entrada). Revisar "si ya existe" antes de
// insertar no basta, porque otra venta podría guardar el mismo código entre la
// revisión y el guardado. Si hay colisión, la base rechaza la entrada y la
// transacción de la venta se deshace completa.

module.exports = {
  mensajeEntradas,
  mensajeEventoVigente,
  mensajeEventoPublicado,
};
