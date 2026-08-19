const formatPrice = (price) => {
  return Number(price).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  });
};

const formatStatus = (status) => {
  const statuses = {
    available: "Disponible",
    reserved: "Reservado",
    sold: "Vendido",
    unpublished: "No publicado",
  };

  return statuses[status] || status;
};

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-card__content">
        <h3>{product.name}</h3>

        <p>
          <strong>Precio:</strong> {formatPrice(product.price)}
        </p>

        <p>
          <strong>Color:</strong> {product.color || "Sin especificar"}
        </p>

        <p>
          <strong>Talle:</strong> {product.size || "Sin especificar"}
        </p>

        <p>
          <strong>Estado:</strong> {formatStatus(product.status)}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;