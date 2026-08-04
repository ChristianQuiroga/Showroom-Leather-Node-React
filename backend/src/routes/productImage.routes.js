import { Router } from "express";

import {
  addProductImage,
  deleteProductImage,
  getProductImages,
  setProductMainImage,
} from "../controllers/productImage.controller.js";

const router = Router({
  mergeParams: true,
});

router.get("/", getProductImages);
router.post("/", addProductImage);
router.patch("/:imageId/main", setProductMainImage);
router.delete("/:imageId", deleteProductImage);

export default router;
