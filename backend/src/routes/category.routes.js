import { Router } from "express";

import {
  activateCategory,
  createCategory,
  deactivateCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";

import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

// Públicas
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Solo Admin
router.post("/", authenticate, authorizeAdmin, createCategory);
router.put("/:id", authenticate, authorizeAdmin, updateCategory);
router.delete("/:id", authenticate, authorizeAdmin, deactivateCategory);
router.patch("/:id/activate", authenticate, authorizeAdmin, activateCategory);

export default router;
