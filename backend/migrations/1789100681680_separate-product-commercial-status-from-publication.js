/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(`
    DO $$
    DECLARE
      affected_count integer;
    BEGIN
      SELECT COUNT(*) INTO affected_count
      FROM products
      WHERE status = 'unpublished';

      RAISE NOTICE 'SL-37: normalizing % product(s) with status=unpublished', affected_count;
    END $$;
  `);

  pgm.sql(`
    UPDATE products
    SET
      status = CASE WHEN stock = 0 THEN 'sold' ELSE 'available' END,
      is_published = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE status = 'unpublished';
  `);

  pgm.dropConstraint("products", "products_status_check");
  pgm.addConstraint("products", "products_status_check", {
    check: "status IN ('available', 'reserved', 'sold')",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropConstraint("products", "products_status_check");
  pgm.addConstraint("products", "products_status_check", {
    check: "status IN ('available', 'reserved', 'sold', 'unpublished')",
  });

  // La normalización del up es irreversible: no existe información suficiente
  // para reconstruir cuáles productos usaban antes el estado ambiguo.
};
