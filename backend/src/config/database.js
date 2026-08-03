import pg from "pg";

import env from "./env.js";

const { Pool } = pg;

if (!env.databaseUrl) {
  throw new Error("La variable de entorno DATABASE_URL no está configurada");
}

const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error);
});

export const testDatabaseConnection = async () => {
  const result = await pool.query("SELECT NOW() AS current_time");

  console.log(
    `PostgreSQL conectado correctamente: ${result.rows[0].current_time}`
  );
};

export default pool;