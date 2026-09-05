import { useEffect, useState } from "react";

import {
  getProductImages,
  uploadProductImage,
  setMainProductImage,
  deleteProductImage,
} from "../services/productImageService.js";

function ProductImageManager({
  productId,
  token,
  onSaved,
  onBack,
  onAuthError,
}) {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadImages = async () => {
    try {
      const response = await getProductImages(productId);
      setImages(response.data);
      setError("");
    } catch (error) {
      onAuthError?.(error);
      setError(error.message);
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialImages = async () => {
      try {
        const response = await getProductImages(productId);

        if (!ignore) {
          setImages(response.data);
          setError("");
        }
      } catch (error) {
        if (!ignore) {
          onAuthError?.(error);
          setError(error.message);
        }
      }
    };

    loadInitialImages();

    return () => {
      ignore = true;
    };
  }, [onAuthError, productId]);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Seleccioná una imagen");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      await uploadProductImage(
        productId,
        {
          file,
          altText,
        },
        token,
      );

      setFile(null);
      setAltText("");
      setMessage("Imagen subida correctamente");

      await loadImages();

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      onAuthError?.(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetMain = async (imageId) => {
    try {
      setMessage("");
      setError("");

      await setMainProductImage(productId, imageId, token);

      setMessage("Imagen principal actualizada");

      await loadImages();

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      onAuthError?.(error);
      setError(error.message);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      setMessage("");
      setError("");

      await deleteProductImage(productId, imageId, token);

      setMessage("Imagen eliminada correctamente");

      await loadImages();

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      onAuthError?.(error);
      setError(error.message);
    }
  };

  return (
    <main className="image-manager-page">
      <section className="image-manager-card">
        <button type="button" onClick={onBack}>
          Volver
        </button>

        <h1>Gestionar imágenes</h1>

        <form onSubmit={handleUpload}>
          <label>
            Imagen
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
              }}
            />
          </label>

          <label>
            Texto alternativo
            <input
              type="text"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
            />
          </label>

          <button type="submit" disabled={loading || !file}>
            {loading ? "Subiendo..." : "Subir imagen"}
          </button>
        </form>

        {message && (
          <p className="form-message form-message--success">{message}</p>
        )}

        {error && (
          <div className="form-message form-message--error">
            <strong>No se pudo completar la operación.</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="image-manager-list">
          {images.length === 0 ? (
            <p>Este producto no tiene imágenes.</p>
          ) : (
            images.map((image) => (
              <article className="image-manager-item" key={image.id}>
                <img
                  src={image.image_url}
                  alt={image.alt_text || "Imagen del producto"}
                />

                <div>
                  <p>
                    {image.is_main ? "Imagen principal" : "Imagen secundaria"}
                  </p>

                  {!image.is_main && (
                    <button
                      type="button"
                      onClick={() => handleSetMain(image.id)}
                    >
                      Marcar como principal
                    </button>
                  )}

                  <button type="button" onClick={() => handleDelete(image.id)}>
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default ProductImageManager;
