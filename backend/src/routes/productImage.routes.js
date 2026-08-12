import { Router } from "express";

import {
  addProductImage,
  deleteProductImage,
  getProductImages,
  setProductMainImage,
} from "../controllers/productImage.controller.js";

import { uploadProductImage } from "../middlewares/upload.middleware.js";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";

const router = Router({
  mergeParams: true,
});

// Públicas
router.get("/", getProductImages);

// Solo Admin
router.post("/", authenticate, authorizeAdmin, uploadProductImage, addProductImage);
router.patch("/:imageId/main", authenticate, authorizeAdmin, setProductMainImage);
router.delete("/:imageId", authenticate, authorizeAdmin, deleteProductImage);

export default router;
