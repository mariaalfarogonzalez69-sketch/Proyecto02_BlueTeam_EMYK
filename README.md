# Proyecto02_BlueTeam_EMYK
Este repositorio contiene el código del Proyecto 02 del curso ISW622.

### Profesor
José David Carvajal Jiménez

### Integrantes
- Emily María Alfaro González
- Yesenia Michelle Pérez Rodríguez
- Katlyn Yiliana Fernández Ramos
- Melanni Michel Díaz Ugalde


## Descripción del proyecto

Sistema web para una productora que vende entradas para conciertos y eventos. Permite crear y publicar eventos, vender y anular entradas, controlar el cupo de cada evento y validar las entradas en la puerta.

El sistema se construye como un equipo azul (Blue Team): está protegido contra los ataques web más comunes (SQL Injection, XSS y CSRF) y cuenta con control de acceso por roles y permisos, registro de auditoría, sesiones seguras y pruebas automatizadas de seguridad.

---

## Estructura del proyecto

```text
Proyecto02_BlueTeam_EMYK/
│
├── README.md
│
├── package.json
├── .env.example
├── .gitignore
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── generar_hashes.js
│
├── src/
│   ├── app.js
│   ├── config/db.js
│   ├── routes/        (auth, auditoria, eventos, compras, index)
│   ├── middleware/    (sesión, CSRF, permisos, roles, errores)
│   ├── models/        (Evento, Compra, Comprador, Entrada)
│   └── utils/         (contraseñas, auditoría, reglas de negocio)
│
├── views/
├── public/css/
└── tests/             (proyecto Maven con JUnit 5)
```

## Descripción de los archivos

| Archivo o carpeta | Para qué sirve |
| --- | --- |
| `src/app.js` | Punto de entrada: sesión, helmet, CSRF, rutas y manejo de errores |
| `src/config/db.js` | Conexión a PostgreSQL con Sequelize, usando variables de entorno |
| `src/routes/` | Rutas de la aplicación |
| `src/routes/auth.js` | Login y logout |
| `src/routes/auditoria.js` | Pantalla del registro de auditoría (solo SuperAdmin) |
| `src/routes/eventos.js`, `compras.js` | Eventos y venta de entradas |
| `src/middleware/` | `requiereSesion`, `cargarUsuario`, CSRF, `requierePermiso`, `requiereRol` y `errorHandler` |
| `src/models/` | Modelos de Sequelize |
| `src/utils/password.js` | Funciones `hashPassword` y `verificarPassword` (bcrypt, costo 12) |
| `src/utils/auditoria.js` | Función `registrarAuditoria` |
| `views/` | Plantillas EJS |
| `public/css/` | Estilos (sin estilos en línea: la CSP solo permite recursos propios) |
| `database/schema.sql` | Crea las tablas (borra y recrea, solo para desarrollo) |
| `database/seed.sql` | Datos de ejemplo ficticios |
| `database/generar_hashes.js` | Genera los hashes bcrypt de los usuarios de prueba |
| `tests/` | Suite de pruebas de seguridad |

## Instalación y ejecución

Requisitos: Node.js, PostgreSQL y pgAdmin.

1. Clonar el repositorio y cambiarse a `develop`.
2. Instalar dependencias: `npm install`
3. Copiar `.env.example` como `.env` y poner los datos de tu PostgreSQL.
4.   Generar un `SESSION_SECRET` propio:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
5. En pgAdmin, crear la base de datos con el mismo nombre que `DB_NAME`.
6. En el Query Tool de esa base, ejecutar `database/schema.sql` y luego `database/seed.sql`.
7. Arrancar: `npm run dev`
8. Abrir http://localhost:3000

### Variables de entorno

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto de la aplicación |
| `DB_HOST`, `DB_PORT` | Servidor y puerto de PostgreSQL |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Base de datos y credenciales |
| `SESSION_SECRET` | Secreto para firmar la sesión (texto largo y aleatorio, distinto en cada computadora) |
| `SESSION_TIMEOUT_SECONDS` | Inactividad antes de cerrar la sesión (60) |
| `COOKIE_SECURE` | `true` solo cuando el sistema se publique con HTTPS |
| `USE_HTTPS` | `true` para activar el encabezado HSTS cuando haya HTTPS |
| `TZ` | Zona horaria (`America/Costa_Rica`) |

### Credenciales de prueba (datos ficticios)

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| SuperAdmin | superadmin | Super#2026 |
| Auditor | auditor | Audit#2026 |
| Taquillero | taquillero | Taqui#2026 |

## Roles del sistema

| Rol | Qué puede hacer |
| --- | --- |
| SuperAdmin | Administra usuarios, roles y permisos, consulta los reportes y el registro de auditoría |
| Auditor | Solo lectura de usuarios y de eventos, consulta los reportes |
| Taquillero | Administra eventos, vende y anula entradas, valida entradas en la puerta y consulta usuarios en solo lectura |

## Organización del equipo

| Bloque | Requerimientos | Responsable |
| --- | --- | --- |
| Base de datos, autenticación, sesión, CSRF y auditoría | UTN-01, UTN-02, UTN-07c, UTN-07d, UTN-09 | Emily Alfaro González |
| Usuarios, roles y permisos | UTN-04, UTN-05, UTN-06 | Katlyn Fernández Ramos |
| Eventos, ventas, reglas de negocio y SQL Injection | UTN-03, RFD, UTN-07a | Yesenia Pérez Rodríguez |
| XSS, encabezados HTTP, pruebas de seguridad y documento técnico | UTN-07b, UTN-08, UTN-10 | Melanni Díaz Ugalde |

## Tecnología

| Pieza | Elección | Para qué sirve |
| --- | --- | --- |
| Backend | Node.js con Express | Servidor de la aplicación web |
| Base de datos | PostgreSQL | Base de datos relacional |
| ORM | Sequelize | Consultas con parámetros, para prevenir inyección SQL |
| Plantillas | EJS | Escape automático de lo que se muestra, para prevenir XSS |
| Contraseñas | bcrypt (costo 12) | Hash seguro de contraseñas |
| Sesiones | express-session | Sesión de 60 segundos de inactividad con cookie HttpOnly |
| Encabezados de seguridad | helmet | CSP, X-Frame-Options, nosniff y HSTS |
| Pruebas de seguridad | Java 17, Maven, JUnit 5 y Selenium | Suite automatizada con `mvn test` y reporte |

### Por qué este stack

El equipo ya trabajó con PostgreSQL y con Java, JUnit y Selenium en el proyecto 1, y Express es una opción sencilla para la aplicación. Además, el ORM y las plantillas con escape automático ayudan a cubrir la prevención de inyección SQL y XSS.

### Publicación

Pendiente de decidir.

## Datos y seguridad del repositorio

- El archivo `.env` real nunca se sube al repositorio. Solo se incluye `.env.example`, sin valores reales.
- Todos los datos de prueba son ficticios. No se usan datos personales reales.