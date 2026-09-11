import { useEffect, useState } from "react";

import ProductCard from "../components/ProductCard.jsx";
import {
  activateProduct,
  deactivateProduct,
  getAdminProducts,
} from "../services/productService.js";

function ProductManager({
  token,
  categories,
  onBack,
  onEdit,
  onManageImages,
  onAuthError,
  managerState,
  onManagerStateChange,
}) {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionProductId, setActionProductId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refreshProducts, setRefreshProducts] = useState(0);
  const { search, status, categoryId, page } = managerState;

  const hasActiveFilters = Boolean(search || status || categoryId);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        const response = await getAdminProducts(
          { search, status, categoryId, page },
          token,
        );

        if (ignore) return;

        const { totalPages } = response.pagination;

        const lastValidPage = Math.max(totalPages, 1);

        if (page > lastValidPage) {
          onManagerStateChange((current) => ({
            ...current,
            page: lastValidPage,
          }));
          return;
        }

        setProducts(response.data);
        setPagination(response.pagination);
        setError("");
      } catch (requestError) {
        if (!ignore) {
          onAuthError?.(requestError);
          setError(requestError.message);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [
    categoryId,
    onAuthError,
    onManagerStateChange,
    page,
    refreshProducts,
    search,
    status,
    token,
  ]);

  const handleStateChange = async (product, shouldActivate) => {
    if (actionProductId !== null) return;

    try {
      setActionProductId(product.id);
      setMessage("");
      setError("");

      const response = shouldActivate
        ? await activateProduct(product.id, token)
        : await deactivateProduct(product.id, token);

      setMessage(response.message);
      setRefreshProducts((current) => current + 1);
    } catch (requestError) {
      onAuthError?.(requestError);
      setError(requestError.message);
    } finally {
      setActionProductId(null);
    }
  };

  const handleClearFilters = () => {
    onManagerStateChange({
      search: "",
      status: "",
      categoryId: "",
      page: 1,
    });
  };

  return (
    <main className="product-manager-page">
      <section className="product-manager-card">
        <button
          type="button"
          onClick={onBack}
          disabled={actionProductId !== null}
        >
          Volver
        </button>

        <h1>Administrar productos</h1>

        <div className="product-filters">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(event) => {
              onManagerStateChange((current) => ({
                ...current,
                search: event.target.value,
                page: 1,
              }));
            }}
          />

          <select
            value={status}
            onChange={(event) => {
              onManagerStateChange((current) => ({
                ...current,
                status: event.target.value,
                page: 1,
              }));
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
              onManagerStateChange((current) => ({
                ...current,
                categoryId: event.target.value,
                page: 1,
              }));
            }}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Limpiar filtros
          </button>
        </div>

        {message && (
          <p className="form-message form-message--success">{message}</p>
        )}

        {error && (
          <div className="form-message form-message--error" role="alert">
            <strong>No se pudo completar la operación.</strong>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <p>Cargando productos...</p>
        ) : products.length === 0 ? (
          <p>No se encontraron productos.</p>
        ) : (
          <div className="product-list">
            {products.map((product) => {
              const actionLoading = actionProductId === product.id;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  showAdminState
                  actionLoading={actionLoading}
                  onEdit={product.is_active ? () => onEdit(product) : null}
                  onManageImages={
                    product.is_active
                      ? () => onManageImages(product.id)
                      : null
                  }
                  onDeactivate={
                    product.is_active
                      ? () => handleStateChange(product, false)
                      : null
                  }
                  onActivate={
                    product.is_active
                      ? null
                      : () => handleStateChange(product, true)
                  }
                />
              );
            })}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              onClick={() =>
                onManagerStateChange((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
              disabled={pagination.page === 1}
            >
              Anterior
            </button>

            <span>
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                onManagerStateChange((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
              disabled={pagination.page === pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default ProductManager;
