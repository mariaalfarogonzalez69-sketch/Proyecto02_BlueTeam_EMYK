
const errorHandler = (err, req, res, next) => {
  // Si la respuesta ya comenzó, se delega el error a Express.
  if (res.headersSent) {
    return next(err);
  }

  // Determinar el código de estado.
  const status = [400, 403, 404, 500].includes(err.status || err.statusCode)
    ? err.status || err.statusCode
    : 500;

  // Seleccionar la página correspondiente.
  const paginas = {
    403: "errores/403",
    404: "errores/404",
    500: "errores/500",
    400: "errores/400",
  };

  // Mensajes seguros para el usuario.
  const mensajes = {
    403: "No tiene autorización para realizar esta operación.",
    404: "La página solicitada no existe o no está disponible.",
    500: "Ha ocurrido un error interno del servidor.",
    400: "La solicitud contiene datos inválidos o no puede procesarse.",
  };

  // Registrar información técnica únicamente en el servidor.
  console.error(
    `[${err.name}] ${err.message} - ${
      (err.stack || "").split("\n")[1]?.trim()
    }`
  );

  // Mostrar la página correspondiente.
  res.status(status).render(paginas[status], {
    mensaje: err.publicMessage || mensajes[status],
  });
};

module.exports = errorHandler;
