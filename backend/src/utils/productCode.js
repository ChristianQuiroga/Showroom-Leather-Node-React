export const generateProductCode = (name) => {
  const prefix = name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");

  const timestamp = Date.now().toString().slice(-6);

  return `${prefix}-${timestamp}`;
};