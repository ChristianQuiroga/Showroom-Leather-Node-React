import { Router } from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);

export default router;
