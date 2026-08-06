import { Router } from "express";

import {
  addProductImage,
  deleteProductImage,
  getProductImages,
  setProductMainImage,
} from "../controllers/productImage.controller.js";

import { uploadProductImage } from "../middlewares/upload.middleware.js";

const router = Router({
  mergeParams: true,
});

router.get("/", getProductImages);
router.post("/", uploadProductImage, addProductImage);
router.patch("/:imageId/main", setProductMainImage);
router.delete("/:imageId", deleteProductImage);

export default router;
