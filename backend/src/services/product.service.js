import * as productRepository from "../repositories/product.repository.js";
import * as categoryRepository from "../repositories/category.repository.js";

import { AppError } from "../utils/AppError.js";
import { generateProductCode } from "../utils/productCode.js";

const validStatuses = ["available", "reserved", "sold", "unpublished"];
const normalizeAndValidateProductData = async ({
  name,
  description,
  categoryId,
  material,
  color,
  size,
  price,
  stock,
  status,
  isFeatured,
  isPublished,
}) => {
  const normalizedName = name?.trim();
  const normalizedDescription = description?.trim() || null;
  const normalizedMaterial = material?.trim();
  const normalizedColor = color?.trim();
  const normalizedSize = size?.trim();

  if (!normalizedName) {
    throw new AppError("El nombre del producto es obligatorio", 400);
  }

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    throw new AppError("La categoría no es válida", 400);
  }

  if (!normalizedMaterial) {
    throw new AppError("El material es obligatorio", 400);
  }

  if (!normalizedColor) {
    throw new AppError("El color es obligatorio", 400);
  }

  if (!normalizedSize) {
    throw new AppError("El talle es obligatorio", 400);
  }

  const numericPrice = Number(price);
  const numericStock = Number(stock);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new AppError("El precio debe ser mayor que cero", 400);
  }

  if (!Number.isInteger(numericStock) || numericStock < 0) {
    throw new AppError(
      "El stock debe ser un número entero mayor o igual a cero",
      400,
    );
  }

  const category = await categoryRepository.findById(categoryId);

  if (!category) {
    throw new AppError("La categoría no existe", 404);
  }

  if (!category.is_active) {
    throw new AppError("No se puede asignar una categoría desactivada", 409);
  }

  let normalizedStatus = status || "available";

  if (!validStatuses.includes(normalizedStatus)) {
    throw new AppError("El estado del producto no es válido", 400);
  }

  if (numericStock === 0 && normalizedStatus === "available") {
    normalizedStatus = "sold";
  }

  if (numericStock > 0 && normalizedStatus === "sold") {
    throw new AppError(
      "Un producto con stock disponible no puede estar vendido",
      409,
    );
  }

  return {
    name: normalizedName,
    description: normalizedDescription,
    categoryId,
    material: normalizedMaterial,
    color: normalizedColor,
    size: normalizedSize,
    price: numericPrice,
    stock: numericStock,
    status: normalizedStatus,
    isFeatured: Boolean(isFeatured),
    isPublished: Boolean(isPublished),
  };
};

export const getAllProducts = async () => {
  return productRepository.findAll();
};

export const getProductById = async (id) => {
  const product = await productRepository.findById(id);

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  return product;
};

export const createProduct = async (productData) => {
  const validatedData = await normalizeAndValidateProductData(productData);

  const code = generateProductCode(validatedData.name);

  const existingCode = await productRepository.findByCode(code);

  if (existingCode) {
    throw new AppError(
      "No se pudo generar un código único para el producto",
      409,
    );
  }

  return productRepository.create({
    code,
    ...validatedData,
  });
};

export const updateProduct = async (id, productData) => {
  const existingProduct = await productRepository.findById(id);

  if (!existingProduct) {
    throw new AppError("Producto no encontrado", 404);
  }

  if (!existingProduct.is_active) {
    throw new AppError("No se puede modificar un producto desactivado", 409);
  }

  const validatedData = await normalizeAndValidateProductData(productData);

  return productRepository.update(id, validatedData);
};

export const deactivateProduct = async (id) => {
  const existingProduct = await productRepository.findById(id);

  if (!existingProduct) {
    throw new AppError("Producto no encontrado", 404);
  }

  if (!existingProduct.is_active) {
    throw new AppError("El producto ya se encuentra desactivado", 409);
  }

  return productRepository.deactivate(id);
};
