import { v2 as cloudinary } from "cloudinary";

import env from "./env.js";

const { cloudName, apiKey, apiSecret } = env.cloudinary;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Las variables de entorno de Cloudinary no están configuradas",
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
