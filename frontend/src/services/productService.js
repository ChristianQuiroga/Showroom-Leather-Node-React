import { apiRequest } from "./apiClient.js";

const buildProductQuery = ({
  search = "",
  status = "",
  categoryId = "",
  page = 1,
  limit = 4,
} = {}) => {
  const params = new URLSearchParams();

  if (search) params.append("search", search);
  if (status) params.append("status", status);
  if (categoryId) params.append("categoryId", categoryId);
  if (page) params.append("page", page);
  if (limit) params.append("limit", limit);

  return params.toString();
};

export const getProducts = async (filters = {}) => {
  const query = buildProductQuery(filters);
  const path = query ? `/products?${query}` : "/products";

  return apiRequest(path, {
    fallbackMessage: "No se pudieron obtener los productos",
  });
};

export const getAdminProducts = async (filters = {}, token) => {
  const query = buildProductQuery(filters);
  const path = query ? `/products/admin?${query}` : "/products/admin";

  return apiRequest(path, {
    token,
    fallbackMessage: "No se pudieron obtener los productos",
  });
};

export const getProductById = async (id) => {
  return apiRequest(`/products/${id}`, {
    fallbackMessage: "No se pudo obtener el producto",
  });
};

export const createProduct = async (product, token) => {
  return apiRequest("/products", {
    token,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
    fallbackMessage: "No se pudo crear el producto",
  });
};

export const updateProduct = async (id, product, token) => {
  return apiRequest(`/products/${id}`, {
    token,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
    fallbackMessage: "No se pudo actualizar el producto",
  });
};

export const deactivateProduct = async (id, token) => {
  return apiRequest(`/products/${id}`, {
    token,
    method: "DELETE",
    fallbackMessage: "No se pudo desactivar el producto",
  });
};

export const activateProduct = async (id, token) => {
  return apiRequest(`/products/${id}/activate`, {
    token,
    method: "PATCH",
    fallbackMessage: "No se pudo activar el producto",
  });
};
