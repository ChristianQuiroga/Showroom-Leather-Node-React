import * as productService from "../services/product.service.js";

const parseProductId = (id) => {
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return null;
  }

  return productId;
};

export const getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts();

  res.status(200).json({
    status: "success",
    data: products,
  });
};

export const getProductById = async (req, res) => {
  const productId = parseProductId(req.params.id);

  if (!productId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto no es válido",
    });
  }

  const product = await productService.getProductById(productId);

  res.status(200).json({
    status: "success",
    data: product,
  });
};

export const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);

  res.status(201).json({
    status: "success",
    message: "Producto creado correctamente",
    data: product,
  });
};

export const updateProduct = async (req, res) => {
  const productId = parseProductId(req.params.id);

  if (!productId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto no es válido",
    });
  }

  const product = await productService.updateProduct(
    productId,
    req.body
  );

  res.status(200).json({
    status: "success",
    message: "Producto actualizado correctamente",
    data: product,
  });
};

export const deactivateProduct = async (req, res) => {
  const productId = parseProductId(req.params.id);

  if (!productId) {
    return res.status(400).json({
      status: "error",
      message: "El ID del producto no es válido",
    });
  }

  const product =
    await productService.deactivateProduct(productId);

  res.status(200).json({
    status: "success",
    message: "Producto desactivado correctamente",
    data: product,
  });
};