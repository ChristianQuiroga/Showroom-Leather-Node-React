# Showroom Leather — Setup & Final Validation

## 1. Requisitos

- Node.js
- npm
- PostgreSQL
- cuenta/configuración Cloudinary
- variables JWT
- configuración WhatsApp

## 2. Variables de entorno

Mantener:
- `.env` fuera del repositorio;
- `.env.example` sin secretos.

Revisar como mínimo:
- conexión PostgreSQL;
- JWT secret;
- expiración JWT;
- Cloudinary;
- teléfono WhatsApp;
- CORS;
- API URL del frontend.

## 3. Backend

Flujo general:

```bash
cd backend
npm install
npm run dev
```

Tests:

```bash
npm test
```

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

## 5. Seguridad antes del cierre

- `.env` ignorado;
- secrets fuera de Git;
- bcrypt;
- rutas admin protegidas;
- CORS limitado;
- JWT expira;
- logout elimina token;
- no stack trace en producción.

## 6. Checklist smoke test

### Público
- [ ] catálogo abre sin login;
- [ ] búsqueda;
- [ ] filtros;
- [ ] limpiar filtros;
- [ ] paginación;
- [ ] detalle;
- [ ] galería;
- [ ] WhatsApp.

### Admin
- [ ] login;
- [ ] crear producto;
- [ ] editar;
- [ ] desactivar;
- [ ] reactivar;
- [ ] categorías;
- [ ] imágenes;
- [ ] cambiar principal;
- [ ] eliminar imagen;
- [ ] logout.

## 7. Regression

Verificar que los cambios finales no rompan:
- auth;
- productos;
- categorías;
- imágenes;
- filtros;
- paginación;
- Cloudinary;
- WhatsApp.

## 8. Definition of Done

- [ ] catálogo público completo;
- [ ] administración completa;
- [ ] auth protegida;
- [ ] errores consistentes;
- [ ] backend tests verdes;
- [ ] smoke test verde;
- [ ] regression verde;
- [ ] secretos protegidos;
- [ ] README actualizado;
- [ ] Jira actualizado;
- [ ] deuda MVP v2 separada.

## 9. Regla de scope

No agregar nuevas features durante el cierre del MVP salvo que sean necesarias para:
- corregir un bug;
- cumplir acceptance criteria;
- resolver seguridad;
- evitar regresión;
- completar un flujo comprometido.
