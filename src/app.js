// Punto de entrada de la aplicación.
require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const sequelize = require('./config/db');
const usuarioSimulado = require('./middleware/usuarioSimulado');

const app = express();
// --- Encabezados de seguridad (UTN-08) ---
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  frameguard: { action: 'deny' },
  hsts: process.env.USE_HTTPS === 'true'
    ? { maxAge: 15552000 }
    : false
}));
app.use(usuarioSimulado); // TEMPORAL: se quita cuando exista el login real

// EJS escapa automáticamente lo que se muestra con <%= %> (prevención de XSS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: false })); // lee formularios
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Rutas (cada persona agrega SOLO su línea aquí) ---
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  // La app arranca aunque la BD no esté lista, para no bloquear a nadie.
  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada');
  } catch (err) {
    console.warn('No se pudo conectar a la BD:', err.message);
  }
});