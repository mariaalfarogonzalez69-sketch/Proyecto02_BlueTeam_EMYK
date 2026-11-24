// Punto de entrada de la aplicación.
require("dotenv").config();
const path = require("path");
const express = require("express");
const sequelize = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const helmet = require("helmet");
const session = require("express-session");
const cargarUsuario = require("./middleware/cargarUsuario");
const requiereSesion = require("./middleware/requiereSesion");
const { proteccionCsrf, ponerToken } = require("./middleware/csrf");
const { registrarAuditoria } = require("./utils/auditoria");

const app = express();

// EJS escapa automáticamente lo que se muestra con <%= %> (prevención de XSS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.urlencoded({ extended: false })); // lee formularios
app.use(express.static(path.join(__dirname, "..", "public")));

// Sesión (UTN-07c): la cookie lleva solo un id aleatorio
app.use(
  session({
    name: "sid", // nombre genérico, no revela la tecnología
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // cada solicitud renueva el contador de inactividad
    cookie: {
      httpOnly: true, // JavaScript del navegador no puede leerla
      sameSite: "strict", // no viaja en peticiones desde otros sitios
      secure: process.env.COOKIE_SECURE === "true", // solo por HTTPS cuando se publique
      maxAge: Number(process.env.SESSION_TIMEOUT_SECONDS || 60) * 1000, // 60 s de inactividad
    },
  }),
);
app.use(cargarUsuario); // reemplaza a usuarioSimulado

// --- Encabezados de seguridad (UTN-08) ---
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    frameguard: { action: "deny" },
    hsts: process.env.USE_HTTPS === "true" ? { maxAge: 15552000 } : false,
  }),
);

// CSRF: rechaza con 403 todo POST/PUT/PATCH/DELETE sin token válido (incluye el login)
app.use(proteccionCsrf);
app.use(ponerToken);

// Ruta pública: solo el login
app.use("/", require("./routes/auth"));

// Desde aquí, TODO exige sesión válida
app.use(requiereSesion);

// --- Rutas protegidas (cada persona agrega SOLO su línea aquí) ---
app.use("/", require("./routes/index"));
app.use("/", require("./routes/auditoria"));
app.use("/", require("./routes/eventos"));
app.use("/", require("./routes/compras"));

// Respuesta limpia cuando falla el token CSRF (sin rutas de archivos ni trazas)
app.use(async (err, req, res, next) => {
  if (
    err &&
    (err.code === "EBADCSRFTOKEN" || /csrf/i.test(err.message || ""))
  ) {
    await registrarAuditoria(
      req,
      "acceso_403",
      "token CSRF inválido o ausente",
    );
    return res
      .status(403)
      .send("Solicitud rechazada: token de seguridad inválido o ausente.");
  }
  next(err);
});

// Si ninguna ruta coincide, generar un error 404.
app.use((req, res, next) => {
  const error = new Error("Página no encontrada");
  error.status = 404;
  next(error);
});

// Manejador global de errores.
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  // La app arranca aunque la BD no esté lista, para no bloquear a nadie.
  try {
    await sequelize.authenticate();
    console.log("Base de datos conectada");
  } catch (err) {
    console.warn("No se pudo conectar a la BD:", err.message);
  }
});
