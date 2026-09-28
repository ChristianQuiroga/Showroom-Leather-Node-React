import express from "express";
import cors from "cors"; // Importa el paquete cors para habilitar CORS en la aplicación

import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import env from "./config/env.js";
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

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);

app.get("/api/contact", (req, res) => {
  const phone = String(env.whatsapp.phone || "").replace(/\D/g, "");
  const message = "Hola, quiero consultar por las prendas del showroom.";
  res.status(200).json({ whatsappUrl: phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : null });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Debe ir después de todas las rutas existentes.
app.use(notFoundHandler);
// Debe ser el último middleware.
app.use(errorHandler);

export default app;
