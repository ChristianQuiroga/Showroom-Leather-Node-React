import request from "supertest";

import app from "../src/app.js";
import pool from "../src/config/database.js";

let adminToken;
let createdProductId;

beforeAll(async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "admin@showroom.com",
    password: process.env.TEST_ADMIN_PASSWORD,
  });

  adminToken = loginResponse.body.token;
});

describe("Product endpoints", () => {
  describe("GET /api/products", () => {
    test("Debe devolver 200 y la estructura paginada", async () => {
      const response = await request(app).get("/api/products");

      expect(response.statusCode).toBe(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");

      expect(Array.isArray(response.body.data)).toBe(true);

      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("totalPages");
    });

    test("Debe devolver 400 si categoryId es inválido", async () => {
      const response = await request(app).get("/api/products?categoryId=abc");

      expect(response.statusCode).toBe(400);

      expect(response.body).toHaveProperty(
        "message",
        "categoryId debe ser un número entero positivo",
      );
    });

    test("Debe devolver 400 si status es inválido", async () => {
      const response = await request(app).get(
        "/api/products?status=estado-invalido",
      );

      expect(response.statusCode).toBe(400);
    });

    test("Debe devolver 400 si page es inválido", async () => {
      const response = await request(app).get("/api/products?page=0");

      expect(response.statusCode).toBe(400);

      expect(response.body).toHaveProperty(
        "message",
        "page debe ser un número entero positivo",
      );
    });

    test("Debe respetar el límite indicado", async () => {
      const response = await request(app).get("/api/products?page=1&limit=2");

      expect(response.statusCode).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.page).toBe(1);
    });
  });

  describe("POST /api/products", () => {
    test("Debe devolver 401 si no se envía token", async () => {
      const response = await request(app).post("/api/products").send({
        name: "Producto Test Sin Token",
        description: "Producto creado para prueba",
        categoryId: 1,
        material: "Cuero",
        color: "Negro",
        size: "M",
        price: 100000,
        stock: 1,
        status: "available",
        isFeatured: false,
        isPublished: true,
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty("message", "Token no proporcionado");
    });

    test("Debe crear un producto con token admin válido", async () => {
      const uniqueName = `Producto Test ${Date.now()}`;

      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: uniqueName,
          description: "Producto creado automáticamente por Jest",
          categoryId: 1,
          material: "Cuero",
          color: "Negro",
          size: "M",
          price: 100000,
          stock: 1,
          status: "available",
          isFeatured: false,
          isPublished: true,
        });

      expect(response.statusCode).toBe(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("name", uniqueName);

      createdProductId = response.body.data.id;
    });
  });
});

afterAll(async () => {
  if (createdProductId) {
    await pool.query("DELETE FROM products WHERE id = $1", [createdProductId]);
  }

  await pool.end();
});
