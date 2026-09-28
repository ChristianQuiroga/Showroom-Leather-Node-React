import { apiRequest } from "./apiClient.js";

export const getContact = () => apiRequest("/contact", {
  fallbackMessage: "No se pudo cargar el contacto",
});
