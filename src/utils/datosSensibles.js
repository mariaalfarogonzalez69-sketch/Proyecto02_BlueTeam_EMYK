// Funciones para mostrar datos sensibles de forma parcial (no revelan el dato completo).
// Son puras: reciben un texto y devuelven otro texto. No tocan la base de datos.

// "ABCDEFGHJKLMNPQR" -> "************NPQR" (solo se ven los últimos 4 caracteres)
function codigoParcial(codigo) {
  const texto = String(codigo ?? "");
  if (texto.length <= 4) return "****";
  return "*".repeat(texto.length - 4) + texto.slice(-4);
}

// "ana.test@example.com" -> "a***@example.com" (primera letra y dominio)
function correoParcial(correo) {
  const texto = String(correo ?? "");
  const arroba = texto.indexOf("@");
  if (arroba < 1) return "***";
  return texto[0] + "***" + texto.slice(arroba);
}

module.exports = { codigoParcial, correoParcial };
