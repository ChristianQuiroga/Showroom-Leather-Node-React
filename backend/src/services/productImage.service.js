import * as productRepository from "../repositories/product.repository.js";
import * as productImageRepository from "../repositories/productImage.repository.js";

import { AppError } from "../utils/AppError.js";

import {
  deleteCloudinaryImage,
  uploadImageBuffer,
} from "./cloudinary.service.js";
const parseOptionalBoolean = (value, defaultValue = false) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  throw new AppError("El campo isMain debe ser booleano", 400);
};

const parseDisplayOrder = (value) => {
  const numericValue = Number(value ?? 0);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    throw new AppError(
      "El orden de visualización debe ser un número entero mayor o igual a cero",
      400,
    );
  }

  return numericValue;
};

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
  { fileBuffer, altText, isMain, displayOrder },
) => {
  await validateProductForImageChanges(productId);

  if (!fileBuffer) {
    throw new AppError("Debe seleccionar una imagen", 400);
  }

  const normalizedAltText = altText?.trim() || null;

  if (normalizedAltText && normalizedAltText.length > 200) {
    throw new AppError(
      "El texto alternativo no puede superar los 200 caracteres",
      400,
    );
  }

  const parsedIsMain = parseOptionalBoolean(isMain, false);

  const numericDisplayOrder = parseDisplayOrder(displayOrder);

  const imageCount = await productImageRepository.countByProductId(productId);

  // La primera imagen será siempre la principal.
  const shouldBeMain = imageCount === 0 ? true : parsedIsMain;

  let cloudinaryResult;

  try {
    cloudinaryResult = await uploadImageBuffer(fileBuffer, {
      folder: `showroom-leather/products/${productId}`,
      transformation: [
        {
          width: 1600,
          height: 1600,
          crop: "limit",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    return await productImageRepository.create({
      productId,
      imageUrl: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      altText: normalizedAltText,
      isMain: shouldBeMain,
      displayOrder: numericDisplayOrder,
    });
  } catch (error) {
    /*
     * Si Cloudinary subió la imagen, pero falló el registro
     * en PostgreSQL, intentamos eliminar el archivo para no
     * dejar una imagen huérfana.
     */
    if (cloudinaryResult?.public_id) {
      try {
        await deleteCloudinaryImage(cloudinaryResult.public_id);
      } catch (cleanupError) {
        console.error(
          "No se pudo limpiar la imagen de Cloudinary:",
          cleanupError.message,
        );
      }
    }

    throw error;
  }
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

  if (image.public_id) {
    const cloudinaryResult = await deleteCloudinaryImage(image.public_id);

    if (
      cloudinaryResult.result !== "ok" &&
      cloudinaryResult.result !== "not found"
    ) {
      throw new AppError(
        "No se pudo eliminar la imagen del almacenamiento",
        502,
      );
    }
  }

  return productImageRepository.remove(productId, imageId);
};
