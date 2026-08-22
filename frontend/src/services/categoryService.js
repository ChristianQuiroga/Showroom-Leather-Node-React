const API_URL = "http://localhost:3000/api";

export const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener las categorías");
  }

  return response.json();
};