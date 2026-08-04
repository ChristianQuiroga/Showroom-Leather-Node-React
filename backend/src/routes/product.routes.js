import { Router } from "express";

import {
  createProduct,
  deactivateProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller.js";

import productImageRoutes from "./productImage.routes.js";

const router = Router();

router.use("/:productId/images", productImageRoutes);

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deactivateProduct);

export default router;
