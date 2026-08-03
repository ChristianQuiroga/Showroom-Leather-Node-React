import express from "express";

import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Showroom Leather API funcionando correctamente",
  });
});


// Debe ir después de todas las rutas existentes.
app.use(notFoundHandler);

// Debe ser el último middleware.
app.use(errorHandler);

export default app;
