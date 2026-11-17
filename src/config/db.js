// Conexión a PostgreSQL con Sequelize.
// Los datos salen de variables de entorno, nunca van escritos en el código.
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // no llenar la consola con cada consulta
  }
);

module.exports = sequelize;