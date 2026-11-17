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
```

## Roles del sistema

| Rol | Qué puede hacer |
| --- | --- |
| SuperAdmin | Administra usuarios, roles y permisos, consulta los reportes y el registro de auditoría |
| Auditor | Solo lectura de usuarios y de eventos |
| Taquillero | Administra eventos, vende y anula entradas, valida entradas en la puerta y consulta usuarios en solo lectura |

## Organización del equipo

| Bloque | Requerimientos | Responsable |
| --- | --- | --- |
| Base de datos, autenticación, sesión, CSRF y auditoría | UTN-01, UTN-02, UTN-07c, UTN-07d, UTN-09 | Emily ALfaro González |
| Usuarios, roles y permisos | UTN-04, UTN-05, UTN-06 | Melanni Díaz Ugalde |
| Eventos, ventas, reglas de negocio y SQL Injection | UTN-03, RFD, UTN-07a | Yesenia Pérez Rodríguez |
| XSS, encabezados HTTP, pruebas de seguridad y documento técnico | UTN-07b, UTN-08, UTN-10 | Katlyn Fernández Ramos |

## Descripción de los archivos

###
###
###

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