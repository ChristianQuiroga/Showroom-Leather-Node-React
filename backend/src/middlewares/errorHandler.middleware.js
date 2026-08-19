export const errorHandler = (err, req, res, next) => {
  // Errores propios de Multer
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "La imagen supera el tamaño máximo permitido de 5 MB",
      });
    }

    return res.status(400).json({
      status: "error",
      message: "Error al procesar el archivo",
    });
  }

  const statusCode = err.statusCode || 500;

  const isOperationalError = err.name === "AppError";

  const response = {
    status: "error",
    message: isOperationalError ? err.message : "Error interno del servidor",
  };

  if (process.env.NODE_ENV === "development") {
    response.message = err.message || "Error interno del servidor";

    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};
