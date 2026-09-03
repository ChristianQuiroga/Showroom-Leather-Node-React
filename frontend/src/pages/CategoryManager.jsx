import { useEffect, useState } from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
} from "../services/categoryService.js";

function CategoryManager({ token, onBack }) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialCategories = async () => {
      try {
        const response = await getCategories();

        if (!ignore) {
          setCategories(response.data);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          setError(error.message);
        }
      }
    };

    loadInitialCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      if (editingId) {
        await updateCategory(editingId, { name }, token);
        setMessage("Categoría actualizada correctamente");
      } else {
        await createCategory({ name }, token);
        setMessage("Categoría creada correctamente");
      }

      setName("");
      setEditingId(null);

      await loadCategories();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setMessage("");
    setError("");
  };

  const handleDeactivate = async (id) => {
    try {
      setMessage("");
      setError("");

      await deactivateCategory(id, token);

      setMessage("Categoría desactivada correctamente");

      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleActivate = async (id) => {
    try {
      setMessage("");
      setError("");

      await activateCategory(id, token);

      setMessage("Categoría activada correctamente");

      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setMessage("");
    setError("");
  };

  return (
    <main className="category-page">
      <section className="category-card">
        <button type="button" onClick={onBack}>
          Volver
        </button>

        <h1>Administrar categorías</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={loading || !name.trim()}>
            {loading
              ? "Guardando..."
              : editingId
                ? "Guardar cambios"
                : "Crear categoría"}
          </button>

          {editingId && (
            <button type="button" onClick={handleCancelEdit}>
              Cancelar edición
            </button>
          )}
        </form>

        {message && (
          <p className="form-message form-message--success">{message}</p>
        )}

        {error && (
          <div className="form-message form-message--error">
            <strong>No se pudo completar la operación.</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="category-list">
          {categories.map((category) => (
            <article className="category-item" key={category.id}>
              <div>
                <strong>{category.name}</strong>
                <p>Estado: {category.is_active ? "Activa" : "Inactiva"}</p>
              </div>

              <div className="category-actions">
                <button type="button" onClick={() => handleEdit(category)}>
                  Editar
                </button>

                {category.is_active ? (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(category.id)}
                  >
                    Desactivar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleActivate(category.id)}
                  >
                    Activar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default CategoryManager;
