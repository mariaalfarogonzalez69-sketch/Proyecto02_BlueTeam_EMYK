// Punto de entrada de la aplicación.
require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const sequelize = require('./config/db');

const cargarUsuario = require('./middleware/cargarUsuario');
const requiereSesion = require('./middleware/requiereSesion');
const { proteccionCsrf, ponerToken } = require('./middleware/csrf');
const { registrarAuditoria } = require('./utils/auditoria');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Encabezados de seguridad (UTN-08).
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
  noSniff: true,
  hsts: process.env.USE_HTTPS === 'true'
    ? { maxAge: 15552000 }
    : false
}));

// Configuración de EJS.
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middlewares generales.
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Sesión (UTN-07c).
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: Number(process.env.SESSION_TIMEOUT_SECONDS || 60) * 1000
  }
}));

// Carga el usuario autenticado.
app.use(cargarUsuario);

// Protección CSRF.
app.use(proteccionCsrf);
app.use(ponerToken);

// Rutas públicas de autenticación.
app.use('/', require('./routes/auth'));

// Desde aquí, las rutas requieren sesión válida.
app.use(requiereSesion);

// Rutas protegidas del sistema.
app.use('/', require('./routes/index'));
app.use('/', require('./routes/auditoria'));
app.use('/', require('./routes/eventos'));
app.use('/', require('./routes/compras'));
app.use('/', require('./routes/reportes'));
app.use('/', require('./routes/puerta'));

// Administración de usuarios y roles (Persona 2).
app.use('/', require('./routes/usuarios'));
app.use('/', require('./routes/roles'));

// Ruta no encontrada: se delega al manejador central.
app.use((req, res, next) => {
  const error = new Error('Página no encontrada');
  error.status = 404;
  next(error);
});

// Manejo de errores CSRF y errores generales.
app.use(async (err, req, res, next) => {
  if (err && (
    err.code === 'EBADCSRFTOKEN' ||
    /csrf/i.test(err.message || '')
  )) {
    // Si la sesión venció, se solicita iniciar sesión nuevamente.
    if (!req.usuario) {
      return res.redirect('/login');
    }

    // Registra el rechazo sin exponer detalles internos.
    try {
      await registrarAuditoria(
        req,
        'acceso_403',
        'token CSRF inválido o ausente'
      );
    } catch (error) {
      console.error('No se pudo registrar el rechazo CSRF.');
    }

    err.status = 403;
    err.message = 'Solicitud rechazada: token de seguridad inválido o ausente.';
  }

  return errorHandler(err, req, res, next);
});

// Inicio del servidor.
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada');
  } catch (err) {
    console.warn('No se pudo conectar a la BD:', err.message);
  }
});
