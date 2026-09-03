const API_URL = "http://localhost:3000/api";

export const getProductImages = async (productId) => {
  const response = await fetch(`${API_URL}/products/${productId}/images`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudieron obtener las imágenes");
  }

  return data;
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

  const response = await fetch(`${API_URL}/products/${productId}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo subir la imagen");
  }

  return data;
};

export const setMainProductImage = async (productId, imageId, token) => {
  const response = await fetch(
    `${API_URL}/products/${productId}/images/${imageId}/main`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "No se pudo actualizar la imagen principal",
    );
  }

  return data;
};

export const deleteProductImage = async (productId, imageId, token) => {
  const response = await fetch(
    `${API_URL}/products/${productId}/images/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo eliminar la imagen");
  }

  return data;
};
