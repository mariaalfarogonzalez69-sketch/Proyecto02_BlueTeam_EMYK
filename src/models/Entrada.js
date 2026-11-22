const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Entrada = sequelize.define(
  "Entrada",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    compra_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "La compra no es válida" },
      },
    },

    codigo: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [1, 64],
          msg: "El código debe tener entre 1 y 64 caracteres",
        },
      },
    },

    usada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    fecha_uso: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: { msg: "La fecha no es válida" },
      },
    },
  },
  {
    tableName: "entradas", // el nombre real de la tabla
    timestamps: false, // la tabla no tiene createdAt ni updatedAt
  },
);

module.exports = Entrada;
