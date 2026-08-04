import pool from "../config/database.js";

export const findAll = async () => {
  const query = `
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    ORDER BY name ASC
  `;

  const result = await pool.query(query);

  return result.rows;
};

export const findById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};

export const findByName = async (name) => {
  const query = `
    SELECT
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
    FROM categories
    WHERE LOWER(name) = LOWER($1)
  `;

  const result = await pool.query(query, [name]);

  return result.rows[0] ?? null;
};

export const create = async ({ name, description }) => {
  const query = `
    INSERT INTO categories (
      name,
      description
    )
    VALUES ($1, $2)
    RETURNING
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `;

  const values = [name, description ?? null];

  const result = await pool.query(query, values);

  return result.rows[0];
};

export const update = async (id, { name, description }) => {
  const query = `
    UPDATE categories
    SET
      name = $1,
      description = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `;

  const values = [name, description ?? null, id];

  const result = await pool.query(query, values);

  return result.rows[0] ?? null;
};

export const deactivate = async (id) => {
  const query = `
    UPDATE categories
    SET
      is_active = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
      name,
      description,
      is_active,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
};
