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
