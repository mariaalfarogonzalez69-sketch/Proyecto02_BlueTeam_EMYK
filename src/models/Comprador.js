const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Comprador = sequelize.define(
  "Comprador",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es obligatorio" },
        len: {
          args: [1, 100],
          msg: "El nombre debe tener máximo 100 caracteres",
        },
      },
    },

    correo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El correo es obligatorio" },
        len: {
          args: [1, 120],
          msg: "El correo debe tener máximo 120 caracteres",
        },
        isEmail: { msg: "El correo no es válido" },
      },
    },

    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
      validate: {
        len: {
          args: [1, 30],
          msg: "El teléfono debe tener entre 1 y 30 caracteres",
        },
      },
    },
  },
  {
    tableName: "compradores", // el nombre real de la tabla
    timestamps: false, // la tabla no tiene createdAt ni updatedAt
  },
);

module.exports = Comprador;
