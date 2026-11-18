// Imprime los hashes bcrypt de los usuarios de prueba para pegarlos en seed.sql.
// Uso: node database/generar_hashes.js
const { hashPassword } = require('../src/utils/password');

// Contraseñas SOLO de prueba (van documentadas en el README)
const usuarios = {
  superadmin: 'Super#2026',
  auditor: 'Audit#2026',
  taquillero: 'Taqui#2026',
};

(async () => {
  for (const [user, clave] of Object.entries(usuarios)) {
    console.log(`${user}: ${await hashPassword(clave)}`);
  }
})();