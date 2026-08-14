import env from "../config/env.js";

export const buildWhatsAppUrl = (product) => {
  const message = `
Hola, quiero consultar por este producto:

Producto: ${product.name}
Código: ${product.code}
Precio: $${product.price}
`.trim();

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${env.whatsapp.phone}?text=${encodedMessage}`;
};
