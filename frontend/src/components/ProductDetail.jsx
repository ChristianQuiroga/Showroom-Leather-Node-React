import { useEffect, useState } from "react";

import { getProductImages } from "../services/productImageService.js";
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
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [loadedProductId, setLoadedProductId] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadProductDetail = async () => {
      const [productResult, imagesResult] = await Promise.allSettled([
        getProductById(productId),
        getProductImages(productId),
      ]);

      if (ignore) {
        return;
      }

      if (productResult.status === "rejected") {
        setProduct(null);
        setImages([]);
        setSelectedImageId(null);
        setError(productResult.reason.message);
        setGalleryError("");
        setLoadedProductId(productId);
        setLoading(false);
        return;
      }

      setProduct(productResult.value.data);
      setError("");

      if (imagesResult.status === "fulfilled") {
        const productImages = imagesResult.value.data;
        const initialImage =
          productImages.find((image) => image.is_main) ||
          productImages[0] ||
          null;

        setImages(productImages);
        setSelectedImageId(initialImage?.id ?? null);
        setGalleryError("");
      } else {
        setImages([]);
        setSelectedImageId(null);
        setGalleryError(imagesResult.reason.message);
      }

      setLoadedProductId(productId);
      setLoading(false);
    };

    loadProductDetail();

    return () => {
      ignore = true;
    };
  }, [productId]);

  const selectedImage =
    images.find((image) => image.id === selectedImageId) || null;

  if (loading || loadedProductId !== productId) {
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

      {selectedImage ? (
        <img
          className="product-detail__image"
          src={selectedImage.image_url}
          alt={selectedImage.alt_text || product.name}
        />
      ) : (
        <div className="product-detail__placeholder">Sin imagen</div>
      )}

      {galleryError && (
        <p className="product-detail__gallery-error" role="alert">
          No se pudo cargar la galería: {galleryError}
        </p>
      )}

      {images.length > 1 && (
        <div
          className="product-detail__thumbnails"
          aria-label="Galería de imágenes"
        >
          {images.map((image, index) => {
            const isSelected = image.id === selectedImageId;
            const imageAlt = image.alt_text || product.name;

            return (
              <button
                className={`product-detail__thumbnail${
                  isSelected ? " product-detail__thumbnail--selected" : ""
                }`}
                type="button"
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                aria-label={`Mostrar imagen ${index + 1}: ${imageAlt}`}
                aria-pressed={isSelected}
              >
                <img src={image.image_url} alt="" />
              </button>
            );
          })}
        </div>
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
