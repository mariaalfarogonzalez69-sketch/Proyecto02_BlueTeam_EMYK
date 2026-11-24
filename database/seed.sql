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

-- Auditor: solo ver reportes
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Auditor' AND p.nombre = 'ver_reportes';

-- Taquillero: crear, editar y borrar; NO ve reportes
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p
WHERE r.nombre = 'Taquillero' AND p.nombre IN ('crear', 'editar', 'borrar');

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
VALUES ('Carlos Comprador', 'carlos@example.com', '88880000');

-- ============================================================
-- Compras y entradas de prueba (TODO FICTICIO)
--
-- Regla de coherencia: para cada evento,
--   entradas_vendidas = suma de "cantidad" de sus compras ACTIVAS
--   y cada compra tiene tantas filas en "entradas" como su "cantidad".
-- Los códigos de entrada de este seed son de prueba y predecibles (se derivan
-- de un md5 fijo); los códigos REALES los genera la aplicación con crypto.
-- ============================================================

-- ---------- Más compradores ficticios (Carlos ya existe) ----------
INSERT INTO compradores (nombre, correo, telefono) VALUES
 ('Marta Ejemplo', 'marta@example.com', '88881111'),
 ('Luis Prueba',   'luis@example.com',  '88882222'),
 ('Ana Ficticia',  'ana@example.com',   NULL),
 ('Pedro Demo',    'pedro@example.com', '88883333');

-- ---------- Compras con pocas filas (se escriben a mano) ----------
-- vendida_por: la taquillera de prueba. total = cantidad * precio del evento.
INSERT INTO compras (evento_id, comprador_id, cantidad, total, estado, fecha_hora, vendida_por)
VALUES
 -- CONC001 (25000): dos compras activas y una ANULADA (para probar anulación)
 ((SELECT id FROM eventos WHERE codigo = 'CONC001'),
  (SELECT id FROM compradores WHERE correo = 'carlos@example.com'),
  2, 50000, 'activa',  now() - interval '3 days', (SELECT id FROM usuarios WHERE username = 'taquillero')),
 ((SELECT id FROM eventos WHERE codigo = 'CONC001'),
  (SELECT id FROM compradores WHERE correo = 'marta@example.com'),
  3, 75000, 'activa',  now() - interval '2 days', (SELECT id FROM usuarios WHERE username = 'taquillero')),
 ((SELECT id FROM eventos WHERE codigo = 'CONC001'),
  (SELECT id FROM compradores WHERE correo = 'luis@example.com'),
  1, 25000, 'anulada', now() - interval '1 day',  (SELECT id FROM usuarios WHERE username = 'taquillero')),

 -- CONC002 (18000)
 ((SELECT id FROM eventos WHERE codigo = 'CONC002'),
  (SELECT id FROM compradores WHERE correo = 'ana@example.com'),
  4, 72000, 'activa',  now() - interval '2 days', (SELECT id FROM usuarios WHERE username = 'taquillero')),

 -- CONC005 (15000)
 ((SELECT id FROM eventos WHERE codigo = 'CONC005'),
  (SELECT id FROM compradores WHERE correo = 'pedro@example.com'),
  6, 90000, 'activa',  now() - interval '4 days', (SELECT id FROM usuarios WHERE username = 'taquillero')),
 ((SELECT id FROM eventos WHERE codigo = 'CONC005'),
  (SELECT id FROM compradores WHERE correo = 'carlos@example.com'),
  2, 30000, 'activa',  now() - interval '1 day',  (SELECT id FROM usuarios WHERE username = 'taquillero')),

 -- CONC010 (14000, evento PASADO): se vendió antes de que pasara
 ((SELECT id FROM eventos WHERE codigo = 'CONC010'),
  (SELECT id FROM compradores WHERE correo = 'marta@example.com'),
  2, 28000, 'activa',  now() - interval '15 days', (SELECT id FROM usuarios WHERE username = 'taquillero'));

-- ---------- CONC009 (9000): casi agotado, 78 de 80 ----------
-- 13 compras de 6 entradas = 78. generate_series genera los números 1 a 13
-- y se reparten entre los 5 compradores con el resto de la división (n % 5).
INSERT INTO compras (evento_id, comprador_id, cantidad, total, estado, fecha_hora, vendida_por)
SELECT
  (SELECT id FROM eventos WHERE codigo = 'CONC009'),
  (SELECT id FROM compradores ORDER BY id OFFSET (n % 5) LIMIT 1),
  6, 54000, 'activa', now() - (n || ' hours')::interval,
  (SELECT id FROM usuarios WHERE username = 'taquillero')
FROM generate_series(1, 13) AS n;

-- ---------- Una entrada por cada unidad de cada compra ----------
-- Para cada compra se generan "cantidad" filas con un código de prueba único.
INSERT INTO entradas (compra_id, codigo)
SELECT c.id, upper(substr(md5('seed-' || c.id || '-' || k), 1, 16))
FROM compras c
CROSS JOIN LATERAL generate_series(1, c.cantidad) AS k;

-- Una entrada ya USADA (del evento pasado) para probar la validación en puerta
UPDATE entradas
SET usada = TRUE, fecha_uso = now() - interval '10 days'
WHERE id = (
  SELECT MIN(en.id)
  FROM entradas en
  JOIN compras c  ON c.id  = en.compra_id
  JOIN eventos ev ON ev.id = c.evento_id
  WHERE ev.codigo = 'CONC010'
);

-- ---------- Cuadrar el cupo con las compras ACTIVAS ----------
-- Así entradas_vendidas nunca queda inventado: sale de las compras.
UPDATE eventos e
SET entradas_vendidas = COALESCE((
  SELECT SUM(c.cantidad)
  FROM compras c
  WHERE c.evento_id = e.id AND c.estado = 'activa'
), 0);