import { apiRequest } from "./apiClient.js";

export const getCategories = async () => {
  return apiRequest("/categories", {
    fallbackMessage: "No se pudieron obtener las categorías",
  });
};

export const createCategory = async (category, token) => {
  return apiRequest("/categories", {
    token,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
    fallbackMessage: "No se pudo crear la categoría",
  });
};

export const updateCategory = async (id, category, token) => {
  return apiRequest(`/categories/${id}`, {
    token,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
    fallbackMessage: "No se pudo actualizar la categoría",
  });
};

export const deactivateCategory = async (id, token) => {
  return apiRequest(`/categories/${id}`, {
    token,
    method: "DELETE",
    fallbackMessage: "No se pudo desactivar la categoría",
  });
};

export const activateCategory = async (id, token) => {
  return apiRequest(`/categories/${id}/activate`, {
    token,
    method: "PATCH",
    fallbackMessage: "No se pudo activar la categoría",
  });
};
