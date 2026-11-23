const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Texto del formulario: sin espacios en los extremos. Lo que no sea texto
// (por ejemplo un arreglo) se trata como "no enviado".
function limpiarTexto(valor) {
  return typeof valor === "string" ? valor.trim() : null;
}

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
      set(valor) {
        this.setDataValue("nombre", limpiarTexto(valor));
      },
      validate: {
        notNull: { msg: "El nombre es obligatorio" },
        notEmpty: { msg: "El nombre es obligatorio" },
        len: {
          args: [0, 100],
          msg: "El nombre debe tener máximo 100 caracteres",
        },
      },
    },

    correo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      set(valor) {
        this.setDataValue("correo", limpiarTexto(valor));
      },
      validate: {
        notNull: { msg: "El correo es obligatorio" },
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
      // Un campo opcional vacío del formulario llega como "": se guarda como null
      set(valor) {
        const limpio =
          valor === null || valor === undefined ? null : String(valor).trim();
        this.setDataValue("telefono", limpio === "" ? null : limpio);
      },
      validate: {
        len: {
          args: [1, 30],
          msg: "El teléfono debe tener entre 1 y 30 dígitos",
        },
        is: {
          args: /^\d+$/,
          msg: "El teléfono solo puede tener números",
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
