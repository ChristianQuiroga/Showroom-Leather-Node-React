export const up = (pgm) => {
  pgm.createTable("product_images", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    product_id: {
      type: "integer",
      notNull: true,
      references: "products",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    image_url: {
      type: "text",
      notNull: true,
    },

    public_id: {
      type: "varchar(255)",
      notNull: false,
    },

    alt_text: {
      type: "varchar(200)",
      notNull: false,
    },

    is_main: {
      type: "boolean",
      notNull: true,
      default: false,
    },

    display_order: {
      type: "integer",
      notNull: true,
      default: 0,
      check: "display_order >= 0",
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("product_images", "product_id");

  pgm.createIndex(
    "product_images",
    ["product_id", "image_url"],
    {
      unique: true,
      name: "product_images_product_url_unique",
    }
  );

  pgm.createIndex("product_images", "product_id", {
    unique: true,
    where: "is_main = true",
    name: "product_images_one_main_per_product",
  });
};

export const down = (pgm) => {
  pgm.dropTable("product_images");
};