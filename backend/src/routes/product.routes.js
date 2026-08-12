import { Router } from "express";

import {
  createProduct,
  deactivateProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";

import productImageRoutes from "./productImage.routes.js";

import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.use("/:productId/images", productImageRoutes);

// Públicas
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Solo Admin
router.post("/", authenticate, authorizeAdmin, createProduct);
router.put("/:id", authenticate, authorizeAdmin, updateProduct);
router.delete("/:id", authenticate, authorizeAdmin, deactivateProduct);

export default router;
