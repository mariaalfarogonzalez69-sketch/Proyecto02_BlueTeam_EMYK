const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Compra = sequelize.define(
  "Compra",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "El evento no es válido" },
      },
    },

    comprador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "El comprador no es válido" },
      },
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "La cantidad debe ser un número entero" },
        min: { args: [1], msg: "La cantidad debe ser mayor al menos 1" },
        max: { args: [6], msg: "La cantidad debe ser menor o igual a 6" },
      },
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "El total debe ser un número" },
        min: { args: [0], msg: "El total no puede ser negativo" },
      },
    },

    estado: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "activa",
      validate: {
        isIn: {
          args: [["activa", "anulada"]],
          msg: "El estado debe ser 'activa' o 'anulada'",
        },
      },
    },

    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: { msg: "La fecha y hora no son válidas" },
      },
    },

    vendida_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "compras", // el nombre real de la tabla
    timestamps: false, // la tabla no tiene createdAt ni updatedAt
  },
);

module.exports = Compra;
