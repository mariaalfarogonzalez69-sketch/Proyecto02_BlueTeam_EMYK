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
| Selenium | Automatización de pruebas de la aplicación web |

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
│   └── css/
│       ├── eventos-compras.css
│       └── sesion.css
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
│   │   ├── roles.js
│   │   └── usuarios.js
│   │
│   └── utils/
│       ├── auditoria.js
│       ├── password.js
│       └── reglas de negocio
│
├── tests/
│   ├── middleware.test.js
│   └── src/
│       └── test/
│           └── java/
│               └── seguridad/
│                   └── AutenticacionTest.java
│
├── views/
│   ├── index.ejs
│   ├── auditoria.ejs
│   ├── login.ejs
│   │
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
├── pom.xml
└── README.md
```

> La estructura representa los componentes principales del proyecto. Algunos archivos y subdirectorios pueden variar conforme avance la integración de los módulos.

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
| `errorHandler.js` | Centraliza el manejo de errores de la aplicación y evita exponer información interna innecesaria. |

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
| `eventos.js` | Gestiona las operaciones relacionadas con los eventos. |
| `compras.js` | Gestiona las operaciones relacionadas con la compra y administración de entradas. |
| `usuarios.js` | Implementa el listado, creación, edición y eliminación de usuarios. Incluye validaciones y restricciones para proteger las cuentas administrativas. |
| `roles.js` | Implementa la consulta, creación y edición de roles, así como la asignación de permisos. Restringe las operaciones administrativas al rol SuperAdmin. |

La administración de usuarios incluye restricciones adicionales para impedir que un SuperAdmin elimine su propia cuenta o elimine al último SuperAdmin disponible en el sistema.

### Utilidades

| Archivo | Descripción |
|---|---|
| `password.js` | Proporciona las funciones `hashPassword` y `verificarPassword` para generar y comprobar hashes de contraseñas mediante bcrypt con costo 12. |
| `auditoria.js` | Expone la función `registrarAuditoria` para registrar los eventos relevantes de seguridad y operaciones administrativas. |

### Vistas

Las vistas están desarrolladas con EJS:

- `views/index.ejs`: página principal de la aplicación.
- `views/login.ejs`: formulario de inicio de sesión.
- `views/auditoria.ejs`: pantalla para consultar los registros de auditoría.
- `views/usuarios/`: pantallas para consultar, crear y editar usuarios.
- `views/roles/`: pantallas para consultar, crear y editar roles.
- `views/errores/403.ejs`: muestra el mensaje de acceso denegado cuando un usuario intenta acceder a una operación no autorizada.
- `views/errores/404.ejs`: muestra el mensaje para rutas o recursos no encontrados.
- `views/errores/500.ejs`: muestra un mensaje seguro para errores internos del servidor.

### Archivos estáticos

La carpeta `public/css/` contiene las hojas de estilo de la aplicación. Los estilos se mantienen en archivos externos para evitar estilos en línea y respetar las políticas de seguridad de contenido configuradas.

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

Los valores concretos deben revisarse en `.env.example`, ya que este archivo representa las variables requeridas por la configuración del proyecto.

**Nunca se deben compartir ni subir al repositorio los valores privados del archivo `.env`.**

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

Las operaciones de administración de usuarios, roles y permisos están restringidas adicionalmente al rol `SuperAdmin`, independientemente de los permisos CRUD.

La autorización se valida en el backend mediante middleware, por lo que no depende únicamente de ocultar o mostrar opciones en las vistas.

La administración de usuarios también contempla restricciones para impedir la eliminación de la propia cuenta y la eliminación del último SuperAdmin disponible.

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

### Pruebas automatizadas con Java

El proyecto también contempla pruebas de seguridad utilizando Java 17, Maven, JUnit 5 y Selenium.

La estructura de pruebas Java se encuentra dentro de la carpeta `tests/`.

Para ejecutar esta suite, se debe utilizar Maven desde el directorio donde se encuentra el archivo `pom.xml`:

```powershell
mvn test
```

Los resultados de esta suite deben interpretarse según el informe generado por Maven, diferenciando las pruebas ejecutadas, aprobadas, fallidas y omitidas.

## Organización del equipo

| Bloque de trabajo | Requerimientos | Responsable |
|---|---|---|
| Base de datos, autenticación, sesiones, CSRF y auditoría | UTN-01, UTN-02, UTN-07c, UTN-07d, UTN-09 | Emily Alfaro González |
| Usuarios, roles y permisos | UTN-04, UTN-05, UTN-06 | Katlyn Fernández Ramos |
| Eventos, ventas, reglas de negocio y SQL Injection | UTN-03, RFD, UTN-07a | Yesenia Pérez Rodríguez |
| XSS, encabezados HTTP, pruebas de seguridad y documentación técnica | UTN-07b, UTN-08, UTN-10 | Melanni Michel Díaz Ugalde |

## Estado de implementación

El proyecto se encuentra en desarrollo e integración por ramas.

Entre los componentes implementados e integrados en la versión de trabajo se encuentran:

- Configuración de Express y conexión con PostgreSQL mediante Sequelize.
- Modelos y asociaciones de usuarios, roles y permisos.
- Rutas y vistas para administrar usuarios y roles.
- Middleware para validar sesiones, roles y permisos.
- Restricciones de acceso a la administración de usuarios, roles y permisos para el rol SuperAdmin.
- Protecciones para impedir la eliminación de la propia cuenta o del último SuperAdmin.
- Autenticación y gestión de sesiones.
- Protección contra solicitudes CSRF.
- Configuración de encabezados HTTP de seguridad mediante Helmet.
- Vistas de error para respuestas HTTP 403, 404 y 500.
- Utilidades para generar y verificar hashes de contraseñas.
- Funcionalidades de auditoría.
- Pruebas automatizadas de los middleware de autorización.
- Estructura de pruebas de seguridad con Java y Maven.

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