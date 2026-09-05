const API_URL = "http://localhost:3000/api";

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

  const url = query ? `${API_URL}/products?${query}` : `${API_URL}/products`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  return response.json();
};

export const getAdminProducts = async (filters = {}, token) => {
  const query = buildProductQuery(filters);
  const url = query
    ? `${API_URL}/products/admin?${query}`
    : `${API_URL}/products/admin`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener los productos");
  }

  return data;
};

export const getProductById = async (id) => {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el producto");
  }

  return response.json();
};

export const createProduct = async (product, token) => {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo crear el producto");
  }

  return data;
};

export const updateProduct = async (id, product, token) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo actualizar el producto");
  }

  return data;
};

export const deactivateProduct = async (id, token) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo desactivar el producto");
  }

  return data;
};

export const activateProduct = async (id, token) => {
  const response = await fetch(`${API_URL}/products/${id}/activate`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo activar el producto");
  }

  return data;
};
