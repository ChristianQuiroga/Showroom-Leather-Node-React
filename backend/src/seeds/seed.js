import bcrypt from "bcryptjs";

import pool from "../config/database.js";

const runSeed = async () => {
  try {
    if (process.env.NODE_ENV === "production") {
      throw new Error("El seed no puede ejecutarse en producción");
    }

    console.log("Iniciando seed...");

    // ============================
    // 1. Seed de categorías
    // ============================

    const categories = ["Camperas", "Chalecos", "Accesorios"];

    for (const categoryName of categories) {
      const existingCategory = await pool.query(
        `
      SELECT id
      FROM categories
      WHERE LOWER(name) = LOWER($1)
      LIMIT 1
    `,
        [categoryName],
      );

      if (existingCategory.rows.length > 0) {
        console.log(`Categoría existente: ${categoryName}`);
        continue;
      }

      await pool.query(
        `
      INSERT INTO categories (name)
      VALUES ($1)
    `,
        [categoryName],
      );

      console.log(`Categoría creada: ${categoryName}`);
    }

    // ============================
    // 2. Seed del administrador
    // ============================

    const adminName = process.env.SEED_ADMIN_NAME;
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminName || !adminEmail || !adminPassword) {
      throw new Error(
        "Faltan variables SEED_ADMIN_NAME, SEED_ADMIN_EMAIL o SEED_ADMIN_PASSWORD",
      );
    }

    const existingAdmin = await pool.query(
      `
    SELECT id
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
  `,
      [adminEmail],
    );

    if (existingAdmin.rows.length > 0) {
      console.log(`Administrador existente: ${adminEmail}`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      await pool.query(
        `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, LOWER($2), $3, 'admin', true)
    `,
        [adminName, adminEmail, passwordHash],
      );

      console.log(`Administrador creado: ${adminEmail}`);
    }

    // ============================
    const categoryRows = await pool.query(`
  SELECT id, name
  FROM categories
`);

    const categoryMap = {};

    for (const category of categoryRows.rows) {
      categoryMap[category.name.toLowerCase()] = category.id;
    }

    const products = [
      {
        code: "CAMP-001",
        name: "Campera de cuero negra",
        description: "Campera clásica de cuero negro",
        categoryId: categoryMap["camperas"],
        material: "Cuero",
        color: "Negro",
        size: "M",
        price: 185000,
        stock: 1,
        status: "available",
        isFeatured: true,
        isPublished: true,
      },
      {
        code: "CAMP-002",
        name: "Campera de cuero marrón",
        description: "Campera de cuero marrón estilo clásico",
        categoryId: categoryMap["camperas"],
        material: "Cuero",
        color: "Marrón",
        size: "L",
        price: 195000,
        stock: 1,
        status: "available",
        isFeatured: false,
        isPublished: true,
      },
      {
        code: "CHAL-001",
        name: "Chaleco de cuero negro",
        description: "Chaleco de cuero negro estilo urbano",
        categoryId: categoryMap["chalecos"],
        material: "Cuero",
        color: "Negro",
        size: "M",
        price: 120000,
        stock: 1,
        status: "available",
        isFeatured: false,
        isPublished: true,
      },
    ];

    for (const product of products) {
      if (!product.categoryId) {
        throw new Error(
          `No se encontró la categoría para el producto ${product.name}`,
        );
      }

      const existingProduct = await pool.query(
        `
      SELECT id
      FROM products
      WHERE LOWER(code) = LOWER($1)
      LIMIT 1
    `,
        [product.code],
      );

      if (existingProduct.rows.length > 0) {
        console.log(`Producto existente: ${product.name}`);
        continue;
      }

      await pool.query(
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
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, true
      )
    `,
        [
          product.code,
          product.name,
          product.description,
          product.categoryId,
          product.material,
          product.color,
          product.size,
          product.price,
          product.stock,
          product.status,
          product.isFeatured,
          product.isPublished,
        ],
      );

      console.log(`Producto creado: ${product.name}`);
    }

    console.log("Seed completado correctamente");
  } catch (error) {
    console.error(`Error ejecutando seed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runSeed();
