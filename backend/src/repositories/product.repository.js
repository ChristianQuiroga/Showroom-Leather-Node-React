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
  p.updated_at,
  pi.image_url AS main_image_url
`;

export const findAll = async ({
  categoryId,
  status,
  search,
  limit,
  offset,
  page,
  publicOnly = true,
} = {}) => {
  const conditions = publicOnly
    ? ["p.is_active = true", "p.is_published = true"]
    : [];

  const values = [];

  if (categoryId) {
    values.push(categoryId);
    conditions.push(`p.category_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`p.status = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);

    conditions.push(`
    (
      unaccent(p.name) ILIKE unaccent($${values.length})
      OR unaccent(p.description) ILIKE unaccent($${values.length})
    )
  `);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  // Consulta de productos paginados
  const dataValues = [...values];

  dataValues.push(limit);
  const limitPosition = dataValues.length;

  dataValues.push(offset);
  const offsetPosition = dataValues.length;

  const dataQuery = `
  SELECT ${productFields}
  FROM products p
  INNER JOIN categories c
    ON c.id = p.category_id
  LEFT JOIN product_images pi
    ON pi.product_id = p.id
    AND pi.is_main = true
  ${whereClause}
  ORDER BY p.created_at DESC
  LIMIT $${limitPosition}
  OFFSET $${offsetPosition}
`;

  const dataResult = await pool.query(dataQuery, dataValues);

  // Consulta para conocer el total
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM products p
    INNER JOIN categories c
      ON c.id = p.category_id
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, values);

  const total = countResult.rows[0].total;

  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const findById = async (id) => {
  const query = `
    SELECT ${productFields}
    FROM products p
    INNER JOIN categories c
      ON c.id = p.category_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id
      AND pi.is_main = true
    WHERE p.id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};

export const findPublicById = async (id) => {
  const query = `
    SELECT ${productFields}
    FROM products p
    INNER JOIN categories c
      ON c.id = p.category_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.id
      AND pi.is_main = true
    WHERE p.id = $1
      AND p.is_active = true
      AND p.is_published = true
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
  },
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

export const activate = async (id) => {
  const query = `
    UPDATE products
    SET
      is_active = true,
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
