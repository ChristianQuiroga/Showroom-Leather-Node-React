import { Router } from "express";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);

export default router;