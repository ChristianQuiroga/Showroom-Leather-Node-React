const API_URL = "http://localhost:3000/api";

export const getProducts = async ({
  search = "",
  status = "",
  categoryId = "",
  page = 1,
  limit = 4, // temporario
} = {}) => {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (status) {
    params.append("status", status);
  }

  if (categoryId) {
    params.append("categoryId", categoryId);
  }

  if (page) {
    params.append("page", page);
  }
  // temporario
  if (limit) {
    params.append("limit", limit);
  }
  const query = params.toString();

  const url = query ? `${API_URL}/products?${query}` : `${API_URL}/products`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  return response.json();
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
