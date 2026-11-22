const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Evento = sequelize.define(
  "Evento",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [1, 20],
          msg: "El código debe tener entre 1 y 20 caracteres",
        },
        is: {
          args: /^[A-Za-z0-9]+$/,
          msg: "El código solo puede tener letras y números",
        },
      },
    },

    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre es obligatorio" },
        len: {
          args: [1, 120],
          msg: "El nombre debe tener máximo 120 caracteres",
        },
      },
    },

    lugar: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El lugar es obligatorio" },
        len: {
          args: [1, 120],
          msg: "El lugar debe tener máximo 120 caracteres",
        },
      },
    },

    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "La fecha no es válida" },
      },
    },

    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: { msg: "La capacidad debe ser un número entero" },
        min: { args: [1], msg: "La capacidad debe ser mayor a 0" },
      },
    },

    entradas_vendidas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: { msg: "Las entradas vendidas deben ser un número entero" },
        min: {
          args: [0],
          msg: "Las entradas vendidas no pueden ser negativas",
        },
      },
    },

    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "El precio debe ser un número" },
        min: { args: [0], msg: "El precio no puede ser negativo" },
      },
    },

    publicado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "eventos", // el nombre real de la tabla
    timestamps: false, // la tabla no tiene createdAt ni updatedAt
  },
);

module.exports = Evento;
