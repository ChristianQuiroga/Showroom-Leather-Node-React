import { useEffect, useState } from "react";

import { getProductById } from "../services/productService.js";

const formatPrice = (price) =>
  Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });

const formatStatus = (status) => {
  const statuses = {
    available: "Disponible",
    reserved: "Reservado",
    sold: "Vendido",
    unpublished: "No publicado",
  };

  return statuses[status] || status;
};

function ProductDetail({ productId, onBack }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await getProductById(productId);

        setProduct(response.data);
        setError("");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return <p>Cargando producto...</p>;
  }

  if (error) {
    return (
      <section>
        <button onClick={onBack}>Volver</button>
        <p>{error}</p>
      </section>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <section className="product-detail">
      <button onClick={onBack}>Volver</button>

      {product.main_image_url ? (
        <img
          className="product-detail__image"
          src={product.main_image_url}
          alt={product.name}
        />
      ) : (
        <div className="product-detail__placeholder">Sin imagen</div>
      )}

      <h2>{product.name}</h2>

      <p>
        <strong>Código:</strong> {product.code}
      </p>

      <p>
        <strong>Descripción:</strong> {product.description || "Sin descripción"}
      </p>

      <p>
        <strong>Categoría:</strong> {product.category_name}
      </p>

      <p>
        <strong>Material:</strong> {product.material || "Sin especificar"}
      </p>

      <p>
        <strong>Color:</strong> {product.color || "Sin especificar"}
      </p>

      <p>
        <strong>Talle:</strong> {product.size || "Sin especificar"}
      </p>

      <p>
        <strong>Precio:</strong> {formatPrice(product.price)}
      </p>

      <p>
        <strong>Estado:</strong> {formatStatus(product.status)}
      </p>

      {product.whatsappUrl && (
        <a href={product.whatsappUrl} target="_blank" rel="noreferrer">
          Consultar por WhatsApp
        </a>
      )}
    </section>
  );
}

export default ProductDetail;
