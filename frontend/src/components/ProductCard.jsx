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

function ProductCard({ product, onSelect, onEdit, onManageImages }) {
  return (
    <article className="product-card" onClick={onSelect}>
      {product.main_image_url ? (
        <img
          className="product-card__image"
          src={product.main_image_url}
          alt={product.name}
        />
      ) : (
        <div className="product-card__placeholder">Sin imagen</div>
      )}

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

        {onEdit && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            Editar
          </button>
        )}
        {onManageImages && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onManageImages();
            }}
          >
            Gestionar imágenes
          </button>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
