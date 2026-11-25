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

El proyecto se desarrolla bajo un enfoque de **Blue Team**, incorporando medidas de seguridad para proteger la aplicación frente a vulnerabilidades web como SQL Injection, XSS y CSRF. También contempla autenticación, gestión de sesiones, control de acceso basado en roles y permisos, auditoría y pruebas de seguridad.

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
| Java 17 | Entorno para las pruebas automatizadas de seguridad |
| Maven | Gestión y ejecución del proyecto de pruebas Java |
| JUnit 5 | Framework para pruebas automatizadas |
| Cliente HTTP de Java (`java.net.http`) | Envío de solicitudes HTTP desde las pruebas de seguridad al sistema en ejecución |
| Maven Surefire | Ejecución de las pruebas y generación automática del reporte XML |

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
│   ├── css/
│   │   ├── admin.css
│   │   ├── errores.css
│   │   ├── eventos-compras.css
│   │   ├── sesion.css
│   │   └── usuarios-roles.css
│   └── js/
│       └── confirmar.js
│
├── src/
│   ├── app.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── cargarUsuario.js
│   │   ├── csrf.js
│   │   ├── errorHandler.js
│   │   ├── requierePermiso.js
│   │   ├── requiereRol.js
│   │   └── requiereSesion.js
│   │
│   ├── models/
│   │   ├── asociacionesUsuariosRoles.js
│   │   ├── Comprador.js
│   │   ├── Compra.js
│   │   ├── Entrada.js
│   │   ├── Evento.js
│   │   ├── Permiso.js
│   │   ├── Rol.js
│   │   ├── RolPermiso.js
│   │   └── Usuario.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── auditoria.js
│   │   ├── compras.js
│   │   ├── eventos.js
│   │   ├── index.js
│   │   ├── puerta.js
│   │   ├── reportes.js
│   │   ├── roles.js
│   │   └── usuarios.js
│   │
│   └── utils/
│       ├── auditoria.js
│       ├── datosSensibles.js
│       ├── ErrorNegocio.js
│       ├── generarCodigo.js
│       ├── password.js
│       ├── reglasNegocio.js
│       ├── validarFecha.js
│       └── validarId.js
│
├── tests/
│   ├── middleware.test.js
│   ├── pom.xml
│   └── src/
│       └── test/
│           └── java/
│               └── seguridad/
│                   ├── AutenticacionTest.java
│                   ├── ControlAccesoTest.java
│                   ├── InyeccionSqlTest.java
│                   ├── SeguridadTest.java
│                   └── XssCamposTest.java
│
├── views/
│   ├── index.ejs
│   ├── auditoria.ejs
│   ├── login.ejs
│   │
│   ├── compras/
│   │   ├── detalle.ejs
│   │   ├── form.ejs
│   │   └── lista.ejs
│   │
│   ├── errores/
│   │   ├── 400.ejs
│   │   ├── 403.ejs
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   │
│   ├── eventos/
│   │   ├── detalle.ejs
│   │   ├── eliminar.ejs
│   │   ├── form.ejs
│   │   └── lista.ejs
│   │
│   ├── puerta/
│   │   └── validar.ejs
│   │
│   ├── reportes/
│   │   └── ventas.ejs
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

> La estructura representa los componentes principales del proyecto. Algunos archivos y subdirectorios pueden variar conforme avance la integración de los módulos. Los archivos CSS deben ajustarse a los que finalmente queden incorporados en la rama de desarrollo.

## Descripción de los componentes

### Configuración

| Archivo | Descripción |
|---|---|
| `src/app.js` | Punto de entrada de la aplicación. Configura Express, EJS, archivos estáticos, sesiones, encabezados de seguridad, protección CSRF, rutas y manejo de errores. |
| `src/config/db.js` | Configura la conexión con PostgreSQL mediante Sequelize y variables de entorno. |

### Middleware

| Archivo | Descripción |
|---|---|
| `requiereSesion.js` | Verifica que el usuario tenga una sesión válida para acceder a las rutas protegidas. |
| `cargarUsuario.js` | Recupera y carga la información del usuario asociado a la sesión. |
| `csrf.js` | Centraliza la protección contra solicitudes que no cuentan con la validación CSRF correspondiente. |
| `requierePermiso.js` | Comprueba si el usuario tiene el permiso requerido (`crear`, `editar`, `borrar` o `ver_reportes`). Si no cuenta con él, bloquea el acceso con HTTP 403. |
| `requiereRol.js` | Comprueba si el usuario pertenece a uno de los roles autorizados para acceder a una ruta. Si su rol no está permitido, bloquea el acceso con HTTP 403. |
| `errorHandler.js` | Centraliza el manejo de errores de la aplicación. Contempla los errores HTTP 400, 403, 404 y 500, muestra las vistas correspondientes y evita exponer detalles técnicos internos al usuario. |

### Modelos

| Archivo | Descripción |
|---|---|
| `Usuario.js` | Define el modelo de usuarios y sus atributos, incluyendo nombre de usuario, contraseña cifrada, correo electrónico, identificación y rol. |
| `Rol.js` | Define los roles disponibles en el sistema. |
| `Permiso.js` | Define los permisos disponibles para controlar las operaciones del sistema. |
| `RolPermiso.js` | Representa la relación entre roles y permisos. |
| `asociacionesUsuariosRoles.js` | Configura las relaciones entre usuarios, roles y permisos. |
| `Evento.js` | Define la información de los eventos administrados por el sistema. |
| `Compra.js` | Representa las compras de entradas realizadas por los clientes. |
| `Comprador.js` | Define la información de los compradores. |
| `Entrada.js` | Representa las entradas asociadas a las compras y los eventos. |

Las asociaciones de usuarios, roles y permisos implementan las siguientes relaciones:

- Un rol puede estar asignado a varios usuarios.
- Un usuario pertenece a un rol.
- Un rol puede tener varios permisos.
- Un permiso puede pertenecer a varios roles.

### Rutas

| Archivo | Descripción |
|---|---|
| `index.js` | Organiza y registra las rutas principales de la aplicación. |
| `auth.js` | Gestiona los procesos de autenticación, incluyendo el inicio y cierre de sesión. |
| `auditoria.js` | Proporciona las rutas para consultar los registros de auditoría, con acceso restringido según el rol autorizado. |
| `eventos.js` | Gestiona el catálogo de eventos (UTN-03): listar con búsqueda, ver detalle, crear, editar, eliminar y publicar. Las escrituras exigen el permiso correspondiente y el rol Taquillero. |
| `compras.js` | Gestiona la venta de entradas, la consulta de compras y la anulación (RFD-7.2 a RFD-7.4). Aplica las reglas RN-7.1 a RN-7.3 en una transacción. |
| `puerta.js` | Implementa la validación de entradas en la puerta del evento (RFD-7.5). Solo accesible para el rol Taquillero. |
| `reportes.js` | Implementa el reporte de ventas por evento. Requiere el permiso `ver_reportes`. |
| `usuarios.js` | Implementa el listado, creación, edición y eliminación de usuarios. Incluye validaciones de los datos ingresados y restricciones para proteger las cuentas administrativas. |
| `roles.js` | Implementa la consulta, creación, edición y eliminación de roles, así como la administración de permisos asociados. Incluye restricciones para proteger los roles principales del sistema. |

### Utilidades

| Archivo | Descripción |
|---|---|
| `password.js` | Proporciona las funciones `hashPassword` y `verificarPassword` para generar y comprobar hashes de contraseñas mediante bcrypt con costo 12. |
| `auditoria.js` | Expone la función `registrarAuditoria` para registrar los eventos relevantes de seguridad y operaciones administrativas. |
| `reglasNegocio.js` | Reglas de la venta: cantidad entre 1 y 6 (RN-7.2), evento no pasado (RN-7.1) y evento publicado. La regla RN-7.3 se garantiza con la restricción `UNIQUE` de la base de datos. |
| `generarCodigo.js` | Genera el código de cada entrada con un generador aleatorio seguro (`crypto.randomInt`): 16 símbolos de un alfabeto de 32 que excluye caracteres confusos (0, O, 1, I). |
| `datosSensibles.js` | Funciones para mostrar de forma parcial los códigos de entrada y los correos de los compradores. |
| `validarFecha.js` | Valida la fecha de un evento (formato, existencia en el calendario y que sea futura) y la interpreta en hora de Costa Rica (UTC-6). |
| `validarId.js` | Valida que un identificador de la URL sea un entero positivo válido; si no lo es, la ruta responde con la página de error 404. |
| `ErrorNegocio.js` | Error de una regla de negocio. Su mensaje se muestra al usuario; cualquier otro error va al manejador global (página 500 sin detalles). |

### Vistas

Las vistas están desarrolladas con EJS:

- `views/index.ejs`: página principal de la aplicación.
- `views/login.ejs`: formulario de inicio de sesión.
- `views/auditoria.ejs`: pantalla para consultar los registros de auditoría.
- `views/usuarios/`: pantallas para consultar, crear y editar usuarios.
- `views/roles/`: pantallas para consultar, crear y editar roles.
- `views/eventos/`: pantallas para listar, ver, crear, editar y eliminar eventos.
- `views/compras/`: pantallas para vender entradas, consultar las compras de un evento y ver el detalle de una compra.
- `views/puerta/validar.ejs`: formulario para validar el código de una entrada en la puerta.
- `views/reportes/ventas.ejs`: reporte de ventas por evento.
- `views/errores/400.ejs`: muestra un mensaje cuando la solicitud contiene datos incorrectos o no válidos.
- `views/errores/403.ejs`: muestra el mensaje de acceso denegado cuando un usuario intenta acceder a una operación no autorizada.
- `views/errores/404.ejs`: muestra el mensaje para rutas o recursos no encontrados.
- `views/errores/500.ejs`: muestra un mensaje seguro para errores internos del servidor.

### Archivos estáticos

La carpeta `public/css/` contiene las hojas de estilo de la aplicación. Los estilos se mantienen en archivos externos para evitar estilos en línea y respetar las políticas de seguridad de contenido configuradas.

Entre los archivos de estilos se encuentran:

- `usuarios-roles.css`: contiene los estilos de las vistas de administración de usuarios y roles.
- `errores.css`: contiene los estilos de las páginas de error.
- `eventos-compras.css`: contiene los estilos de las vistas de eventos y compras.
- `sesion.css`: contiene los estilos relacionados con la autenticación y las sesiones.

La carpeta `public/js/` contiene el JavaScript del navegador. `confirmar.js` muestra un cuadro de confirmación antes de enviar los formularios que tienen el atributo `data-confirm` (por ejemplo, la eliminación de usuarios y roles). El código está en un archivo externo porque la política de seguridad de contenido (CSP) no permite scripts ni manejadores `onclick` incrustados en las vistas.

### Base de datos

| Archivo | Descripción |
|---|---|
| `database/schema.sql` | Crea las tablas y los índices necesarios para el sistema. |
| `database/seed.sql` | Inserta datos ficticios iniciales para facilitar las pruebas. |
| `database/generar_hashes.js` | Herramienta para generar hashes de contraseñas mediante bcrypt. |

**Importante:** los scripts `schema.sql` y `seed.sql` contienen operaciones que pueden eliminar o reinicializar información. Deben ejecutarse únicamente en una base de datos de desarrollo o pruebas.

## Requisitos previos

Para ejecutar el backend se necesita:

- Node.js.
- npm.
- PostgreSQL.
- pgAdmin (opcional, para administrar la base de datos).

Para ejecutar las pruebas automatizadas con Java también se necesita:

- Java JDK 17.
- Maven.

## Instalación y ejecución

### 1. Clonar el repositorio

```powershell
git clone <URL_DEL_REPOSITORIO>
```

### 2. Ingresar al directorio del proyecto

```powershell
cd Proyecto02_BlueTeam_EMYK
```

### 3. Cambiar a la rama de desarrollo

```powershell
git checkout develop
```

### 4. Instalar las dependencias

```powershell
npm install
```

### 5. Crear el archivo de variables de entorno

```powershell
Copy-Item .env.example .env
```

### 6. Configurar las variables de entorno

Abrir el archivo `.env` y establecer los datos de conexión a PostgreSQL y los valores necesarios para la configuración de sesiones y seguridad.

Para generar un secreto de sesión propio se puede ejecutar:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

El valor generado debe configurarse en `SESSION_SECRET`.

### 7. Crear la base de datos

En PostgreSQL, crear la base de datos cuyo nombre se haya configurado en `DB_NAME`.

### 8. Inicializar la estructura de la base de datos

Ejecutar el contenido de `database/schema.sql` en la base de datos correspondiente.

### 9. Insertar los datos iniciales

Ejecutar el contenido de `database/seed.sql`.

### 10. Iniciar la aplicación

```powershell
npm run dev
```

### 11. Abrir la aplicación

Acceder desde el navegador a:

```text
http://localhost:3000
```

La aplicación utiliza las variables de entorno para establecer la conexión con PostgreSQL. Si la conexión falla, se debe revisar la configuración de la base de datos y los valores definidos en `.env`.

## Variables de entorno

La configuración de la aplicación se realiza mediante variables de entorno.

| Variable | Descripción |
|---|---|
| `PORT` | Puerto en el que se ejecuta la aplicación. |
| `DB_HOST` | Dirección del servidor PostgreSQL. |
| `DB_PORT` | Puerto de PostgreSQL. |
| `DB_NAME` | Nombre de la base de datos. |
| `DB_USER` | Usuario de PostgreSQL. |
| `DB_PASSWORD` | Contraseña del usuario de PostgreSQL. |
| `SESSION_SECRET` | Secreto aleatorio utilizado para firmar la sesión. |
| `SESSION_TIMEOUT_SECONDS` | Tiempo de inactividad permitido antes de finalizar la sesión. |
| `COOKIE_SECURE` | Indica si la cookie debe utilizar el atributo Secure. Debe activarse cuando la aplicación se publica mediante HTTPS. |
| `USE_HTTPS` | Permite activar configuraciones de seguridad relacionadas con HTTPS, como HSTS. |
| `TZ` | Zona horaria de la aplicación. Se utiliza `America/Costa_Rica`. |

Además, la suite de pruebas Java utiliza la variable `BASE_URL` (por defecto `http://localhost:3000`) para indicar la dirección del sistema que se va a probar. Se define al ejecutar las pruebas y no forma parte del archivo `.env` de la aplicación.

Los valores concretos deben revisarse en `.env.example`, ya que este archivo representa las variables requeridas por la configuración del proyecto.

**Nunca se deben compartir ni subir al repositorio los valores privados del archivo `.env`.**

## Eventos, ventas y reglas de negocio

### Gestión de eventos (UTN-03)

| Acción | Ruta | Requisito de acceso |
|---|---|---|
| Listar y buscar por nombre | `GET /eventos` (`?q=`) | Sesión válida |
| Ver detalle | `GET /eventos/:id` | Sesión válida |
| Crear | `GET /eventos/nuevo`, `POST /eventos` | Permiso `crear` y rol Taquillero |
| Editar | `GET` y `POST /eventos/:id/editar` | Permiso `editar` y rol Taquillero |
| Publicar | `POST /eventos/:id/publicar` | Permiso `editar` y rol Taquillero |
| Eliminar | `GET` y `POST /eventos/:id/eliminar` | Permiso `borrar` y rol Taquillero |

El Auditor puede consultar los eventos, pero recibe HTTP 403 en cualquier operación de escritura. Un evento con compras registradas no se puede eliminar.

Los datos se validan en el servidor, además de las validaciones del formulario:

| Campo | Regla |
|---|---|
| Código | Obligatorio, de 1 a 20 caracteres, solo letras y números, único. |
| Nombre y lugar | Obligatorios, máximo 120 caracteres. |
| Fecha | Formato `AAAA-MM-DDTHH:MM`, debe existir en el calendario y ser futura al crear o al cambiarla. Se interpreta en hora de Costa Rica. |
| Capacidad | Entero entre 1 y 100 000. No puede quedar por debajo de las entradas ya vendidas. |
| Precio | Número no negativo, máximo 1 000 000 y hasta 2 decimales (con punto). |

La búsqueda usa el operador del ORM con el texto como parámetro y escapa los comodines `%` y `_`. Si el identificador de la URL no es válido o el evento no existe, el sistema muestra la página de error 404.

### Venta de entradas (RFD-7.2 y RFD-7.3)

La venta se hace en `POST /eventos/:id/compra` (permiso `crear` y rol Taquillero). Los datos del comprador son el nombre (obligatorio), el correo (con formato válido) y el teléfono (opcional, solo números). No se piden ni se guardan datos de tarjeta.

| Regla | Qué hace el sistema |
|---|---|
| RN-7.1 | No se vende para eventos que ya pasaron. La comparación se hace en el servidor con la fecha y hora actuales. |
| RN-7.2 | La cantidad debe ser un entero de 1 a 6. La base de datos lo respalda con una restricción `CHECK`. |
| RN-7.3 | Cada entrada tiene un código único, generado con un generador aleatorio seguro. La columna `codigo` es `UNIQUE`. Si dos códigos coincidieran, la transacción completa se deshace. |
| Publicación | Solo se venden entradas de eventos publicados. |
| Cupo (RFD-7.3) | No se vende más que la capacidad. Se revisa dentro de la transacción, con la fila del evento bloqueada, y la base de datos lo respalda con un `CHECK`. |

El total lo calcula el servidor a partir del precio del evento y nunca se toma del formulario. El comprador, la compra, las entradas y el cupo se guardan en una sola transacción: o se registra todo, o no se registra nada. La fila del evento se bloquea durante la operación para que dos ventas simultáneas no superen el límite.

### Anulación de compras (RFD-7.4)

`POST /compra/:id/anular` (permiso `editar` y rol Taquillero). Solo se anula una compra activa y una sola vez: la actualización lleva la condición «estado = activa». Al anularla, sus entradas vuelven al cupo del evento y dejan de ser válidas en la puerta. Un segundo intento responde «La compra ya estaba anulada».

### Datos sensibles del dominio

Los datos del comprador y los códigos de entrada se protegen así:

- La consulta de compras (`GET /eventos/:id/compras` y `GET /compra/:id`) exige el permiso `crear`. El Auditor recibe HTTP 403.
- La lista de compras muestra el correo de forma parcial (por ejemplo, `a***@example.com`).
- Los códigos de entrada se muestran con asteriscos, salvo los últimos cuatro caracteres. Solo se ven completos durante un minuto después de la venta y únicamente para quien la realizó, para que pueda entregarlos al comprador.
- Los códigos no se escriben en los registros de auditoría ni en los mensajes de error.

### Revisión de SQL Injection (UTN-07a)

Se revisaron todas las consultas del repositorio con los comandos:

```powershell
git grep -n -i -E "select |insert |update |delete " -- src
git grep -n "sequelize.query" -- src
```

| Archivo | Acceso a la base de datos | Resultado |
|---|---|---|
| `src/routes/auth.js` | 3 consultas escritas a mano | Parámetros nombrados (`:username`, `:rolId`, `:id`) |
| `src/routes/auditoria.js` | 1 consulta con filtros opcionales | Trozos de SQL fijos; los valores van como parámetros y se validan antes |
| `src/utils/auditoria.js` | 1 `INSERT` | Parámetros nombrados |
| `eventos.js`, `compras.js`, `puerta.js`, `reportes.js`, `usuarios.js`, `roles.js` | ORM (Sequelize) | Sin SQL escrito a mano |

En ningún caso se arma una consulta pegando texto del usuario. Los casos TC-01 y TC-02 de la suite de pruebas intentan una inyección en el inicio de sesión y en el buscador. La revisión debe repetirse si se agrega una consulta nueva.

## Validación de entradas en la puerta y reporte de ventas

### Validación de entradas en la puerta (RFD-7.5)

Disponible para el rol Taquillero (con el permiso `editar`) en la ruta `GET /puerta`. El código de la entrada se envía por `POST /puerta/validar`.

| Resultado | Mensaje | Código HTTP |
|---|---|:---:|
| La entrada existe, su compra está activa y no se había usado | Entrada válida. Puede ingresar. | 200 |
| La entrada ya fue utilizada | Esta entrada ya fue usada. | 409 |
| El código no existe, tiene un formato incorrecto o pertenece a una compra anulada | Entrada no válida. | 404 |

Medidas de seguridad aplicadas:

- Solo se aceptan códigos de entre 1 y 64 caracteres con letras, números, guion y guion bajo.
- La respuesta nunca incluye datos del comprador ni devuelve el código escrito. Un código de una compra anulada se responde igual que uno inexistente, para no revelar que existió.
- La entrada se marca como usada mediante una actualización condicionada (`usada = false`) dentro de una transacción, y la compra se bloquea durante la validación. Así, dos lecturas simultáneas del mismo código no pueden ser válidas a la vez y no se valida una entrada mientras se anula su compra.
- El formulario incluye el token CSRF.
- Los usuarios con rol SuperAdmin o Auditor reciben HTTP 403.

### Reporte de ventas por evento

Disponible en `GET /reportes/ventas` para los usuarios con el permiso `ver_reportes` (según la matriz de permisos, SuperAdmin y Auditor; el Taquillero recibe HTTP 403). Muestra, por evento, la cantidad de compras activas, las entradas vendidas y la recaudación, además de los totales generales. Las compras anuladas no se cuentan y el reporte no muestra datos de los compradores.

## Protección contra XSS y encabezados HTTP

### Encabezados de seguridad (UTN-08)

Los encabezados se configuran de forma global con Helmet en `src/app.js`, por lo que se aplican a todas las respuestas, incluidas las páginas de error y las redirecciones.

| Encabezado | Configuración |
|---|---|
| `Content-Security-Policy` | Solo permite recursos del propio sitio (`default-src`, `script-src`, `style-src` e `img-src` con `'self'`; este último también `data:`). Bloquea `object`, restringe `base-uri` y `form-action` al propio sitio y define `frame-ancestors 'none'`. |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Strict-Transport-Security` | Se activa únicamente cuando `USE_HTTPS=true`. |

Helmet agrega además otros encabezados de protección por defecto, como `Referrer-Policy`.

Para comprobarlos con el servidor encendido:

```powershell
curl.exe -I http://localhost:3000
```

Sin una sesión iniciada, la respuesta es `302 Found` hacia el inicio de sesión, y aun así incluye los encabezados anteriores.

**Pendiente de comprobar:** `Strict-Transport-Security` no se ha verificado, porque las pruebas se hicieron por HTTP local. Debe comprobarse cuando el sistema se publique con HTTPS.

### Prevención de XSS (UTN-07b)

- Las vistas utilizan EJS con escape automático (`<%= %>`) para todo dato que proviene del usuario. No se utiliza `<%-` para mostrar datos del usuario.
- Gracias a la CSP, las vistas no contienen scripts, estilos ni manejadores de eventos (`onclick`) incrustados. El JavaScript del navegador está en `public/js/` y los estilos en `public/css/`.
- No se utiliza `innerHTML` ni `document.write` en el código del navegador.

La protección se verificó de tres formas: revisión del código de las vistas, pruebas funcionales con texto como `<b>Prueba XSS</b>` (que se muestra como texto literal en las pantallas de eventos) y las pruebas automatizadas TC-03, TC-04 y TC-04b a TC-04f descritas en la sección de pruebas.

Esta revisión cubre las vistas existentes. Debe repetirse cada vez que se agreguen pantallas o campos que muestren datos de los usuarios.

## Roles y permisos

El sistema contempla tres roles iniciales y cuatro permisos independientes.

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

### Descripción de los roles

**SuperAdmin**

Cuenta con todos los permisos del sistema. Puede administrar usuarios, roles y permisos, además de acceder a las funcionalidades administrativas y los reportes.

**Auditor**

Tiene acceso de consulta a la información y a los reportes autorizados. No puede crear, modificar ni eliminar registros.

**Taquillero**

Puede realizar operaciones de creación, edición y eliminación de acuerdo con las reglas de negocio correspondientes. No tiene autorización para consultar los reportes restringidos.

La matriz representa los permisos asignados a cada rol. Algunas funcionalidades también requieren pertenecer a un rol específico, por lo que disponer de un permiso no garantiza por sí solo el acceso a todas las rutas.

Las operaciones de administración de usuarios, roles y permisos están restringidas adicionalmente al rol `SuperAdmin`, independientemente de los permisos CRUD.

### Administración de usuarios, roles y permisos

El módulo de administración permite gestionar las cuentas de usuario, los roles disponibles y los permisos asociados a cada rol.

**Gestión de usuarios**

Las operaciones disponibles son:

- Consultar el listado de usuarios.
- Registrar nuevos usuarios.
- Editar la información de los usuarios.
- Eliminar usuarios, aplicando las restricciones de seguridad.

Se implementaron validaciones del lado del servidor para garantizar la integridad de los datos:

- Validación de campos obligatorios.
- Validación de identificación con exactamente nueve dígitos.
- Validación del formato del correo electrónico.
- Validación de los datos del usuario y del rol seleccionado.
- Prevención de registros duplicados de nombres de usuario, correos electrónicos e identificaciones.

También se establecieron restricciones para impedir que un usuario elimine su propia cuenta o que se elimine al último usuario con el rol SuperAdmin.

**Gestión de roles**

El módulo permite consultar, crear, editar y eliminar roles, así como administrar los permisos asociados a cada uno.

Se establecieron protecciones para los tres roles principales del sistema: SuperAdmin, Auditor y Taquillero. Estos roles están protegidos contra modificaciones o eliminaciones desde la administración de roles, para evitar que se alteren las funciones fundamentales del sistema.

**Control de acceso**

Se implementaron dos middleware para controlar el acceso desde el backend:

- `requierePermiso`: comprueba que el usuario autenticado tenga asignado el permiso necesario para ejecutar una operación.
- `requiereRol`: verifica que el usuario pertenezca al rol autorizado para acceder a una funcionalidad.

Ambas condiciones pueden utilizarse simultáneamente en una ruta. Por ejemplo, las operaciones de escritura de eventos y compras requieren el permiso correspondiente y pertenecer al rol Taquillero.

De esta manera, el sistema no depende únicamente de ocultar botones u opciones en la interfaz: las restricciones se verifican directamente en el servidor.

### Manejo de errores

Se centralizó el manejo de errores de la aplicación mediante `src/middleware/errorHandler.js`.

Se incorporaron vistas personalizadas para los siguientes códigos HTTP:

| Código | Descripción |
|---|---|
| 400 | Solicitud incorrecta. |
| 403 | Acceso prohibido. |
| 404 | Recurso o ruta no encontrados. |
| 500 | Error interno del servidor. |

Las vistas correspondientes se encuentran en `views/errores/`. Los mensajes presentados al usuario evitan exponer detalles técnicos internos de la aplicación.

### Estilos de usuarios, roles y errores

Se incorporaron hojas de estilo externas para mantener separada la presentación de la lógica de las vistas:

- `public/css/usuarios-roles.css`: contiene los estilos de las pantallas de administración de usuarios y roles.
- `public/css/errores.css`: contiene los estilos de las páginas de error.

Los estilos se mantienen en archivos externos para respetar la política de seguridad de contenido configurada para la aplicación.

## Pruebas automatizadas

El proyecto contempla pruebas automatizadas para verificar el comportamiento de los mecanismos de autorización y seguridad.

### Pruebas del backend con Node.js

El repositorio contiene pruebas para los middleware de roles y permisos.

Para ejecutarlas:

```powershell
node --test .\tests\middleware.test.js
```

#### Casos cubiertos

| Caso | Resultado esperado |
|---|---|
| Usuario con el permiso requerido | Permite continuar. |
| Usuario sin el permiso requerido | Responde con HTTP 403. |
| Solicitud sin usuario | Responde con HTTP 403. |
| Usuario con el rol requerido | Permite continuar. |
| Usuario con un rol no autorizado | Responde con HTTP 403. |
| Usuario con uno de varios roles permitidos | Permite continuar. |
| Solicitud sin usuario al validar el rol | Responde con HTTP 403. |

**Resultado de la ejecución previamente verificada:**

```text
tests 7
pass 7
fail 0
```

Estas pruebas verifican el comportamiento de los middleware de autorización ante usuarios autorizados, usuarios sin permisos, roles no autorizados y solicitudes sin usuario autenticado.

### Pruebas funcionales de usuarios y roles

Se realizaron verificaciones funcionales de las restricciones de usuarios, roles y permisos, incluyendo los siguientes casos:

| Caso | Verificación | Resultado esperado |
|---|---|---|
| TC-06 | Un usuario Auditor intenta acceder directamente a la administración de roles. | Acceso rechazado mediante HTTP 403. |
| TC-07 | Un usuario Taquillero intenta realizar directamente una operación de eliminación de usuarios. | Operación rechazada mediante HTTP 403. |

También se verificaron las restricciones de protección de los roles principales, la eliminación de cuentas y el funcionamiento de la administración de permisos.

### Pruebas de seguridad con Java

La suite de pruebas de seguridad (UTN-10) usa Java 17, Maven, JUnit 5 y el cliente HTTP de Java. Está en la carpeta `tests/`, con su propio `pom.xml`, y prueba el sistema como lo haría un usuario o un atacante: enviando solicitudes HTTP a la aplicación en ejecución.

**Requisitos:** Java 17 o superior, Maven, y la aplicación en ejecución con la base de datos creada y los datos iniciales cargados.

Para ejecutar la suite con un solo comando:

1. En una terminal, desde la raíz del proyecto, iniciar la aplicación:

```powershell
npm run dev
```

2. En otra terminal:

```powershell
cd tests
mvn test
```

Para probar un sistema distinto del local, por ejemplo el publicado:

```powershell
$env:BASE_URL = "https://direccion-del-sistema"
mvn test
```

Las pruebas inician sesión con los usuarios de prueba del `seed.sql`. La prueba TC-05 espera más de 60 segundos para comprobar el cierre de sesión por inactividad, por lo que la suite completa tarda poco más de un minuto.

**Reporte automático:** al terminar, Maven Surefire genera un reporte XML por clase en `tests/target/surefire-reports/`. Esta carpeta no se sube al repositorio.

**Datos de prueba:** las pruebas XSS pueden crear registros ficticios (por ejemplo un evento, un rol o un usuario con texto malicioso) en la base de datos y no los eliminan al terminar. Deben ejecutarse en una base de desarrollo o de pruebas.

#### Casos cubiertos

| Caso | Categoría | Qué se comprueba | Clase |
|---|---|---|---|
| TC-01 | SQL Injection | Inicio de sesión con `' OR '1'='1` en el usuario. Acceso denegado. | `InyeccionSqlTest` |
| TC-02 | SQL Injection | Búsqueda con `' UNION SELECT ... --`. No se exponen datos. | `InyeccionSqlTest` |
| TC-03 | XSS reflejado | `<script>alert(1)</script>` en un parámetro de la URL. No aparece sin escapar. | `SeguridadTest` |
| TC-04 | XSS almacenado | `<img src=x onerror=alert(1)>` en un campo de texto. Se muestra escapado. | `SeguridadTest` |
| TC-04b | XSS almacenado | Payload en el lugar de un evento. | `XssCamposTest` |
| TC-04c | XSS reflejado | Payload en el buscador de eventos (`/eventos?q=`). | `XssCamposTest` |
| TC-04d | XSS almacenado | Payload en el nombre de un rol. | `XssCamposTest` |
| TC-04e | XSS almacenado | Payload en los datos de un usuario. | `XssCamposTest` |
| TC-04f | XSS almacenado | Payload en el registro de auditoría (usuario de un inicio de sesión fallido). | `XssCamposTest` |
| TC-05 | Sesión | La sesión se cierra tras más de 60 segundos de inactividad. | `AutenticacionTest` |
| TC-06 | Control de acceso | El Auditor entra por URL a la gestión de roles y recibe HTTP 403. | `ControlAccesoTest` |
| TC-07 | Control de acceso | El Taquillero intenta borrar un usuario por la API y recibe HTTP 403. | `ControlAccesoTest` |
| TC-08 | CSRF | Un formulario que modifica datos sin token es rechazado. | `AutenticacionTest` |
| TC-09 | Cookies | La cookie de sesión es HttpOnly y no contiene datos sensibles. | `AutenticacionTest` |
| TC-10 | Encabezados HTTP | La respuesta incluye `Content-Security-Policy`, `X-Frame-Options` y `X-Content-Type-Options`. | `SeguridadTest` |

**Resultado de la última ejecución verificada:**

```text
AutenticacionTest   Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
ControlAccesoTest   Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
InyeccionSqlTest    Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
SeguridadTest       Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
XssCamposTest       Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
Total               Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Los resultados deben interpretarse según el reporte generado en cada ejecución, diferenciando las pruebas ejecutadas, aprobadas, fallidas y omitidas.

## Organización del equipo

| Bloque de trabajo | Requerimientos | Responsable |
|---|---|---|
| Base de datos, autenticación, sesiones, CSRF y auditoría | UTN-01, UTN-02, UTN-07c, UTN-07d, UTN-09 | Emily Alfaro González |
| Usuarios, roles y permisos | UTN-04, UTN-05, UTN-06 | Katlyn Fernández Ramos |
| Eventos, ventas, reglas de negocio y SQL Injection | UTN-03, RFD, UTN-07a | Yesenia Pérez Rodríguez |
| XSS, encabezados HTTP, pruebas de seguridad, validación de entradas en la puerta, reporte de ventas y documentación técnica | UTN-07b, UTN-08, UTN-10, RFD-7.5 | Melanni Michel Díaz Ugalde |

## Estado de implementación

El proyecto se encuentra en desarrollo e integración por ramas.

Entre los componentes implementados e integrados en la versión de trabajo se encuentran:

- Configuración de Express y conexión con PostgreSQL mediante Sequelize.
- Modelos y asociaciones de usuarios, roles y permisos.
- Rutas y vistas para administrar usuarios y roles.
- Validaciones de usuarios, incluyendo identificación de nueve dígitos y prevención de registros duplicados.
- Restricciones de acceso a la administración de usuarios, roles y permisos para el rol SuperAdmin.
- Protecciones para impedir la eliminación de la propia cuenta o del último SuperAdmin.
- Protección de los tres roles principales: SuperAdmin, Auditor y Taquillero.
- Administración de permisos asociados a los roles.
- Middleware para validar sesiones, roles y permisos.
- Manejo centralizado de errores HTTP 400, 403, 404 y 500.
- Vistas personalizadas para los errores HTTP 400, 403, 404 y 500.
- Estilos externos para las vistas de usuarios, roles y páginas de error.
- Autenticación y gestión de sesiones.
- Protección contra solicitudes CSRF.
- Configuración de encabezados HTTP de seguridad mediante Helmet.
- Utilidades para generar y verificar hashes de contraseñas.
- Funcionalidades de auditoría.
- Pruebas automatizadas de los middleware de autorización.
- Suite de pruebas de seguridad con Java, Maven y JUnit 5 (15 casos, ejecutables con `mvn test`).
- Validación de entradas en la puerta (RFD-7.5) con su pantalla.
- Reporte de ventas por evento con el permiso `ver_reportes`.
- Confirmación antes de eliminar usuarios y roles, sin scripts incrustados.
- Revisión de las vistas contra XSS y pruebas funcionales y automatizadas de escape de salida.
- Gestión de eventos (listar con búsqueda, ver, crear, editar, eliminar y publicar) con validación en el servidor.
- Venta de entradas con las reglas RN-7.1 a RN-7.3, control de cupo y códigos aleatorios únicos.
- Anulación de compras con devolución del cupo.
- Visualización parcial de correos y códigos de entrada.
- Revisión de SQL Injection de todo el repositorio.
- Páginas de error 404 en las rutas de eventos y compras.

Pendiente: la comprobación del encabezado `Strict-Transport-Security` requiere un entorno con HTTPS, y la plataforma de publicación aún no está definida.

La implementación continúa sujeta a integración, validación funcional y pruebas de los distintos módulos. La presencia de una dependencia o archivo en el repositorio no demuestra por sí sola que todos los escenarios de la funcionalidad estén completamente probados.

## Seguridad del repositorio

Para mantener la seguridad de la aplicación y del entorno de desarrollo se deben considerar las siguientes medidas:

- El archivo `.env` contiene configuración privada y no debe subirse al repositorio.
- Se proporciona `.env.example` como referencia para configurar el entorno.
- Los datos utilizados para pruebas deben ser ficticios.
- Las contraseñas deben almacenarse mediante hashes seguros y nunca en texto plano.
- No se deben registrar contraseñas, tokens CSRF ni información sensible en los mensajes de auditoría.
- Las rutas protegidas deben validar los permisos y roles correspondientes desde el backend.
- Los scripts de inicialización de la base de datos deben utilizarse únicamente en entornos de desarrollo o pruebas.
- La publicación de la aplicación debe realizarse mediante HTTPS y con una configuración segura de las cookies y sesiones.

## Publicación

La plataforma de publicación se encuentra pendiente de definición.

La configuración de producción deberá contemplar el uso de HTTPS, variables de entorno seguras, protección de sesiones y una base de datos configurada para el entorno correspondiente.