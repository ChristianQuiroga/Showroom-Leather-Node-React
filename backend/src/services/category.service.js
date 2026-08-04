import * as categoryRepository from "../repositories/category.repository.js";
import { AppError } from "../utils/AppError.js";

export const getAllCategories = async () => {
  return categoryRepository.findAll();
};

export const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);

  if (!category) {
    throw new AppError("Categoría no encontrada", 404);
  }

  return category;
};

export const createCategory = async ({ name, description }) => {
  const normalizedName = name?.trim();
  const normalizedDescription = description?.trim() || null;

  if (!normalizedName) {
    throw new AppError("El nombre de la categoría es obligatorio", 400);
  }

  if (normalizedName.length > 100) {
    throw new AppError(
      "El nombre de la categoría no puede superar los 100 caracteres",
      400,
    );
  }

  const existingCategory = await categoryRepository.findByName(normalizedName);

  if (existingCategory) {
    throw new AppError("Ya existe una categoría con ese nombre", 409);
  }

  return categoryRepository.create({
    name: normalizedName,
    description: normalizedDescription,
  });
};
