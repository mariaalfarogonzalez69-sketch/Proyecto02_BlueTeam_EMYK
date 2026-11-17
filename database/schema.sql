-- ============================================================
-- schema.sql: Proyecto02_BlueTeam_EMYK (Dominio 7: venta de entradas)
-- PostgreSQL. Ejecutar en el Query Tool conectado a la BD del proyecto.
-- ATENCIÓN: borra y recrea las tablas (solo para desarrollo).
-- ============================================================

DROP TABLE IF EXISTS auditoria    CASCADE;
DROP TABLE IF EXISTS entradas     CASCADE;
DROP TABLE IF EXISTS compras      CASCADE;
DROP TABLE IF EXISTS compradores  CASCADE;
DROP TABLE IF EXISTS eventos      CASCADE;
DROP TABLE IF EXISTS usuarios     CASCADE;
DROP TABLE IF EXISTS rol_permiso  CASCADE;
DROP TABLE IF EXISTS permisos     CASCADE;
DROP TABLE IF EXISTS roles        CASCADE;

-- ---------- Seguridad: roles y permisos (UTN-05, UTN-06) ----------
CREATE TABLE roles (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE permisos (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(30) NOT NULL UNIQUE
            CHECK (nombre IN ('crear', 'editar', 'borrar', 'ver_reportes'))
);

-- Los permisos se asignan a roles, nunca a usuarios
CREATE TABLE rol_permiso (
    rol_id      INT NOT NULL REFERENCES roles(id)    ON DELETE CASCADE,
    permiso_id  INT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- ---------- Usuarios (UTN-02, UTN-04) ----------
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(100) NOT NULL,          -- hash bcrypt, nunca texto plano
    correo          VARCHAR(120) NOT NULL UNIQUE,
    nombre          VARCHAR(100) NOT NULL,
    identificacion  VARCHAR(30)  NOT NULL UNIQUE,
    rol_id          INT NOT NULL REFERENCES roles(id),  -- sin ON DELETE: no se borra un rol con usuarios
    ultimo_login    TIMESTAMPTZ,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Dominio 7 ----------
CREATE TABLE eventos (
    id                 SERIAL PRIMARY KEY,
    codigo             VARCHAR(20) NOT NULL UNIQUE
                       CHECK (codigo ~ '^[A-Za-z0-9]+$'),      -- alfanumérico
    nombre             VARCHAR(120) NOT NULL,
    lugar              VARCHAR(120) NOT NULL,
    fecha              TIMESTAMPTZ  NOT NULL,
    capacidad          INT NOT NULL CHECK (capacidad > 0),
    entradas_vendidas  INT NOT NULL DEFAULT 0 CHECK (entradas_vendidas >= 0),
    precio             NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    publicado          BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK (entradas_vendidas <= capacidad)                     -- RFD-7.3: la BD también protege el cupo
);

-- Dato sensible del dominio
CREATE TABLE compradores (
    id        SERIAL PRIMARY KEY,
    nombre    VARCHAR(100) NOT NULL,
    correo    VARCHAR(120) NOT NULL,
    telefono  VARCHAR(30)
);

CREATE TABLE compras (
    id            SERIAL PRIMARY KEY,
    evento_id     INT NOT NULL REFERENCES eventos(id),
    comprador_id  INT NOT NULL REFERENCES compradores(id),
    cantidad      INT NOT NULL CHECK (cantidad BETWEEN 1 AND 6),  -- RN-7.2
    total         NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado        VARCHAR(10) NOT NULL DEFAULT 'activa'
                  CHECK (estado IN ('activa', 'anulada')),
    fecha_hora    TIMESTAMPTZ NOT NULL DEFAULT now(),
    vendida_por   INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Una fila por entrada; el código también es dato sensible
CREATE TABLE entradas (
    id         SERIAL PRIMARY KEY,
    compra_id  INT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    codigo     VARCHAR(64) NOT NULL UNIQUE,    -- RN-7.3: código único
    usada      BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_uso  TIMESTAMPTZ
);

-- ---------- Auditoría (UTN-09) ----------
CREATE TABLE auditoria (
    id                  SERIAL PRIMARY KEY,
    tipo_evento         VARCHAR(30) NOT NULL
                        CHECK (tipo_evento IN ('login_ok', 'login_fallido', 'cambio_rol',
                                               'cambio_permisos', 'acceso_403')),
    usuario_id          INT REFERENCES usuarios(id) ON DELETE SET NULL,  -- nulo si el login falló
    username_intentado  VARCHAR(50),
    ip                  VARCHAR(45),
    ruta                VARCHAR(200),
    detalle             TEXT,                  -- nunca contraseñas, tokens ni códigos de entrada
    fecha_hora          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para las consultas más frecuentes
CREATE INDEX idx_compras_evento    ON compras(evento_id);
CREATE INDEX idx_entradas_compra   ON entradas(compra_id);
CREATE INDEX idx_auditoria_fecha   ON auditoria(fecha_hora DESC);