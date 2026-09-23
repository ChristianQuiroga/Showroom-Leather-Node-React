import { useEffect, useRef, useState } from "react";

import {
  getAdminProductImages,
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
  const [pendingAction, setPendingAction] = useState(null);
  const mutationInFlightRef = useRef(false);

  const loadImages = async () => {
    try {
      const response = await getAdminProductImages(productId, token);
      setImages(response.data);
      setError("");
    } catch (error) {
      onAuthError?.(error);
      setError(error.message);
      throw error;
    }
  };

  const beginMutation = (action) => {
    if (mutationInFlightRef.current) {
      return false;
    }

    mutationInFlightRef.current = true;
    setPendingAction(action);
    return true;
  };

  const endMutation = () => {
    mutationInFlightRef.current = false;
    setPendingAction(null);
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialImages = async () => {
      try {
        const response = await getAdminProductImages(productId, token);

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
  }, [onAuthError, productId, token]);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Seleccioná una imagen");
      return;
    }

    let mutationSucceeded = false;

    if (!beginMutation("upload")) {
      return;
    }

    try {
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
      mutationSucceeded = true;

      setFile(null);
      setAltText("");
      await loadImages();

      setMessage("Imagen subida correctamente");

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      onAuthError?.(error);
      if (mutationSucceeded) {
        setMessage("La operación se realizó, pero no se pudo actualizar la vista");
        setError("");
      } else {
        setError(error.message);
      }
    } finally {
      endMutation();
    }
  };

  const handleSetMain = async (imageId) => {
    if (!beginMutation("set-main")) {
      return;
    }

    let mutationSucceeded = false;

    try {
      setMessage("");
      setError("");

      await setMainProductImage(productId, imageId, token);
      mutationSucceeded = true;

      await loadImages();

      setMessage("Imagen principal actualizada");

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      onAuthError?.(error);
      if (mutationSucceeded) {
        setMessage("La operación se realizó, pero no se pudo actualizar la vista");
        setError("");
      } else {
        setError(error.message);
      }
    } finally {
      endMutation();
    }
  };

  const handleDelete = async (imageId) => {
    if (!beginMutation("delete")) {
      return;
    }

    let mutationSucceeded = false;

    try {
      setMessage("");
      setError("");

      await deleteProductImage(productId, imageId, token);
      mutationSucceeded = true;

      await loadImages();

      setMessage("Imagen eliminada correctamente");

      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      onAuthError?.(error);
      if (mutationSucceeded) {
        setMessage("La operación se realizó, pero no se pudo actualizar la vista");
        setError("");
      } else {
        setError(error.message);
      }
    } finally {
      endMutation();
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

          <button type="submit" disabled={pendingAction !== null || !file}>
            {pendingAction === "upload" ? "Subiendo..." : "Subir imagen"}
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
                      disabled={pendingAction !== null}
                    >
                      {pendingAction === "set-main"
                        ? "Actualizando..."
                        : "Marcar como principal"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    disabled={pendingAction !== null}
                  >
                    {pendingAction === "delete" ? "Eliminando..." : "Eliminar"}
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
