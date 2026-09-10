const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiRequest = async (
  path,
  {
    token,
    fallbackMessage = "No se pudo completar la solicitud",
    ...options
  } = {},
) => {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    // Algunas respuestas pueden no incluir un cuerpo JSON.
  }

  if (!response.ok) {
    throw new ApiError(data?.message || fallbackMessage, response.status);
  }

  return data;
};
