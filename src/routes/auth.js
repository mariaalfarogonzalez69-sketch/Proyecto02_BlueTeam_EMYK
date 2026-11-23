// Login y logout (UTN-02 y UTN-07c).
const express = require('express');
const bcrypt = require('bcrypt');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/db');
const { verificarPassword } = require('../utils/password');
const { registrarAuditoria } = require('../utils/auditoria');

const router = express.Router();

// El mensaje de error es SIEMPRE el mismo: no revela si el usuario existe
const MENSAJE_ERROR = 'Usuario o contraseña incorrectos';

// Hash falso para comparar cuando el usuario no existe: así la respuesta
// tarda lo mismo y no se puede adivinar qué usuarios existen midiendo el tiempo
const HASH_FALSO = bcrypt.hashSync('relleno-no-es-una-clave', 12);

router.get('/login', (req, res) => {
  if (req.session && req.session.usuario) return res.redirect('/');
  const aviso = req.query.motivo === 'sesion'
    ? 'Tu sesión no es válida o expiró. Inicia sesión de nuevo.' : null;
  res.render('login', { error: null, aviso });
});

router.post('/login', async (req, res, next) => {
  try {
    // Se fuerzan a texto y se limita el largo antes de usarlos
    const username = String(req.body.username || '').trim().slice(0, 50);
    const password = String(req.body.password || '').slice(0, 128);

    // Consulta PARAMETRIZADA (UTN-07a): el valor viaja aparte, nunca pegado al SQL
    const [fila] = await sequelize.query(
      `SELECT u.id, u.username, u.password_hash, r.id AS rol_id, r.nombre AS rol
         FROM usuarios u JOIN roles r ON r.id = u.rol_id
        WHERE u.username = :username`,
      { replacements: { username }, type: QueryTypes.SELECT }
    );

    const ok = await verificarPassword(password, fila ? fila.password_hash : HASH_FALSO);

    if (!fila || !ok) {
      // Nunca se guarda ni se imprime la contraseña
      await registrarAuditoria(req, 'login_fallido', 'credenciales incorrectas', { usernameIntentado: username });
      return res.status(401).render('login', { error: MENSAJE_ERROR, aviso: null });
    }

    // Permisos del rol: se guardan en la sesión del servidor
    const permisos = await sequelize.query(
      `SELECT p.nombre FROM rol_permiso rp
         JOIN permisos p ON p.id = rp.permiso_id
        WHERE rp.rol_id = :rolId`,
      { replacements: { rolId: fila.rol_id }, type: QueryTypes.SELECT }
    );

    // Fecha y hora del último inicio de sesión (la muestra la lista de usuarios, UTN-04)
    await sequelize.query('UPDATE usuarios SET ultimo_login = now() WHERE id = :id',
      { replacements: { id: fila.id } });

    // Se crea una sesión NUEVA al entrar: evita la fijación de sesión
    req.session.regenerate(async (err) => {
      if (err) return next(err);
      req.session.usuario = {
        id: fila.id,
        username: fila.username,
        rol: fila.rol,
        permisos: permisos.map((p) => p.nombre),
      };
      await registrarAuditoria(req, 'login_ok', `usuario: ${fila.username}`);
      req.session.save(() => res.redirect('/'));
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid');
    res.redirect('/login');
  });
});

module.exports = router;