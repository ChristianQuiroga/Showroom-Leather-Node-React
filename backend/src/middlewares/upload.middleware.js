import multer from "multer";

import { AppError } from "../utils/AppError.js";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new AppError("Solo se permiten imágenes JPG, PNG o WEBP", 400),
    );
  }

  callback(null, true);
};

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("image");
