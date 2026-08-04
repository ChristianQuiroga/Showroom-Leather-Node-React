export const up = (pgm) => {
  pgm.createTable("products", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    code: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },

    name: {
      type: "varchar(150)",
      notNull: true,
    },

    description: {
      type: "text",
      notNull: false,
    },

    category_id: {
      type: "integer",
      notNull: true,
      references: "categories",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },

    material: {
      type: "varchar(100)",
      notNull: true,
    },

    color: {
      type: "varchar(50)",
      notNull: true,
    },

    size: {
      type: "varchar(20)",
      notNull: true,
    },

    price: {
      type: "numeric(12,2)",
      notNull: true,
      check: "price > 0",
    },

    stock: {
      type: "integer",
      notNull: true,
      default: 0,
      check: "stock >= 0",
    },

    status: {
      type: "varchar(20)",
      notNull: true,
      default: "available",
      check:
        "status IN ('available', 'reserved', 'sold', 'unpublished')",
    },

    is_featured: {
      type: "boolean",
      notNull: true,
      default: false,
    },

    is_published: {
      type: "boolean",
      notNull: true,
      default: false,
    },

    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },

    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("products", "category_id");
  pgm.createIndex("products", "status");
  pgm.createIndex("products", "is_published");
  pgm.createIndex("products", "is_active");
};

export const down = (pgm) => {
  pgm.dropTable("products");
};