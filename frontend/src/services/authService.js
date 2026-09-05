import { apiRequest } from "./apiClient.js";

export const login = async ({ email, password }) => {
  return apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
    fallbackMessage: "No se pudo iniciar sesión",
  });
};

export const getCurrentUser = async (token) => {
  return apiRequest("/auth/me", {
    token,
    fallbackMessage: "No se pudo validar la sesión",
  });
};

export const getTokenExpiration = (token) => {
  try {
    const payloadPart = token.split(".")[1];

    if (!payloadPart) return null;

    const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(globalThis.atob(paddedBase64));

    return Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};
