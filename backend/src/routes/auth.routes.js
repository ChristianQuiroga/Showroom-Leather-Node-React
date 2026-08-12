import { Router } from "express";

import { login, getMe } from "../controllers/auth.controller.js";

import {
  authenticate,
  authorizeAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticate, getMe);
// router.get("/me", authenticate, (req, res) => {
//   res.status(200).json({ user: req.user });
// });

// router.get("/admin-test", authenticate, authorizeAdmin, (req, res) => {
//   res.status(200).json({ message: "Acceso autorizado para administrador" });
// });

export default router;
