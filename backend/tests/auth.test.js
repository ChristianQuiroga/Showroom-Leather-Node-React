import request from "supertest";

import app from "../src/app.js";

import pool from "../src/config/database.js";

describe("Auth endpoints", () => {
  describe("POST /api/auth/login", () => {
    test("Debe devolver 200 y un token con credenciales válidas", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "admin@showroom.com",
        password: process.env.TEST_ADMIN_PASSWORD,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email");
      expect(response.body.user).toHaveProperty("role", "admin");
    });

    test("Debe devolver 401 si la contraseña es incorrecta", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "admin@showroom.com",
        password: "password-incorrecta",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Credenciales inválidas");
    });

    test("Debe devolver 401 si el email no existe", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "noexiste@showroom.com",
        password: "cualquier-password",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Credenciales inválidas");
    });
  });

  describe("GET /api/auth/me", () => {
    test("Debe devolver 401 si no se envía token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Token no proporcionado");
    });

    test("Debe devolver 200 y los datos del usuario con token válido", async () => {
      // 1. Hacemos login para obtener un token real
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "admin@showroom.com",
        password: process.env.TEST_ADMIN_PASSWORD,
      });

      const token = loginResponse.body.token;

      // 2. Usamos el token en /me
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("user");

      expect(response.body.user).toHaveProperty("email", "admin@showroom.com");

      expect(response.body.user).toHaveProperty("role", "admin");

      expect(response.body.user).toHaveProperty("is_active", true);
    });

    test("Debe devolver 401 si el token es inválido", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer token-invalido");

      expect(response.statusCode).toBe(401);

      expect(response.body).toHaveProperty("message", "Token inválido");
    });
  });
});

// Cerrar la conexión a la base de datos después de todas las pruebas
afterAll(async () => {
  await pool.end();
});
