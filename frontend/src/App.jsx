import { useCallback, useEffect, useRef, useState } from "react";

import ProductCard from "./components/ProductCard.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import FavoritesView from "./components/FavoritesView.jsx";
import WhatsAppIcon from "./components/WhatsAppIcon.jsx";

import Login from "./pages/Login.jsx";
import ProductForm from "./pages/ProductForm.jsx";
import ProductManager from "./pages/ProductManager.jsx";
import CategoryManager from "./pages/CategoryManager.jsx";
import ProductImageManager from "./pages/ProductImageManager.jsx";

import { getProducts } from "./services/productService.js";
import { getCategories } from "./services/categoryService";
import { getContact } from "./services/contactService.js";
import {
  getCurrentUser,
  getTokenExpiration,
  login,
} from "./services/authService.js";

import "./App.css";

const createInitialProductManagerState = () => ({
  search: "",
  status: "",
  categoryId: "",
  page: 1,
});

const FAVORITES_KEY = "showroom-leather:favorites:v1";

const readFavorites = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(stored)
      ? [...new Set(stored.filter((id) => Number.isInteger(Number(id)) && Number(id) > 0).map(String))]
      : [];
  } catch {
    return [];
  }
};

function App() {
  const isMountedRef = useRef(false);
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
  const [showFavorites, setShowFavorites] = useState(false);
  const [detailFromFavorites, setDetailFromFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(readFavorites);
  const [contactUrl, setContactUrl] = useState("");
  const [showLogin, setShowLogin] = useState(() => window.location.hash === "#admin" && !localStorage.getItem("token"));
  const [token, setToken] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refreshProducts, setRefreshProducts] = useState(0);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [productManagerState, setProductManagerState] = useState(
    createInitialProductManagerState,
  );
  const [imageProductId, setImageProductId] = useState(null);
  const returnToCollectionRef = useRef(false);
  const hasActiveFilters = Boolean(search || status || categoryId);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#admin" && !token && !sessionLoading) setShowLogin(true);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [token, sessionLoading]);

  useEffect(() => {
    let ignore = false;
    getContact().then((response) => {
      if (!ignore) setContactUrl(response.whatsappUrl || "");
    }).catch(() => {});
    return () => { ignore = true; };
  }, []);

  const toggleFavorite = (productId) => {
    const id = String(productId);
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { /* Sigue disponible durante esta visita. */ }
      return next;
    });
  };

  useEffect(() => {
    if (
      !returnToCollectionRef.current || loading || sessionLoading ||
      selectedProductId || showFavorites || token || showLogin || showProductForm ||
      showCategoryManager || imageProductId
    ) return;

    returnToCollectionRef.current = false;
    window.history.replaceState(null, "", "#coleccion");
    document.getElementById("coleccion")?.scrollIntoView({ behavior: "instant" });
  }, [
    loading, sessionLoading, selectedProductId, showFavorites, token, showLogin, showProductForm,
    showCategoryManager, imageProductId,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const resetProductManagerState = useCallback(() => {
    setProductManagerState(createInitialProductManagerState());
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    resetProductManagerState();
    setToken(null);
    setSessionLoading(false);
    setShowLogin(window.location.hash === "#admin");
    setShowProductForm(false);
    setEditingProduct(null);
    setShowCategoryManager(false);
    setImageProductId(null);
  }, [resetProductManagerState]);

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
    resetProductManagerState();
    setToken(response.token);

    setShowLogin(false);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  };

  const handleLogout = () => {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    clearSession();
  };

  const showAdminSection = (section) => {
    if (showCategoryManager) refreshCategories();
    setShowProductForm(section === "new");
    setEditingProduct(null);
    setShowCategoryManager(section === "categories");
    setImageProductId(null);
  };

  const adminHeader = (section) => (
    <header className="app showroom-header showroom-header--admin">
      <span className="brand"><span className="brand__name">Showroom Leather</span><span className="brand__caption">Panel de administración</span></span>
      <nav className="showroom-nav" aria-label="Administración">
        <button className={section === "new" ? "admin-nav-active" : ""} aria-current={section === "new" ? "page" : undefined} type="button" onClick={() => showAdminSection("new")}>Nuevo producto</button>
        <button className={section === "products" ? "admin-nav-active" : ""} aria-current={section === "products" ? "page" : undefined} type="button" onClick={() => showAdminSection("products")}>Gestionar productos</button>
        <button className={section === "categories" ? "admin-nav-active" : ""} aria-current={section === "categories" ? "page" : undefined} type="button" onClick={() => showAdminSection("categories")}>Gestionar categorías</button>
        <button type="button" onClick={handleLogout}>Cerrar sesión</button>
      </nav>
    </header>
  );

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
    let ignore = false;

    const loadProducts = async () => {
      try {
        const response = await getProducts({
          search,
          status,
          categoryId,
          page,
        });

        if (ignore) return;

        const lastValidPage = Math.max(response.pagination.totalPages, 1);

        if (page > lastValidPage) {
          setPage(lastValidPage);
          return;
        }

        setProducts(response.data);
        setPagination(response.pagination);
        setError("");
      } catch (error) {
        if (!ignore) setError(error.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [search, status, categoryId, page, refreshProducts]);

  // Load categories on component mount
  useEffect(() => {
    let ignore = false;

    const loadInitialCategories = async () => {
      try {
        const response = await getCategories();

        if (!ignore) {
          setCategories(response.data);
        }
      } catch (error) {
        if (!ignore) {
          console.error(error);
        }
      }
    };

    loadInitialCategories();

    return () => {
      ignore = true;
    };
  }, []);

  // Refresh categories after returning from the category manager
  const refreshCategories = async () => {
    try {
      const response = await getCategories();

      if (isMountedRef.current) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  if (selectedProductId) {
    return (
      <ProductDetail
        productId={selectedProductId}
        isFavorite={favoriteIds.includes(String(selectedProductId))}
        onToggleFavorite={toggleFavorite}
        backLabel={detailFromFavorites ? "Volver a favoritos" : "Volver a la colección"}
        onBack={() => {
          if (!detailFromFavorites) returnToCollectionRef.current = true;
          setSelectedProductId(null);
        }}
      />
    );
  }

  if (showFavorites) {
    return (
      <FavoritesView
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onSelect={(id) => { setDetailFromFavorites(true); setSelectedProductId(id); }}
        onBack={() => { returnToCollectionRef.current = true; setShowFavorites(false); }}
      />
    );
  }

  if (showLogin) {
    return <Login onLogin={handleLogin} onBack={() => { setShowLogin(false); window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`); }} />;
  }

  if (showProductForm) {
    return (
      <>
        {adminHeader(editingProduct ? "products" : "new")}
        <ProductForm
          token={token}
          onAuthError={handleAdminError}
          categories={categories.filter((category) => category.is_active)}
          product={editingProduct}
          onSaved={() => setRefreshProducts((prev) => prev + 1)}
          onBack={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      </>
    );
  }

  if (showCategoryManager) {
    return (
      <>
        {adminHeader("categories")}
        <CategoryManager
          token={token}
          onAuthError={handleAdminError}
          onBack={async () => {
            await refreshCategories();
            setShowCategoryManager(false);
          }}
        />
      </>
    );
  }

  if (imageProductId) {
    return (
      <>
        {adminHeader("products")}
        <ProductImageManager
          productId={imageProductId}
          token={token}
          onAuthError={handleAdminError}
          onSaved={() => setRefreshProducts((prev) => prev + 1)}
          onBack={() => setImageProductId(null)}
        />
      </>
    );
  }

  if (token) {
    return (
      <>
        {adminHeader("products")}
        <ProductManager
          token={token}
          onAuthError={handleAdminError}
          categories={categories}
          managerState={productManagerState}
          onManagerStateChange={setProductManagerState}
          onEdit={(product) => { setEditingProduct(product); setShowProductForm(true); }}
          onManageImages={(productId) => setImageProductId(productId)}
        />
      </>
    );
  }

  return (
    <main className="app" id="inicio">
      <header className="showroom-header">
        <a className="brand" href="#inicio" aria-label="Showroom Leather, volver al inicio">
          <span className="brand__name">Showroom Leather</span>
          <span className="brand__caption">Selección de prendas en cuero</span>
        </a>
        <nav className="showroom-nav" aria-label="Navegación principal">
          <a href="#coleccion">Colección</a>
          <button className="favorites-access" type="button" onClick={() => setShowFavorites(true)}>☆ Favoritos ({favoriteIds.length})</button>
          <a href="#contacto">Consultas</a>
        </nav>
      </header>

      <section className="showroom-hero" aria-labelledby="hero-title">
        <div className="showroom-hero__copy">
          <span className="eyebrow">Piezas elegidas, una a una</span>
          <h1 id="hero-title">El cuero tiene <em>historia.</em></h1>
          <p>Explorá prendas de cuero con detalles únicos. Mirá cada pieza y consultanos antes de elegir.</p>
          <a className="primary-link" href="#coleccion">Ver la colección</a>
        </div>
        <img src="/assets/hero-artesanal.jpeg" alt="Prenda de cuero marrón fotografiada en maniquí" />
      </section>

      <section className="showroom-catalog" id="coleccion" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div><span className="eyebrow">La colección</span><h2 id="catalog-title">Para descubrir</h2></div>
          {pagination && <span aria-live="polite">{pagination.total} {pagination.total === 1 ? "prenda" : "prendas"}</span>}
        </div>

        <div className="product-filters">
          <label>
            <span>Buscar prendas</span>
            <input
              type="search"
              placeholder="Nombre o descripción"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label>
            <span>Estado</span>
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
            </select>
          </label>

          <label>
            <span>Categoría</span>
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
          </label>

          <button type="button" onClick={handleClearFilters} disabled={!hasActiveFilters}>
            Limpiar filtros
          </button>
        </div>

        {error && (
          <p className="catalog-error" role="alert">
            No se pudo actualizar el catálogo: {error}.
            {products.length > 0 && " Se muestran los últimos resultados cargados."}
          </p>
        )}
        {products.length === 0 ? (
          error ? null : (
            <p className="catalog-empty">No encontramos prendas con esos filtros. Probá otra búsqueda o limpiá los filtros.</p>
          )
        ) : (
          <>
            <div className={`product-list${products.length === 4 ? " product-list--two-columns" : ""}`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => { setDetailFromFavorites(false); setSelectedProductId(product.id); }}
                  isFavorite={favoriteIds.includes(String(product.id))}
                  onToggleFavorite={() => toggleFavorite(product.id)}
                />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="pagination" aria-label="Páginas del catálogo">
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </button>

                <span>
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  type="button"
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
      <footer className="showroom-footer" id="contacto">
        <div><strong>Showroom Leather</strong><p>Prendas de cuero para descubrir con tiempo.</p></div>
        <div><strong>Explorar</strong><a href="#coleccion">Ver la colección</a><a href="#inicio">Volver al inicio</a></div>
        <div><strong>Consultas</strong><p>Elegí una prenda o escribinos por WhatsApp.</p>{contactUrl && <a className="footer-whatsapp" href={contactUrl} target="_blank" rel="noreferrer" aria-label="Escribir al showroom por WhatsApp"><WhatsAppIcon /> Escribir por WhatsApp</a>}</div>
      </footer>
    </main>
  );
}

export default App;
