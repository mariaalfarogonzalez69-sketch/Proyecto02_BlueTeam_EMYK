// Funciones de contraseña (UTN-02). Las usa también la Persona 2 (usuarios).
const bcrypt = require('bcrypt');

const COSTO = 12; // costo mínimo exigido por el enunciado

// Devuelve el hash (incluye la sal automáticamente)
async function hashPassword(plano) {
  return bcrypt.hash(plano, COSTO);
}

// Compara una contraseña escrita con el hash guardado en la BD
async function verificarPassword(plano, hash) {
  return bcrypt.compare(plano, hash);
}

module.exports = { hashPassword, verificarPassword };