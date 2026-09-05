import { apiRequest } from "./apiClient.js";

export const getProductImages = async (productId) => {
  return apiRequest(`/products/${productId}/images`, {
    fallbackMessage: "No se pudieron obtener las imágenes",
  });
};

export const uploadProductImage = async (
  productId,
  { file, altText },
  token,
) => {
  const formData = new FormData();

  formData.append("image", file);

  if (altText) {
    formData.append("altText", altText);
  }

  return apiRequest(`/products/${productId}/images`, {
    token,
    method: "POST",
    body: formData,
    fallbackMessage: "No se pudo subir la imagen",
  });
};

export const setMainProductImage = async (productId, imageId, token) => {
  return apiRequest(`/products/${productId}/images/${imageId}/main`, {
    token,
    method: "PATCH",
    fallbackMessage: "No se pudo actualizar la imagen principal",
  });
};

export const deleteProductImage = async (productId, imageId, token) => {
  return apiRequest(`/products/${productId}/images/${imageId}`, {
    token,
    method: "DELETE",
    fallbackMessage: "No se pudo eliminar la imagen",
  });
};
