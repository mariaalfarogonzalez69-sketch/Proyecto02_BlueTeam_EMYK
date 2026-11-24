# Proyecto02_BlueTeam_EMYK

Repositorio del Proyecto 02 del curso **ISW622 – Pruebas de Software**.

## Información general

**Profesor:** José David Carvajal Jiménez

**Integrantes:**
- Emily María Alfaro González
- Yesenia Michelle Pérez Rodríguez
- Katlyn Yiliana Fernández Ramos
- Melanni Michel Díaz Ugalde

## Descripción del proyecto

Sistema web para una productora que vende entradas para conciertos y eventos. Permite administrar eventos, vender y anular entradas, controlar la capacidad disponible y validar entradas en la puerta.

El proyecto se desarrolla bajo un enfoque de **Blue Team**, incorporando medidas de seguridad para proteger la aplicación frente a vulnerabilidades web como SQL Injection, XSS y CSRF. También contempla autenticación, sesiones, control de acceso basado en roles y permisos, auditoría y pruebas de seguridad.

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js | Entorno de ejecución del backend |
| Express 5 | Framework para el servidor y las rutas |
| PostgreSQL | Sistema de gestión de base de datos |
| Sequelize | ORM para interactuar con PostgreSQL |
| EJS | Motor de plantillas para las vistas |
| bcrypt | Hash de contraseñas con costo 12 |
| express-session | Gestión de sesiones de usuario |
| csrf-sync | Protección contra ataques CSRF |
| Helmet | Configuración de encabezados HTTP de seguridad |
| Node.js Test Runner | Ejecución de pruebas automatizadas del backend |

> El proyecto también contempla pruebas de seguridad con Java, Maven, JUnit 5 y Selenium, de acuerdo con los requerimientos del curso. Estas herramientas no cuentan todavía con una estructura de pruebas integrada en el repositorio actual.

## Estructura del proyecto

```text
Proyecto02_BlueTeam_EMYK/
│
├── database/
│   ├── generar_hashes.js
│   ├── schema.sql
│   └── seed.sql
│
├── public/
│
├── src/
│   ├── app.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── requierePermiso.js
│   │   ├── requiereRol.js
│   │   ├── requiereSesion.js
│   │   └── usuarioSimulado.js
│   │
│   ├── models/
│   │   ├── asociacionesUsuariosRoles.js
│   │   ├── Permiso.js
│   │   ├── Rol.js
│   │   ├── RolPermiso.js
│   │   └── Usuario.js
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── roles.js
│   │   └── usuarios.js
│   │
│   └── utils/
│       ├── auditoria.js
│       └── password.js
│
├── tests/
│   └── middleware.test.js
│
├── views/
│   ├── index.ejs
│   ├── errores/
│   │   ├── 403.ejs
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   │
│   ├── roles/
│   │   ├── editar.ejs
│   │   ├── index.ejs
│   │   └── nuevo.ejs
│   │
│   └── usuarios/
│       ├── editar.ejs
│       ├── index.ejs
│       └── nuevo.ejs
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Descripción de los componentes

### Configuración

| Archivo | Descripción |
|---|---|
| `src/app.js` | Punto de entrada. Configura Express, EJS, archivos estáticos y registra las rutas. |
| `src/config/db.js` | Configura la conexión con PostgreSQL mediante Sequelize y variables de entorno. |

### Middleware

| Archivo | Descripción |
|---|---|
| `requiereSesion.js` | Middleware previsto para verificar que exista una sesión válida. La versión actual es temporal. |
| `requierePermiso.js` | Comprueba si el usuario tiene el permiso requerido (`crear`, `editar`, `borrar` o `ver_reportes`) para realizar una operación. Si no cuenta con él, bloquea el acceso con HTTP 403. |
| `requiereRol.js` | Comprueba si el usuario pertenece a uno de los roles autorizados para acceder a una ruta. Si su rol no está permitido, bloquea el acceso con HTTP 403. |
| `usuarioSimulado.js` | Asigna temporalmente un usuario y sus permisos para facilitar el desarrollo sin autenticación integrada. |

### Modelos

| Archivo | Descripción |
|---|---|
| `Usuario.js` | Define el modelo de usuarios y sus atributos, incluyendo nombre de usuario, contraseña cifrada, correo electrónico, identificación y rol. |
| `Rol.js` | Define el modelo de roles disponibles en el sistema. |
| `Permiso.js` | Define los permisos disponibles para controlar las operaciones del sistema. |
| `RolPermiso.js` | Representa la relación entre roles y permisos. |
| `asociacionesUsuariosRoles.js` | Configura las relaciones entre usuarios, roles y permisos. |

Las asociaciones implementan las siguientes relaciones:

- Un rol puede estar asignado a varios usuarios.
- Un usuario pertenece a un rol.
- Un rol puede tener varios permisos.
- Un permiso puede pertenecer a varios roles.

### Rutas

| Archivo | Descripción |
|---|---|
| `index.js` | Rutas principales de la aplicación y ejemplo de utilización de los middleware. |
| `usuarios.js` | Implementa el listado, creación, edición y eliminación de usuarios. Incluye validaciones, restricciones de acceso para SuperAdmin y protecciones para evitar eliminar la propia cuenta o al último SuperAdmin. |
| `roles.js` | Implementa la consulta, creación y edición de roles, así como la asignación de permisos. Restringe las operaciones administrativas al rol SuperAdmin. |

### Utilidades

| Archivo | Descripción |
|---|---|
| `password.js` | Funciones `hashPassword` y `verificarPassword` para generar y comprobar hashes mediante bcrypt con costo 12. |
| `auditoria.js` | Expone la función `registrarAuditoria`. En la versión actual de desarrollo registra los eventos en consola de forma simulada. |

### Vistas

Las vistas están desarrolladas con EJS:

- `views/index.ejs`: página principal.
- `views/usuarios/`: pantallas para consultar, crear y editar usuarios.
- `views/roles/`: pantallas para consultar, crear y editar roles.
- `views/errores/403.ejs`: muestra el mensaje de acceso denegado cuando un usuario intenta acceder a una operación no autorizada.
- `views/errores/404.ejs`: muestra el mensaje para rutas o recursos no encontrados.
- `views/errores/500.ejs`: muestra un mensaje seguro para errores internos del servidor.

### Base de datos

| Archivo | Descripción |
|---|---|
| `database/schema.sql` | Crea las tablas y los índices necesarios para el sistema. |
| `database/seed.sql` | Inserta datos ficticios iniciales para facilitar las pruebas. |
| `database/generar_hashes.js` | Herramienta para generar hashes de contraseñas mediante bcrypt. |

**Importante:** los scripts `schema.sql` y `seed.sql` contienen operaciones destructivas para reinicializar la información. Deben ejecutarse únicamente en una base de datos de desarrollo o pruebas.

## Requisitos previos

Para ejecutar la versión actual se necesita:

- Node.js.
- npm.
- PostgreSQL.
- pgAdmin (opcional, para administrar la base de datos).

## Instalación y ejecución

1. Clonar el repositorio:

   ```powershell
   git clone <URL_DEL_REPOSITORIO>
   ```

2. Ingresar al directorio:

   ```powershell
   cd Proyecto02_BlueTeam_EMYK
   ```

3. Cambiar a la rama de desarrollo:

   ```powershell
   git checkout develop
   ```

4. Instalar las dependencias:

   ```powershell
   npm install
   ```

5. Crear el archivo de variables de entorno:

   ```powershell
   Copy-Item .env.example .env
   ```

6. Configurar en `.env` los datos de conexión de PostgreSQL.

7. Crear en PostgreSQL la base de datos indicada en `DB_NAME`.

8. Ejecutar `database/schema.sql` en la base de datos correspondiente.

9. Ejecutar `database/seed.sql` para insertar los datos ficticios iniciales.

10. Iniciar la aplicación:

    ```powershell
    npm run dev
    ```

11. Abrir en el navegador:

    ```text
    http://localhost:3000
    ```

La aplicación intenta conectarse a PostgreSQL al iniciar. Si la conexión falla, muestra una advertencia en consola, pero el servidor intenta continuar ejecutándose.

## Variables de entorno

La configuración de la base de datos se realiza mediante variables de entorno:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que se ejecuta el servidor. |
| `DB_HOST` | Dirección del servidor PostgreSQL. |
| `DB_PORT` | Puerto de PostgreSQL. |
| `DB_NAME` | Nombre de la base de datos. |
| `DB_USER` | Usuario de PostgreSQL. |
| `DB_PASSWORD` | Contraseña del usuario de PostgreSQL. |
| `USUARIO_SIMULADO_ROL` | Rol asignado al usuario simulado durante el desarrollo. |

La configuración de autenticación también contempla variables como `SESSION_SECRET`, `SESSION_TIMEOUT_SECONDS` y `COOKIE_SECURE`, cuya utilización corresponde a la integración de la gestión real de sesiones.

**Nunca se deben compartir ni subir al repositorio los valores privados del archivo `.env`.**

## Roles y permisos

El sistema contempla tres roles iniciales y cuatro permisos.

### Permisos disponibles

| Permiso | Descripción |
|---|---|
| `crear` | Autoriza operaciones de creación. |
| `editar` | Autoriza operaciones de modificación. |
| `borrar` | Autoriza operaciones de eliminación. |
| `ver_reportes` | Autoriza la consulta de reportes. |

### Matriz de permisos acordada

| Rol | Crear | Editar | Borrar | Ver reportes |
|---|:---:|:---:|:---:|:---:|
| SuperAdmin | Sí | Sí | Sí | Sí |
| Auditor | No | No | No | Sí |
| Taquillero | Sí | Sí | Sí | No |

Las operaciones de administración de usuarios, roles y permisos están restringidas adicionalmente al rol `SuperAdmin`, independientemente de los permisos CRUD.

El Auditor tiene acceso de consulta a la información de eventos y reportes, sin facultades para modificarla. El Taquillero puede realizar las operaciones de gestión de eventos y ventas según las reglas de negocio correspondientes.

La administración de usuarios incluye restricciones adicionales para evitar que un SuperAdmin elimine su propia cuenta o elimine al último SuperAdmin disponible en el sistema.

## Pruebas automatizadas

El repositorio contiene pruebas automatizadas para verificar el comportamiento de los middleware de autorización.

Para ejecutar las pruebas disponibles:

```powershell
node --test .\tests\middleware.test.js
```

### Casos cubiertos

| Caso | Resultado esperado |
|---|---|
| Usuario con el permiso requerido | Permite continuar. |
| Usuario sin el permiso requerido | Responde con HTTP 403. |
| Solicitud sin usuario | Responde con HTTP 403. |
| Usuario con el rol requerido | Permite continuar. |
| Usuario con un rol no autorizado | Responde con HTTP 403. |
| Usuario con uno de varios roles permitidos | Permite continuar. |
| Solicitud sin usuario al validar el rol | Responde con HTTP 403. |

**Resultado de la ejecución actual:** 7 pruebas aprobadas, 0 fallidas.

```text
tests 7
pass 7
fail 0
```

Las pruebas actuales verifican los middleware de permisos y roles, incluyendo usuarios autorizados, usuarios sin permisos, roles no autorizados y solicitudes sin usuario autenticado. La salida de auditoría observada durante estas pruebas corresponde a la implementación simulada que imprime los eventos en consola.

## Organización del equipo

| Bloque de trabajo | Requerimientos | Responsable |
|---|---|---|
| Base de datos, autenticación, sesiones, CSRF y auditoría | UTN-01, UTN-02, UTN-07c, UTN-07d, UTN-09 | Emily Alfaro González |
| Usuarios, roles y permisos | UTN-04, UTN-05, UTN-06 | Katlyn Fernández Ramos |
| Eventos, ventas, reglas de negocio y SQL Injection | UTN-03, RFD, UTN-07a | Yesenia Pérez Rodríguez |
| XSS, encabezados HTTP, pruebas de seguridad y documentación técnica | UTN-07b, UTN-08, UTN-10 | Melanni Michel Díaz Ugalde |

## Estado de implementación

El proyecto se encuentra en desarrollo e integración por ramas.

Entre los componentes presentes en la versión de trabajo se encuentran:

- Configuración inicial de Express y conexión con PostgreSQL.
- Modelos y asociaciones de usuarios, roles y permisos.
- Rutas y vistas para administrar usuarios y roles.
- Middleware funcional para validar roles y permisos.
- Restricciones de acceso a la administración de usuarios, roles y permisos para el rol SuperAdmin.
- Protección de operaciones administrativas para impedir la eliminación de la propia cuenta o del último SuperAdmin.
- Vistas de error para respuestas HTTP 403, 404 y 500.
- Utilidades para generar y verificar hashes de contraseñas.
- Pruebas automatizadas de los middleware de autorización.

Otros componentes, como la autenticación real, las sesiones, la protección CSRF y la auditoría persistente, se encuentran sujetos a la integración de sus respectivas implementaciones.

La existencia de una dependencia en `package.json` no implica por sí sola que la funcionalidad ya esté configurada o activa en la aplicación.

## Seguridad del repositorio

- El archivo `.env` contiene configuración privada y no debe subirse al repositorio.
- Se proporciona `.env.example` como referencia para configurar el entorno.
- Los datos de prueba deben ser ficticios.
- No se deben registrar contraseñas, tokens CSRF ni códigos de entradas en los mensajes de auditoría.
- Los scripts de inicialización de la base de datos deben utilizarse únicamente en entornos de desarrollo o pruebas.

## Publicación

La plataforma de publicación se encuentra pendiente de definición.