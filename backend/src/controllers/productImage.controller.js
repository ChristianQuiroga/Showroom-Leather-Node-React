import * as productImageService from "../services/productImage.service.js";

const parsePositiveId = (value) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

export const getProductImages = async (req, res) => {
  const productId = parsePositiveId(req.params.productId);

  if (!productId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto no es válido",
    });
  }

  const images = await productImageService.getProductImages(productId);

  res.status(200).json({
    status: "success",
    data: images,
  });
};

export const addProductImage = async (req, res) => {
  const productId = parsePositiveId(req.params.productId);

  if (!productId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto no es válido",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "Debe seleccionar una imagen",
    });
  }

  const image = await productImageService.addProductImage(productId, {
    fileBuffer: req.file.buffer,
    altText: req.body.altText,
    isMain: req.body.isMain,
    displayOrder: req.body.displayOrder,
  });

  res.status(201).json({
    status: "success",
    message: "Imagen subida correctamente",
    data: image,
  });
};

export const setProductMainImage = async (req, res) => {
  const productId = parsePositiveId(req.params.productId);
  const imageId = parsePositiveId(req.params.imageId);

  if (!productId || !imageId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto o de la imagen no es válido",
    });
  }

  const image = await productImageService.setProductMainImage(
    productId,
    imageId,
  );

  res.status(200).json({
    status: "success",
    message: "Imagen principal actualizada correctamente",
    data: image,
  });
};

export const deleteProductImage = async (req, res) => {
  const productId = parsePositiveId(req.params.productId);
  const imageId = parsePositiveId(req.params.imageId);

  if (!productId || !imageId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto o de la imagen no es válido",
    });
  }

  const image = await productImageService.deleteProductImage(
    productId,
    imageId,
  );

  res.status(200).json({
    status: "success",
    message: "Imagen eliminada correctamente",
    data: image,
  });
};
