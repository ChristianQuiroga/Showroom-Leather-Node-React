import * as categoryService from "../services/category.service.js";

export const getAllCategories = async (req, res) => {
  const categories = await categoryService.getAllCategories();

  res.status(200).json({
    status: "success",
    data: categories,
  });
};

export const getCategoryById = async (req, res) => {
  const categoryId = Number(req.params.id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return res.status(400).json({
      status: "error",
      message: "El ID de la categoría no es válido",
    });
  }

  const category = await categoryService.getCategoryById(categoryId);

  res.status(200).json({
    status: "success",
    data: category,
  });
};

export const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({
    status: "success",
    message: "Categoría creada correctamente",
    data: category,
  });
};