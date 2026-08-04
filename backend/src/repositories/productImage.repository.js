import pool from "../config/database.js";

const imageFields = `
  id,
  product_id,
  image_url,
  public_id,
  alt_text,
  is_main,
  display_order,
  created_at
`;

export const findAllByProductId = async (productId) => {
  const query = `
    SELECT ${imageFields}
    FROM product_images
    WHERE product_id = $1
    ORDER BY
      is_main DESC,
      display_order ASC,
      created_at ASC
  `;

  const result = await pool.query(query, [productId]);

  return result.rows;
};

export const findByIdAndProductId = async (imageId, productId) => {
  const query = `
    SELECT ${imageFields}
    FROM product_images
    WHERE id = $1
      AND product_id = $2
  `;

  const result = await pool.query(query, [imageId, productId]);

  return result.rows[0] ?? null;
};

export const findByUrl = async (productId, imageUrl) => {
  const query = `
    SELECT id, product_id, image_url
    FROM product_images
    WHERE product_id = $1
      AND image_url = $2
  `;

  const result = await pool.query(query, [productId, imageUrl]);

  return result.rows[0] ?? null;
};

export const countByProductId = async (productId) => {
  const query = `
    SELECT COUNT(*)::integer AS total
    FROM product_images
    WHERE product_id = $1
  `;

  const result = await pool.query(query, [productId]);

  return result.rows[0].total;
};

export const create = async ({
  productId,
  imageUrl,
  publicId,
  altText,
  isMain,
  displayOrder,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (isMain) {
      await client.query(
        `
          UPDATE product_images
          SET is_main = false
          WHERE product_id = $1
        `,
        [productId],
      );
    }

    const query = `
      INSERT INTO product_images (
        product_id,
        image_url,
        public_id,
        alt_text,
        is_main,
        display_order
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${imageFields}
    `;

    const values = [
      productId,
      imageUrl,
      publicId,
      altText,
      isMain,
      displayOrder,
    ];

    const result = await client.query(query, values);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const setAsMain = async (productId, imageId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        UPDATE product_images
        SET is_main = false
        WHERE product_id = $1
      `,
      [productId],
    );

    const result = await client.query(
      `
        UPDATE product_images
        SET is_main = true
        WHERE id = $1
          AND product_id = $2
        RETURNING ${imageFields}
      `,
      [imageId, productId],
    );

    await client.query("COMMIT");

    return result.rows[0] ?? null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const remove = async (productId, imageId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deletedResult = await client.query(
      `
        DELETE FROM product_images
        WHERE id = $1
          AND product_id = $2
        RETURNING ${imageFields}
      `,
      [imageId, productId],
    );

    const deletedImage = deletedResult.rows[0] ?? null;

    if (deletedImage?.is_main) {
      await client.query(
        `
          UPDATE product_images
          SET is_main = true
          WHERE id = (
            SELECT id
            FROM product_images
            WHERE product_id = $1
            ORDER BY display_order ASC, created_at ASC
            LIMIT 1
          )
        `,
        [productId],
      );
    }

    await client.query("COMMIT");

    return deletedImage;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
