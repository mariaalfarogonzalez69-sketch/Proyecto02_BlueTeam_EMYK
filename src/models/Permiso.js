
// Encargada: Katlyn Fernández Ramos

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permiso = sequelize.define('Permiso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
            isIn: [['crear', 'editar', 'borrar', 'ver_reportes']]
        }
    }
}, {
    tableName: 'permisos',
    timestamps: false
});

module.exports = Permiso;
