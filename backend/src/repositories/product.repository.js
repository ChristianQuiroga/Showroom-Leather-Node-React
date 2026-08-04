import pool from "../config/database.js";

const productFields = `
  p.id,
  p.code,
  p.name,
  p.description,
  p.category_id,
  c.name AS category_name,
  p.material,
  p.color,
  p.size,
  p.price,
  p.stock,
  p.status,
  p.is_featured,
  p.is_published,
  p.is_active,
  p.created_at,
  p.updated_at
`;

export const findAll = async () => {
  const query = `
    SELECT ${productFields}
    FROM products p
    INNER JOIN categories c
      ON c.id = p.category_id
    ORDER BY p.created_at DESC
  `;

  const result = await pool.query(query);

  return result.rows;
};

export const findById = async (id) => {
  const query = `
    SELECT ${productFields}
    FROM products p
    INNER JOIN categories c
      ON c.id = p.category_id
    WHERE p.id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};

export const findByCode = async (code) => {
  const query = `
    SELECT
      id,
      code
    FROM products
    WHERE LOWER(code) = LOWER($1)
  `;

  const result = await pool.query(query, [code]);

  return result.rows[0] ?? null;
};

export const create = async ({
  code,
  name,
  description,
  categoryId,
  material,
  color,
  size,
  price,
  stock,
  status,
  isFeatured,
  isPublished,
}) => {
  const query = `
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
      is_published
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11, $12
    )
    RETURNING
      id,
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
      is_active,
      created_at,
      updated_at
  `;

  const values = [
    code,
    name,
    description,
    categoryId,
    material,
    color,
    size,
    price,
    stock,
    status,
    isFeatured,
    isPublished,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const update = async (
  id,
  {
    name,
    description,
    categoryId,
    material,
    color,
    size,
    price,
    stock,
    status,
    isFeatured,
    isPublished,
  }
) => {
  const query = `
    UPDATE products
    SET
      name = $1,
      description = $2,
      category_id = $3,
      material = $4,
      color = $5,
      size = $6,
      price = $7,
      stock = $8,
      status = $9,
      is_featured = $10,
      is_published = $11,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $12
    RETURNING
      id,
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
      is_active,
      created_at,
      updated_at
  `;

  const values = [
    name,
    description,
    categoryId,
    material,
    color,
    size,
    price,
    stock,
    status,
    isFeatured,
    isPublished,
    id,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] ?? null;
};

export const deactivate = async (id) => {
  const query = `
    UPDATE products
    SET
      is_active = false,
      is_published = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
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
      is_active,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};