// 1. Importar los modelos
const Evento = require('./Evento');
const Comprador = require('./Comprador');
const Compra = require('./Compra');
const Entrada = require('./Entrada');

// 2. Relación: Evento ↔ Compras  (llave: compras.evento_id)
Evento.hasMany(Compra, { foreignKey: 'evento_id' });
Compra.belongsTo(Evento, { foreignKey: 'evento_id' });

// 3. Relación: Comprador ↔ Compras  (llave: compras.comprador_id)
Comprador.hasMany(Compra, { foreignKey: 'comprador_id' });
Compra.belongsTo(Comprador, { foreignKey: 'comprador_id' });

// 4. Relación: Compras ↔ Entradas  (llave: entradas.compra_id)
Compra.hasMany(Entrada, { foreignKey: 'compra_id' });
Entrada.belongsTo(Compra, { foreignKey: 'compra_id' });

// 5. Exportar todo
module.exports = { Evento, Comprador, Compra, Entrada };