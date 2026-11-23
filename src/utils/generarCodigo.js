const crypto = require("crypto");

//Para el alfabeto NO se usan caracteres como 0, O, 1 ni I.
//32 símbolos en total.
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generarCodigoEntrada() {
  let codigo = "";
  for (let i = 0; i < 16; i++) {
    codigo += ALFABETO[crypto.randomInt(ALFABETO.length)];
  }
  return codigo;
}

module.exports = { generarCodigoEntrada };