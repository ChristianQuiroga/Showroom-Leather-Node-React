import { useEffect, useState } from "react";

import { getProducts } from "./services/productService.js";

import "./App.css";

import ProductCard from "./components/ProductCard.jsx";

import { getCategories } from "./services/categoryService";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Load products when filters or page change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts({
          search,
          status,
          categoryId,
          page,
        });

        setProducts(response.data);
        setPagination(response.pagination);
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [search, status, categoryId, page]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();

        setCategories(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <main className="app">
        <p>Cargando productos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="app">
      <h1>Showroom Leather</h1>
      <p>Catálogo de artículos de cuero</p>

      <section>
        <h2>Productos</h2>

        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="available">Disponible</option>
          <option value="reserved">Reservado</option>
          <option value="sold">Vendido</option>
          <option value="unpublished">No publicado</option>
        </select>

        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las categorías</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {products.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <div className="product-list">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </button>

                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default App;
