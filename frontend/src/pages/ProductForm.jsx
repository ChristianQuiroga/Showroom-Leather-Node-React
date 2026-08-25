import { useState } from "react";

import { createProduct } from "../services/productService.js";

function ProductForm({ token, categories, onBack }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    material: "",
    color: "",
    size: "",
    price: "",
    stock: "",
    status: "available",
    isFeatured: false,
    isPublished: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const product = {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const response = await createProduct(product, token);

      setMessage(response.message || "Producto creado correctamente");

      setForm({
        name: "",
        description: "",
        categoryId: "",
        material: "",
        color: "",
        size: "",
        price: "",
        stock: "",
        status: "available",
        isFeatured: false,
        isPublished: true,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="product-form-page">
      <section className="product-form-card">
        <button type="button" onClick={onBack}>
          Volver
        </button>

        <h1>Nuevo producto</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <label>
            Categoría
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Material
            <input
              name="material"
              value={form.material}
              onChange={handleChange}
            />
          </label>

          <label>
            Color
            <input name="color" value={form.color} onChange={handleChange} />
          </label>

          <label>
            Talle
            <input name="size" value={form.size} onChange={handleChange} />
          </label>

          <label>
            Precio
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Stock
            <input
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Estado
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="sold">Vendido</option>
              <option value="unpublished">No publicado</option>
            </select>
          </label>

          <label>
            <input
              name="isFeatured"
              type="checkbox"
              checked={form.isFeatured}
              onChange={handleChange}
            />
            Destacado
          </label>

          <label>
            <input
              name="isPublished"
              type="checkbox"
              checked={form.isPublished}
              onChange={handleChange}
            />
            Publicado
          </label>

          {message && (
            <p className="form-message form-message--success">{message}</p>
          )}

          {error && (
            <div className="form-message form-message--error">
              <strong>No se pudo crear el producto.</strong>
              <p>{error}</p>
              <p>Revisá los datos ingresados e intentá nuevamente.</p>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear producto"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProductForm;
