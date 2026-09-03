import { useEffect, useState } from "react";

import {
  createProduct,
  getProductById,
  updateProduct,
} from "../services/productService.js";

function ProductForm({ token, categories, productId, onSaved, onBack }) {
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
  const [saved, setSaved] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => {
    if (!productId) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);

        const response = await getProductById(productId);
        const product = response.data;

        const loadedForm = {
          name: product.name || "",
          description: product.description || "",
          categoryId: product.category_id || "",
          material: product.material || "",
          color: product.color || "",
          size: product.size || "",
          price: product.price || "",
          stock: product.stock ?? "",
          status: product.status || "available",
          isFeatured: product.is_featured || false,
          isPublished: product.is_published ?? true,
        };

        setForm(loadedForm);
        setOriginalForm(loadedForm);

        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const hasChanges =
    productId &&
    originalForm &&
    JSON.stringify(form) !== JSON.stringify(originalForm);

  const isFieldChanged = (fieldName) => {
    if (!productId || !originalForm) {
      return false;
    }

    return form[fieldName] !== originalForm[fieldName];
  };

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
    setSaved(false);
    setLoading(true);

    try {
      const product = {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const response = productId
        ? await updateProduct(productId, product, token)
        : await createProduct(product, token);

      setMessage(
        response.message ||
          (productId
            ? "Producto actualizado correctamente"
            : "Producto creado correctamente"),
      );

      if (productId) {
        setOriginalForm({ ...form });
      }

      setSaved(true);

      if (onSaved) {
        onSaved();
      }

      if (!productId) {
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
      }
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

        <h1>{productId ? "Editar producto" : "Nuevo producto"}</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={isFieldChanged("name") ? "field-changed" : ""}
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={isFieldChanged("description") ? "field-changed" : ""}
            />
          </label>

          <label>
            Categoría
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className={isFieldChanged("categoryId") ? "field-changed" : ""}
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
              className={isFieldChanged("material") ? "field-changed" : ""}
            />
          </label>

          <label>
            Color
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              className={isFieldChanged("color") ? "field-changed" : ""}
            />
          </label>

          <label>
            Talle
            <input
              name="size"
              value={form.size}
              onChange={handleChange}
              className={isFieldChanged("size") ? "field-changed" : ""}
            />
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
              className={isFieldChanged("price") ? "field-changed" : ""}
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
              className={isFieldChanged("stock") ? "field-changed" : ""}
              required
            />
          </label>

          <label>
            Estado
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={isFieldChanged("status") ? "field-changed" : ""}
            >
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
              className={isFieldChanged("isFeatured") ? "field-changed" : ""}
            />
            Destacado
          </label>

          <label>
            <input
              name="isPublished"
              type="checkbox"
              checked={form.isPublished}
              onChange={handleChange}
              className={isFieldChanged("isPublished") ? "field-changed" : ""}
            />
            Publicado
          </label>

          {message && (
            <p className="form-message form-message--success">{message}</p>
          )}

          {error && (
            <div className="form-message form-message--error">
              <strong>
                {productId
                  ? "No se pudo actualizar el producto."
                  : "No se pudo crear el producto."}
              </strong>
              <p>{error}</p>
              <p>Revisá los datos ingresados e intentá nuevamente.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (productId && (!hasChanges || saved))}
          >
            {loading
              ? "Guardando..."
              : productId
                ? saved
                  ? "Cambios guardados"
                  : "Guardar cambios"
                : "Crear producto"}
          </button>

          {productId && saved && (
            <div className="edit-actions">
              <button type="button" onClick={() => setSaved(false)}>
                Seguir editando
              </button>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

export default ProductForm;
