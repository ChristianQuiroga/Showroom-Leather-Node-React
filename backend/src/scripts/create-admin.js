import bcrypt from "bcryptjs";

import pool from "../config/database.js";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

const createAdmin = async () => {
  try {
    const [name, email, password] = process.argv.slice(2);

    if (!name || !email || !password) {
      throw new Error(
        'Uso: npm run create:admin -- "Nombre" "correo@email.com" "contraseña"',
      );
    }

    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      throw new Error("Ya existe un usuario registrado con ese correo");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await createUser({
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role: "admin",
    });

    console.log("Administrador creado correctamente:");
    console.table({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.is_active,
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

createAdmin();
