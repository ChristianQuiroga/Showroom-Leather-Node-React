import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token no proporcionado", 401);
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError("Formato de token inválido", 401);
    }

    const decoded = jwt.verify(token, env.jwt.secret);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Token inválido", 401));
    }

    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expirado", 401));
    }

    next(error);
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Usuario no autenticado", 401));
  }

  if (req.user.role !== "admin") {
    return next(
      new AppError("No tiene permisos para realizar esta acción", 403)
    );
  }

  next();
};