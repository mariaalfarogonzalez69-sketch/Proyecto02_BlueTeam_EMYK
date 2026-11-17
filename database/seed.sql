-- ============================================================
-- seed.sql: datos de ejemplo (TODOS FICTICIOS). Ejecutar DESPUÉS de schema.sql.
-- ============================================================

-- Se puede correr varias veces: vacía las tablas y reinicia los ids
TRUNCATE auditoria, entradas, compras, compradores, eventos,
         usuarios, rol_permiso, permisos, roles RESTART IDENTITY CASCADE;

-- ---------- Roles y permisos (UTN-05, UTN-06) ----------
INSERT INTO roles (nombre) VALUES ('SuperAdmin'), ('Auditor'), ('Taquillero');
INSERT INTO permisos (nombre) VALUES ('crear'), ('editar'), ('borrar'), ('ver_reportes');

-- SuperAdmin: todos los permisos
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'SuperAdmin';

-- Auditor: solo ver reportes (propuesta, falta confirmar con el equipo)
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Auditor' AND p.nombre = 'ver_reportes';

-- Taquillero: crear, editar, borrar y ver reportes (propuesta)
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'Taquillero';

-- ---------- Usuarios de prueba (uno por rol) ----------
-- Las contraseñas están hasheadas con bcrypt (costo 12); las claves de prueba van en el README
INSERT INTO usuarios (username, password_hash, correo, nombre, identificacion, rol_id)
VALUES
 ('superadmin', '$2b$12$nKQQU.eZkw7nSrwDMkGeIeKy2HSIV/3vxm.LlmpgXf5v2SgWb8982', 'superadmin@example.com', 'Sara Superadmin', '1-1111-1111',
    (SELECT id FROM roles WHERE nombre = 'SuperAdmin')),
 ('auditor',    '$2b$12$WqNLrDTk/4HIZgX6Gr0RXuQ.A5rER0IFun5k/n3y2Gwj74/PSuNkG',    'auditor@example.com',    'Aldo Auditor',    '2-2222-2222',
    (SELECT id FROM roles WHERE nombre = 'Auditor')),
 ('taquillero', '$2b$12$.9AihESauuH9SoZdKAr.b.302pyv13d8zphwOMWQRber6b5GJj6aG', 'taquillero@example.com', 'Tania Taquillera', '3-3333-3333',
    (SELECT id FROM roles WHERE nombre = 'Taquillero'));

-- ---------- Eventos de ejemplo (fechas relativas a hoy) ----------
INSERT INTO eventos (codigo, nombre, lugar, fecha, capacidad, entradas_vendidas, precio, publicado) VALUES
 ('CONC001', 'Concierto Rock Nacional',      'Estadio Nacional',     now() + interval '20 days',  500, 0,  25000, TRUE),
 ('CONC002', 'Noche de Jazz',                'Teatro Melico Salazar', now() + interval '25 days', 200, 0,  18000, TRUE),
 ('CONC003', 'Festival Electrónico',         'Parque Viva',          now() + interval '40 days', 1000, 0,  30000, TRUE),
 ('CONC004', 'Recital de Piano',             'Teatro Nacional',      now() + interval '15 days',  150, 0,  12000, TRUE),
 ('CONC005', 'Stand Up Comedy',              'Auditorio Nacional',   now() + interval '10 days',  300, 0,  15000, TRUE),
 ('CONC006', 'Noche Latina',                 'Club Social',          now() + interval '30 days',  250, 0,  10000, TRUE),
 ('CONC007', 'Concierto Sinfónico',          'Teatro Popular',       now() + interval '50 days',  400, 0,  20000, FALSE), -- sin publicar
 ('CONC008', 'Festival de Cine al Aire Libre','Plaza de la Cultura', now() + interval '35 days',  600, 0,   5000, FALSE), -- sin publicar
 ('CONC009', 'Concierto Acústico',           'Café Cultural',        now() + interval '12 days',   80, 78, 9000, TRUE),  -- casi agotado (prueba de cupo)
 ('CONC010', 'Gran Final de Banda',          'Anfiteatro',           now() - interval '10 days',  300, 0, 14000, TRUE);  -- evento PASADO (prueba de RN-7.1)

-- ---------- Un comprador ficticio ----------
INSERT INTO compradores (nombre, correo, telefono)
VALUES ('Carlos Comprador', 'carlos@example.com', '8888-0000');