import * as productRepository from "../repositories/product.repository.js";
import * as productImageRepository from "../repositories/productImage.repository.js";

import { AppError } from "../utils/AppError.js";

const validateProductForImageChanges = async (productId) => {
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  if (!product.is_active) {
    throw new AppError(
      "No se pueden modificar imágenes de un producto desactivado",
      409,
    );
  }

  return product;
};

const normalizeImageUrl = (imageUrl) => {
  const normalizedUrl = imageUrl?.trim();

  if (!normalizedUrl) {
    throw new AppError("La URL de la imagen es obligatoria", 400);
  }

  try {
    const parsedUrl = new URL(normalizedUrl);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new AppError("La URL de la imagen no es válida", 400);
  }

  return normalizedUrl;
};

export const getProductImages = async (productId) => {
  const product = await productRepository.findById(productId);

  if (!product) {
    throw new AppError("Producto no encontrado", 404);
  }

  return productImageRepository.findAllByProductId(productId);
};

export const addProductImage = async (
  productId,
  { imageUrl, publicId, altText, isMain, displayOrder },
) => {
  await validateProductForImageChanges(productId);

  const normalizedUrl = normalizeImageUrl(imageUrl);
  const normalizedPublicId = publicId?.trim() || null;
  const normalizedAltText = altText?.trim() || null;

  if (normalizedAltText && normalizedAltText.length > 200) {
    throw new AppError(
      "El texto alternativo no puede superar los 200 caracteres",
      400,
    );
  }

  if (isMain !== undefined && typeof isMain !== "boolean") {
    throw new AppError("El campo isMain debe ser booleano", 400);
  }

  const numericDisplayOrder = Number(displayOrder ?? 0);

  if (!Number.isInteger(numericDisplayOrder) || numericDisplayOrder < 0) {
    throw new AppError(
      "El orden de visualización debe ser un número entero mayor o igual a cero",
      400,
    );
  }

  const duplicatedImage = await productImageRepository.findByUrl(
    productId,
    normalizedUrl,
  );

  if (duplicatedImage) {
    throw new AppError("La imagen ya está asociada a este producto", 409);
  }

  const imageCount = await productImageRepository.countByProductId(productId);

  // La primera imagen siempre será la principal.
  const shouldBeMain = imageCount === 0 ? true : (isMain ?? false);

  return productImageRepository.create({
    productId,
    imageUrl: normalizedUrl,
    publicId: normalizedPublicId,
    altText: normalizedAltText,
    isMain: shouldBeMain,
    displayOrder: numericDisplayOrder,
  });
};

export const setProductMainImage = async (productId, imageId) => {
  await validateProductForImageChanges(productId);

  const image = await productImageRepository.findByIdAndProductId(
    imageId,
    productId,
  );

  if (!image) {
    throw new AppError("La imagen no existe o no pertenece al producto", 404);
  }

  if (image.is_main) {
    throw new AppError("La imagen ya es la principal", 409);
  }

  return productImageRepository.setAsMain(productId, imageId);
};

export const deleteProductImage = async (productId, imageId) => {
  await validateProductForImageChanges(productId);

  const image = await productImageRepository.findByIdAndProductId(
    imageId,
    productId,
  );

  if (!image) {
    throw new AppError("La imagen no existe o no pertenece al producto", 404);
  }

  return productImageRepository.remove(productId, imageId);
};
