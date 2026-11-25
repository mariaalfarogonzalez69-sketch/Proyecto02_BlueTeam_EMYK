
// Encargada: Katlyn Fernández Ramos
// Este modelo representa la tabla intermedia que relaciona los roles con sus permisos.

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RolPermiso = sequelize.define('RolPermiso', {
    rol_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    },
    permiso_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false
    }
}, {
    tableName: 'rol_permiso',
    timestamps: false
});

module.exports = RolPermiso;
