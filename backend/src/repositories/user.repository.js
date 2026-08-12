import pool from "../config/database.js";

export const findUserById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0] || null;
};

export const findUserByEmail = async (email) => {
  const query = `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1;
  `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] || null;
};

export const createUser = async ({
  name,
  email,
  passwordHash,
  role = "admin",
}) => {
  const query = `
    INSERT INTO users (
      name,
      email,
      password_hash,
      role
    )
    VALUES ($1, LOWER($2), $3, $4)
    RETURNING
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at;
  `;

  const values = [name, email, passwordHash, role];

  const { rows } = await pool.query(query, values);

  return rows[0];
};
