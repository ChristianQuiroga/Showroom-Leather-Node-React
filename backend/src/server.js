
// app.listen(env.port, () => {
//   console.log(`Servidor ejecutándose en http://localhost:${env.port} [${env.nodeEnv}]`
//   );
// });

import app from "./app.js";
import env from "./config/env.js";
import { testDatabaseConnection } from "./config/database.js";

const startServer = async () => {
  try {
    await testDatabaseConnection();

    app.listen(env.port, () => {
      console.log(
        `Servidor ejecutándose en http://localhost:${env.port} [${env.nodeEnv}]`
      );
    });
  } catch (error) {
    console.error("No se pudo iniciar la aplicación:", error.message);
    process.exit(1);
  }
};

startServer();