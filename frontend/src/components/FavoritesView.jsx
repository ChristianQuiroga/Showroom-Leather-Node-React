import { useEffect, useState } from "react";

import { getProductById } from "../services/productService.js";
import ProductCard from "./ProductCard.jsx";

const formatPrice = (value) => Number(value).toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 });
const statusLabel = { available: "Disponible", reserved: "Reservado", sold: "Vendido" };

export default function FavoritesView({ favoriteIds, onBack, onSelect, onToggleFavorite }) {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadedIds, setLoadedIds] = useState("");
  const [error, setError] = useState("");
  const ids = favoriteIds.join(",");
  const loading = Boolean(favoriteIds.length && ids !== loadedIds);
  useEffect(() => {
    if (!favoriteIds.length) return;
    let cancelled = false;
    Promise.allSettled(favoriteIds.map((id) => getProductById(id))).then((results) => {
      if (cancelled) return;
      setProducts(results.filter((item) => item.status === "fulfilled").map((item) => item.value.data));
      setError(results.some((item) => item.status === "rejected") ? "Algunas prendas ya no están disponibles para comparar." : "");
      setLoadedIds(ids);
    });
    return () => { cancelled = true; };
  }, [favoriteIds, ids]);

  const toggleComparison = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  };
  const visible = products.filter((product) => favoriteIds.includes(String(product.id)));
  const compared = selectedIds.map((id) => visible.find((product) => product.id === id)).filter(Boolean);

  return (
    <main className="app favorites-page">
      <button className="back-link" type="button" onClick={onBack}>← Volver a la colección</button>
      <div className="section-heading"><div><span className="eyebrow">Tu selección</span><h1>Mis favoritos</h1></div><span>{favoriteIds.length} prendas guardadas</span></div>
      <p>Marcá dos o tres prendas para comparar sus detalles. Tus favoritos quedan guardados en este navegador.</p>
      {error && <p className="catalog-error" role="status">{error}</p>}
      {!favoriteIds.length ? <p className="catalog-empty">Todavía no guardaste ninguna prenda. Explorá la colección y tocá la estrella para agregarla.</p> : loading ? <p>Cargando favoritos...</p> : (
        <div className="product-list">
          {visible.map((product) => (
            <div className="favorite-item" key={product.id}>
              <ProductCard product={product} onSelect={() => onSelect(product.id)} isFavorite onToggleFavorite={() => onToggleFavorite(product.id)} />
              <label className="compare-choice"><input type="checkbox" checked={selectedIds.includes(product.id)} disabled={!selectedIds.includes(product.id) && selectedIds.length >= 3} onChange={() => toggleComparison(product.id)} /> Comparar</label>
            </div>
          ))}
        </div>
      )}
      {compared.length >= 2 && (
        <section className="comparison" aria-label="Comparación de favoritos">
          <h2>Comparar prendas</h2>
          <div className="comparison__scroll"><table><thead><tr><th scope="col">Detalle</th>{compared.map((product) => <th scope="col" key={product.id}>{product.name}</th>)}</tr></thead><tbody>
            <tr><th scope="row">Precio</th>{compared.map((p) => <td key={p.id}>{formatPrice(p.price)}</td>)}</tr>
            <tr><th scope="row">Categoría</th>{compared.map((p) => <td key={p.id}>{p.category_name || "—"}</td>)}</tr>
            <tr><th scope="row">Material</th>{compared.map((p) => <td key={p.id}>{p.material || "—"}</td>)}</tr>
            <tr><th scope="row">Color</th>{compared.map((p) => <td key={p.id}>{p.color || "—"}</td>)}</tr>
            <tr><th scope="row">Talle</th>{compared.map((p) => <td key={p.id}>{p.size || "—"}</td>)}</tr>
            <tr><th scope="row">Estado</th>{compared.map((p) => <td key={p.id}>{statusLabel[p.status] || p.status}</td>)}</tr>
          </tbody></table></div>
        </section>
      )}
    </main>
  );
}
