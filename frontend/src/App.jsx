import { useCallback, useEffect, useState } from "react";

import ProductCard from "./components/ProductCard.jsx";
import ProductDetail from "./components/ProductDetail.jsx";

import Login from "./pages/Login.jsx";
import ProductForm from "./pages/ProductForm.jsx";
import ProductManager from "./pages/ProductManager.jsx";
import CategoryManager from "./pages/CategoryManager.jsx";
import ProductImageManager from "./pages/ProductImageManager.jsx";

import { getProducts } from "./services/productService.js";
import { getCategories } from "./services/categoryService";
import {
  getCurrentUser,
  getTokenExpiration,
  login,
} from "./services/authService.js";

import "./App.css";

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
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [refreshProducts, setRefreshProducts] = useState(0);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showProductManager, setShowProductManager] = useState(false);
  const [imageProductId, setImageProductId] = useState(null);
  const hasActiveFilters = Boolean(search || status || categoryId);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setSessionLoading(false);
    setShowLogin(false);
    setShowProductForm(false);
    setEditingProductId(null);
    setShowCategoryManager(false);
    setShowProductManager(false);
    setImageProductId(null);
  }, []);

  const handleAdminError = useCallback(
    (requestError) => {
      if (requestError.status === 401 || requestError.status === 403) {
        clearSession();
      }
    },
    [clearSession],
  );

  const handleLogin = async ({ email, password }) => {
    const response = await login({
      email,
      password,
    });

    if (response.user?.role !== "admin") {
      throw new Error("La cuenta no tiene permisos de administrador");
    }

    localStorage.setItem("token", response.token);
    setToken(response.token);

    setShowLogin(false);
  };

  const handleLogout = clearSession;

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setCategoryId("");
    setPage(1);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) return;

    let ignore = false;

    const validateStoredSession = async () => {
      try {
        const response = await getCurrentUser(storedToken);
        const user = response.user;

        if (!user?.is_active || user.role !== "admin") {
          if (!ignore) clearSession();
          return;
        }

        if (!ignore) {
          setToken(storedToken);
        }
      } catch (validationError) {
        if (
          !ignore &&
          (validationError.status === 401 || validationError.status === 403)
        ) {
          clearSession();
        }
      } finally {
        if (!ignore) setSessionLoading(false);
      }
    };

    validateStoredSession();

    return () => {
      ignore = true;
    };
  }, [clearSession]);

  useEffect(() => {
    if (!token) return;

    const expiration = getTokenExpiration(token);

    if (!expiration) return;

    const remainingTime = expiration - Date.now();

    const timeoutId = globalThis.setTimeout(
      clearSession,
      Math.max(remainingTime, 0),
    );

    return () => globalThis.clearTimeout(timeoutId);
  }, [clearSession, token]);

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
  }, [search, status, categoryId, page, refreshProducts]);

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

  if (sessionLoading) {
    return (
      <main className="app">
        <p>Validando sesión...</p>
      </main>
    );
  }

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

  if (selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        onBack={() => setSelectedProductId(null)}
      />
    );
  }

  if (showLogin) {
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
  }

  if (showProductForm) {
    return (
      <ProductForm
        token={token}
        onAuthError={handleAdminError}
        categories={categories}
        productId={editingProductId}
        onSaved={() => setRefreshProducts((prev) => prev + 1)}
        onBack={() => {
          setShowProductForm(false);
          setEditingProductId(null);
        }}
      />
    );
  }

  if (showCategoryManager) {
    return (
      <CategoryManager
        token={token}
        onAuthError={handleAdminError}
        onBack={() => setShowCategoryManager(false)}
      />
    );
  }

  if (imageProductId) {
    return (
      <ProductImageManager
        productId={imageProductId}
        token={token}
        onAuthError={handleAdminError}
        onSaved={() => setRefreshProducts((prev) => prev + 1)}
        onBack={() => setImageProductId(null)}
      />
    );
  }

  if (showProductManager) {
    return (
      <ProductManager
        token={token}
        onAuthError={handleAdminError}
        categories={categories}
        onEdit={(productId) => {
          setEditingProductId(productId);
          setShowProductForm(true);
        }}
        onManageImages={(productId) => setImageProductId(productId)}
        onBack={() => setShowProductManager(false)}
      />
    );
  }

  return (
    <main className="app">
      <h1>Showroom Leather</h1>
      <p>Catálogo de artículos de cuero</p>

      {token ? (
        <>
          <button
            onClick={() => {
              setEditingProductId(null);
              setShowProductForm(true);
            }}
          >
            Nuevo producto
          </button>

          <button onClick={() => setShowProductManager(true)}>
            Gestionar productos
          </button>

          <button onClick={() => setShowCategoryManager(true)}>
            Gestionar categorías
          </button>

          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <button onClick={() => setShowLogin(true)}>Administrar</button>
      )}

      <section>
        <h2>Productos</h2>

        <div className="product-filters">
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

          <button onClick={handleClearFilters} disabled={!hasActiveFilters}>
            Limpiar filtros
          </button>
        </div>

        {products.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <div className="product-list">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => setSelectedProductId(product.id)}
                  onEdit={
                    token
                      ? () => {
                          setEditingProductId(product.id);
                          setShowProductForm(true);
                        }
                      : null
                  }
                  onManageImages={
                    token ? () => setImageProductId(product.id) : null
                  }
                />
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
