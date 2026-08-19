import { useEffect, useState } from "react";

import { getProducts } from "./services/productService.js";

import "./App.css";

import ProductCard from "./components/ProductCard.jsx";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await getProducts();

        setProducts(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
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

        {products.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <div className="product-list">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
