const errorHandler = (err, req, res, next) => {
  // Si la respuesta ya comenzó, se deja que Express gestione el error.
  if (res.headersSent) {
    return next(err);
  }

  // Determinar el código de estado del error.
  const status = [403, 404, 500].includes(err.status || err.statusCode)
    ? err.status || err.statusCode
    : 500;

  // Seleccionar la página correspondiente.
  const paginas = {
    403: "errores/403",
    404: "errores/404",
    500: "errores/500",
  };

  // Registrar el error en el servidor.
  console.error(
    `[${err.name}] ${err.message} - ${(err.stack || "").split("\n")[1]?.trim()}`,
  );

  // Mostrar la página de error correspondiente.
  res.status(status).render(paginas[status], {
    mensaje:
      status === 500
        ? "Ha ocurrido un error interno del servidor."
        : err.message,
  });
};

module.exports = errorHandler;
