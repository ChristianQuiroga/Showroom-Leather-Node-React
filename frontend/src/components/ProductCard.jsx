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
  };

  return statuses[status] || status;
};

function ProductCard({
  product,
  onSelect,
  onEdit,
  onManageImages,
  onActivate,
  onDeactivate,
  actionLoading = false,
  showAdminState = false,
  isFavorite = false,
  onToggleFavorite,
}) {
  return (
    <article className="product-card">
      {onToggleFavorite && (
        <button className={`favorite-toggle${isFavorite ? " favorite-toggle--active" : ""}`} type="button" onClick={onToggleFavorite} aria-label={`${isFavorite ? "Quitar de" : "Agregar a"} favoritos: ${product.name}`} aria-pressed={isFavorite} title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}>
          {isFavorite ? "★" : "☆"}
        </button>
      )}
      {onSelect ? (
        <button className="product-card__image-button" type="button" onClick={onSelect} aria-label={`Ver detalle de ${product.name}`}>
          {product.main_image_url ? <img className="product-card__image" src={product.main_image_url} alt={product.name} /> : <span className="product-card__placeholder">Sin imagen</span>}
        </button>
      ) : product.main_image_url ? (
        <img className="product-card__image" src={product.main_image_url} alt={product.name} />
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

        {onSelect && (
          <button className="product-card__view" type="button" onClick={onSelect}>
            Ver detalle <span aria-hidden="true">→</span>
          </button>
        )}

        {showAdminState && (
          <>
            <p>
              <strong>Registro:</strong>{" "}
              {product.is_active ? "Activo" : "Inactivo"}
            </p>
            <p>
              <strong>Publicación:</strong>{" "}
              {product.is_published ? "Publicado" : "No publicado"}
            </p>
          </>
        )}

        {showAdminState && (
          <div className="product-card__actions">
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
          {onDeactivate && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={(event) => {
                event.stopPropagation();
                onDeactivate();
              }}
            >
              {actionLoading ? "Desactivando..." : "Desactivar"}
            </button>
          )}
          {onActivate && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={(event) => {
                event.stopPropagation();
                onActivate();
              }}
            >
              {actionLoading ? "Activando..." : "Activar"}
            </button>
          )}
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
