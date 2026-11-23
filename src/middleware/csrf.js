// Protección CSRF (UTN-07d) con csrf-sync: el token se guarda en la sesión
// del SERVIDOR y debe volver en cada petición que modifica datos.
const { csrfSync } = require('csrf-sync');

const { csrfSynchronisedProtection, generateToken } = csrfSync({
  // El token puede venir en un campo oculto del formulario (_csrf)
  // o en un encabezado (x-csrf-token) si la petición sale de JavaScript.
  getTokenFromRequest: (req) =>
    (req.body && req.body._csrf) || req.headers['x-csrf-token'],
});

// Deja el token disponible en todas las vistas EJS como "csrfToken"
function ponerToken(req, res, next) {
  res.locals.csrfToken = generateToken(req);
  next();
}

// csrfSynchronisedProtection revisa los POST, PUT, PATCH y DELETE.
// Los GET, HEAD y OPTIONS no se revisan: por eso nunca deben modificar datos.
module.exports = { proteccionCsrf: csrfSynchronisedProtection, ponerToken };