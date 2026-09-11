import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import pool from "../src/config/database.js";
import env from "../src/config/env.js";

let adminToken;
let nonAdminToken;
let createdProductId;
let createdProductName;
const visibilityFixtureIds = [];
let publicProductId;
let inactiveProductId;
let unpublishedProductId;
let unpublishedProductName;

beforeAll(async () => {
  const loginResponse = await request(app).post("/api/auth/login").send({
    email: "admin@showroom.com",
    password: process.env.TEST_ADMIN_PASSWORD,
  });

  adminToken = loginResponse.body.token;
  nonAdminToken = jwt.sign(
    { userId: 0, email: "cliente@example.com", role: "customer" },
    env.jwt.secret,
    { expiresIn: "5m" },
  );

  const categoryResult = await pool.query(`
    SELECT id
    FROM categories
    WHERE is_active = true
    ORDER BY id
    LIMIT 1
  `);

  if (!categoryResult.rows[0]) {
    throw new Error("Se requiere una categoría activa para probar productos");
  }

  const fixtureSuffix = `${Date.now()}-${process.pid}`;
  const productsResult = await pool.query(
    `
      INSERT INTO products (
        code,
        name,
        description,
        category_id,
        material,
        color,
        size,
        price,
        stock,
        status,
        is_featured,
        is_published,
        is_active
      )
      VALUES
        ($1, $2, 'Fixture público', $7, 'Cuero', 'Negro', 'M', 1000, 1, 'available', false, true, true),
        ($3, $4, 'Fixture inactivo', $7, 'Cuero', 'Negro', 'M', 1000, 1, 'available', false, true, false),
        ($5, $6, 'Fixture no publicado', $7, 'Cuero', 'Negro', 'M', 1000, 1, 'available', false, false, true)
      RETURNING id, name, is_active, is_published
    `,
    [
      `PUB-${fixtureSuffix}`,
      `Producto público ${fixtureSuffix}`,
      `INA-${fixtureSuffix}`,
      `Producto inactivo ${fixtureSuffix}`,
      `UNP-${fixtureSuffix}`,
      `Producto no publicado ${fixtureSuffix}`,
      categoryResult.rows[0].id,
    ],
  );

  const publicProduct = productsResult.rows.find(
    (product) => product.is_active && product.is_published,
  );
  const inactiveProduct = productsResult.rows.find(
    (product) => !product.is_active,
  );
  const unpublishedProduct = productsResult.rows.find(
    (product) => product.is_active && !product.is_published,
  );

  publicProductId = publicProduct.id;
  inactiveProductId = inactiveProduct.id;
  unpublishedProductId = unpublishedProduct.id;
  unpublishedProductName = unpublishedProduct.name;
  visibilityFixtureIds.push(
    publicProductId,
    inactiveProductId,
    unpublishedProductId,
  );

  await pool.query(
    `
      INSERT INTO product_images (
        product_id,
        image_url,
        public_id,
        alt_text,
        is_main,
        display_order
      )
      VALUES
        ($1, $4, NULL, 'Imagen pública', true, 0),
        ($2, $5, NULL, 'Metadato privado inactivo', true, 0),
        ($3, $6, NULL, 'Metadato privado no publicado', true, 0)
    `,
    [
      publicProductId,
      inactiveProductId,
      unpublishedProductId,
      `https://example.test/public-${fixtureSuffix}.webp`,
      `https://example.test/inactive-${fixtureSuffix}.webp`,
      `https://example.test/unpublished-${fixtureSuffix}.webp`,
    ],
  );
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
      createdProductName = uniqueName;
    });
  });

  describe("Visibilidad pública por ID", () => {
    const notFoundResponse = {
      status: "error",
      message: "Producto no encontrado",
    };

    test("Debe devolver el detalle activo y publicado sin JWT", async () => {
      const response = await request(app).get(
        `/api/products/${publicProductId}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toMatchObject({
        id: publicProductId,
        is_active: true,
        is_published: true,
      });
    });

    test.each([
      ["inexistente", 2147483646],
      ["inactivo", () => inactiveProductId],
      ["no publicado", () => unpublishedProductId],
    ])("Debe ocultar el detalle de un producto %s", async (_state, id) => {
      const productId = typeof id === "function" ? id() : id;
      const response = await request(app).get(`/api/products/${productId}`);

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(notFoundResponse);
    });

    test("Debe conservar la validación del ID en el detalle", async () => {
      const response = await request(app).get("/api/products/id-invalido");

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: "El ID del producto no es válido",
      });
    });

    test("Debe devolver imágenes de un producto público sin JWT", async () => {
      const response = await request(app).get(
        `/api/products/${publicProductId}/images`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        product_id: publicProductId,
        alt_text: "Imagen pública",
      });
    });

    test.each([
      ["inexistente", 2147483646],
      ["inactivo", () => inactiveProductId],
      ["no publicado", () => unpublishedProductId],
    ])("Debe ocultar imágenes de un producto %s", async (_state, id) => {
      const productId = typeof id === "function" ? id() : id;
      const response = await request(app).get(
        `/api/products/${productId}/images`,
      );

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual(notFoundResponse);
      expect(response.body).not.toHaveProperty("data");
    });

    test("Debe devolver una colección vacía para un producto público sin imágenes", async () => {
      await pool.query("DELETE FROM product_images WHERE product_id = $1", [
        publicProductId,
      ]);

      const response = await request(app).get(
        `/api/products/${publicProductId}/images`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    test("Debe conservar la validación del ID al consultar imágenes", async () => {
      const response = await request(app).get(
        "/api/products/id-invalido/images",
      );

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        status: "error",
        message: "El ID del producto no es válido",
      });
    });
  });

  describe("GET /api/products/admin", () => {
    test("Debe devolver 401 si no se envía token", async () => {
      const response = await request(app).get("/api/products/admin");

      expect(response.statusCode).toBe(401);
    });

    test("Debe devolver 403 si el usuario no es administrador", async () => {
      const response = await request(app)
        .get("/api/products/admin")
        .set("Authorization", `Bearer ${nonAdminToken}`);

      expect(response.statusCode).toBe(403);
    });

    test("Debe devolver el listado paginado al administrador", async () => {
      const response = await request(app)
        .get(
          `/api/products/admin?search=${encodeURIComponent(createdProductName)}`,
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: createdProductId,
        is_active: true,
        is_published: true,
      });
    });

    test("Debe permitir al administrador obtener un producto activo no publicado", async () => {
      const response = await request(app)
        .get(
          `/api/products/admin?search=${encodeURIComponent(unpublishedProductName)}`,
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);

      const unpublishedProduct = response.body.data.find(
        (product) => product.id === unpublishedProductId,
      );

      expect(unpublishedProduct).toMatchObject({
        id: unpublishedProductId,
        is_active: true,
        is_published: false,
      });
    });
  });

  describe("Transiciones de actividad del producto", () => {
    test("Debe proteger la desactivación sin token", async () => {
      const response = await request(app).delete(
        `/api/products/${createdProductId}`,
      );

      expect(response.statusCode).toBe(401);
    });

    test("Debe desactivar un producto activo", async () => {
      const response = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty("is_active", false);
      expect(response.body.data).toHaveProperty("is_published", false);
    });

    test("El público no debe listar el producto inactivo", async () => {
      const response = await request(app).get(
        `/api/products?search=${encodeURIComponent(createdProductName)}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    test("El administrador debe listar el producto inactivo", async () => {
      const response = await request(app)
        .get(
          `/api/products/admin?search=${encodeURIComponent(createdProductName)}`,
        )
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toMatchObject({
        id: createdProductId,
        is_active: false,
        is_published: false,
      });
    });

    test("Debe devolver 409 al desactivar nuevamente", async () => {
      const response = await request(app)
        .delete(`/api/products/${createdProductId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(409);
    });

    test("Debe proteger la reactivación sin token", async () => {
      const response = await request(app).patch(
        `/api/products/${createdProductId}/activate`,
      );

      expect(response.statusCode).toBe(401);
    });

    test("Debe devolver 404 al reactivar un producto inexistente", async () => {
      const response = await request(app)
        .patch("/api/products/2147483647/activate")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(404);
    });

    test("Debe reactivar sin modificar la publicación", async () => {
      const response = await request(app)
        .patch(`/api/products/${createdProductId}/activate`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty("is_active", true);
      expect(response.body.data).toHaveProperty("is_published", false);
    });

    test("Debe devolver 409 al reactivar nuevamente", async () => {
      const response = await request(app)
        .patch(`/api/products/${createdProductId}/activate`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(409);
    });
  });
});

afterAll(async () => {
  if (createdProductId) {
    await pool.query("DELETE FROM products WHERE id = $1", [createdProductId]);
  }

  if (visibilityFixtureIds.length > 0) {
    await pool.query("DELETE FROM products WHERE id = ANY($1::int[])", [
      visibilityFixtureIds,
    ]);
  }

  await pool.end();
});
