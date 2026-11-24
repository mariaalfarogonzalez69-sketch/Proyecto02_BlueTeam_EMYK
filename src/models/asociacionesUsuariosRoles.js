
const Usuario = require('./Usuario');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const RolPermiso = require('./RolPermiso');

// Un usuario pertenece a un rol.
Rol.hasMany(Usuario, {
    as: 'Usuarios',
    foreignKey: 'rol_id'
});

Usuario.belongsTo(Rol, {
    as: 'Rol',
    foreignKey: 'rol_id'
});

// Relación muchos a muchos entre roles y permisos.
Rol.belongsToMany(Permiso, {
    as: 'Permisos',
    through: RolPermiso,
    foreignKey: 'rol_id',
    otherKey: 'permiso_id'
});

Permiso.belongsToMany(Rol, {
    as: 'Roles',
    through: RolPermiso,
    foreignKey: 'permiso_id',
    otherKey: 'rol_id'
});

module.exports = {
    Usuario,
    Rol,
    Permiso,
    RolPermiso
};
