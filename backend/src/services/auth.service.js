import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

import env from "../config/env.js";

import {
  findUserByEmail,
  findUserById,
} from "../repositories/user.repository.js"; // Importa la función findUserByEmail desde el repositorio de usuarios

import { AppError } from "../utils/AppError.js"; // Importa la clase AppError desde utils/AppError.js

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Credenciales inválidas", 401);
  }

  if (!user.is_active) {
    throw new AppError("Usuario inactivo", 403);
  }

  const passwordIsValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordIsValid) {
    throw new AppError("Credenciales inválidas", 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.expiresIn,
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (!user.is_active) {
    throw new AppError("Usuario inactivo", 403);
  }

  return user;
};
