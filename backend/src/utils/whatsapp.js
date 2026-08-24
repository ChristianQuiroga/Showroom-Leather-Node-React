import env from "../config/env.js";

const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });
};

export const buildWhatsAppUrl = (product) => {
  const message = `
Hola, quiero consultar por este producto:

Producto: ${product.name}
Código: ${product.code}
Precio: ${formatPrice(product.price)}
`.trim();

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${env.whatsapp.phone}?text=${encodedMessage}`;
};
