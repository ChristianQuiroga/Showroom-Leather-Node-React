export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "serial",
      primaryKey: true,
    },

    name: {
      type: "varchar(100)",
      notNull: true,
    },

    email: {
      type: "varchar(150)",
      notNull: true,
      unique: true,
    },

    password_hash: {
      type: "varchar(255)",
      notNull: true,
    },

    role: {
      type: "varchar(20)",
      notNull: true,
      default: "admin",
      check: "role IN ('admin', 'user')",
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

  pgm.createIndex("users", "email", {
    unique: true,
    name: "users_email_unique",
  });
};

export const down = (pgm) => {
  pgm.dropTable("users");
};