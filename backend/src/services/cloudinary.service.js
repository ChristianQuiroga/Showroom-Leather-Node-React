import { Readable } from "node:stream";

import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

export const uploadImageBuffer = async (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "showroom-leather/products",
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(
            new AppError("No se pudo subir la imagen a Cloudinary", 502)
          );
        }

        if (!result?.secure_url || !result?.public_id) {
          return reject(
            new AppError("Cloudinary devolvió una respuesta inválida", 502)
          );
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteCloudinaryImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (!["ok", "not found"].includes(result.result)) {
      throw new AppError(
        "No se pudo eliminar la imagen de Cloudinary",
        502
      );
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Error al comunicarse con Cloudinary",
      502
    );
  }
};