// Error de una regla de negocio (cantidad inválida, evento pasado, sin cupo...).
// Su mensaje SÍ se le muestra al usuario. Cualquier otro error es inesperado
// y se deja pasar al manejador global (página 500, sin detalles).
class ErrorNegocio extends Error {}

module.exports = ErrorNegocio;
