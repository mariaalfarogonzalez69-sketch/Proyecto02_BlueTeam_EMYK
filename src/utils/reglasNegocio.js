//RN-7.2: Máximo 6 entradas por compra
function mensajeEntradas(valor) {
  if (typeof valor !== "string" || !/^(0|[1-9]\d*)$/.test(valor)) {
    return "Las entradas a comprar deben ser un número entero";
  }
  const n = Number(valor);
  if (n < 1 || n > 6) return "Las entradas a comprar deben ser entre 1 y 6";
  return null;
}

//RN-7.1: No se venden entradas de eventos pasados.

//RN-7.3: Cada entrada tiene un código único.

module.exports = { mensajeEntradas }