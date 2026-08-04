import * as categoryService from "../services/category.service.js";

const parseCategoryId = (id) => {
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return null;
  }

  return categoryId;
};

export const getAllCategories = async (req, res) => {
  const categories = await categoryService.getAllCategories();

  res.status(200).json({
    status: "success",
    data: categories,
  });
};

export const getCategoryById = async (req, res) => {
  const categoryId = parseCategoryId(req.params.id);

  if (!categoryId) {
    return res.status(400).json({
      status: "error",
      message: "El ID de la categoría no es válido",
    });
  }

  const category = await categoryService.getCategoryById(categoryId);

  res.status(200).json({ status: "success", data: category });
};

export const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  res.status(201).json({
    status: "success",
    message: "Categoría creada correctamente",
    data: category,
  });
};

export const updateCategory = async (req, res) => {
  const categoryId = parseCategoryId(req.params.id);

  if (!categoryId) {
    return res.status(400).json({
      status: "error",
      message: "El ID de la categoría no es válido",
    });
  }

  const category = await categoryService.updateCategory(categoryId, req.body);

  res.status(200).json({
    status: "success",
    message: "Categoría actualizada correctamente",
    data: category,
  });
};

export const deactivateCategory = async (req, res) => {
  const categoryId = parseCategoryId(req.params.id);

  if (!categoryId) {
    return res.status(400).json({
      status: "error",
      message: "El ID de la categoría no es válido",
    });
  }

  const category = await categoryService.deactivateCategory(categoryId);

  res.status(200).json({
    status: "success",
    message: "Categoría desactivada correctamente",
    data: category,
  });
};
