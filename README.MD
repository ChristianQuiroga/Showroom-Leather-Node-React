# Showroom Leather

Catálogo público de productos de cuero con búsqueda, filtros, paginación, detalle, galería y consulta por WhatsApp. La administración permite gestionar productos, categorías, imágenes y publicación mediante JWT y rol admin. No incluye carrito, pagos ni checkout.

## Stack y estructura

- Backend: Node.js (ESM), Express, PostgreSQL, JWT, bcrypt y Cloudinary.
- Frontend: React y Vite; ESLint para verificación estática.
- Tests backend: Jest y Supertest. CI: GitHub Actions con jobs backend/frontend independientes.
- `backend/src`: rutas, controllers, servicios, repositorios, middlewares y configuración.
- `backend/migrations`, `backend/tests`: esquema y pruebas.
- `frontend/src`: componentes, páginas y servicios HTTP.
- `docs/sdd`: especificación, estado y workflow del proyecto.
- `openspec`: contratos de cambios y archivo; `scripts`: verificaciones SDD.

## Requisitos

- Node.js 24.x y npm (misma línea mayor que CI).
- PostgreSQL 18 con extensión `unaccent` disponible.
- Git. PowerShell para los scripts SDD opcionales.
- Cuenta Cloudinary para operaciones reales de imágenes; teléfono de consulta WhatsApp.

## Instalación local

Desde la raíz, en PowerShell:

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Completar `.env` con valores locales; no sobrescribir uno existente. Crear una base vacía propia, configurar `DATABASE_URL` y habilitar la extensión en esa misma base con un usuario autorizado, por ejemplo desde psql:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Luego, desde `backend`:

```powershell
npm run migrate:up
npm run seed
npm run dev
```

El seed crea categorías, productos de ejemplo y un administrador con `SEED_ADMIN_*`. Usarlo solo sobre una base de desarrollo/pruebas; rechaza `NODE_ENV=production`. Las migraciones actuales no habilitan unaccent automáticamente. La API local usa por defecto `http://localhost:3000`; health check: `GET /api/health`.

En otra terminal desde la raíz:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

El frontend local usa normalmente `http://localhost:5173`. Configurar ese origen en `CORS_ORIGINS` y `VITE_API_URL=http://localhost:3000/api`.

## Variables de entorno

Los ejemplos versionados contienen nombres y valores públicos; los secretos se configuran únicamente en el entorno o archivos `.env` ignorados.

| Backend | Uso |
| --- | --- |
| `PORT`, `NODE_ENV` | Puerto y entorno; usar `production` para no exponer detalles internos en respuestas de error. |
| `CORS_ORIGINS` | Orígenes frontend permitidos, separados por comas. |
| `DATABASE_URL` | Conexión a la base correspondiente al entorno. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Secreto privado de firma y duración del token (por defecto 8h). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Configuración del proveedor; se exige que no estén vacíos al iniciar la aplicación. |
| `WHATSAPP_PHONE` | Número internacional de destino para wa.me, con dígitos sin espacios ni signo +. |
| `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Administrador inicial del seed de desarrollo/pruebas. |
| `TEST_ADMIN_PASSWORD` | Contraseña del admin de la base de pruebas. |

Frontend: `VITE_API_URL` es la URL pública del backend. Las variables `VITE_*` se incorporan al cliente: no deben contener secretos. Nunca versionar `.env`, tokens ni credenciales reales.

## Comandos principales

| Directorio | Comando | Propósito |
| --- | --- | --- |
| backend | `npm run dev` / `npm start` | Desarrollo con nodemon / iniciar servidor. |
| backend | `npm run migrate:up` | Aplicar migraciones usando `.env`. |
| backend | `npm run seed` | Datos de ejemplo y admin en base de desarrollo/pruebas. |
| backend | `npm test` | Suite Jest/Supertest. |
| frontend | `npm run dev` | Servidor de desarrollo. |
| frontend | `npm run lint` | ESLint. |
| frontend | `npm run build` / `npm run preview` | Generar `dist` / previsualizar build. |
| raíz | `git diff --check` | Detectar errores de whitespace. |

## Testing y CI

Los tests backend escriben datos: usar una base exclusiva de pruebas con unaccent, migraciones y seed. La suite espera `admin@showroom.com`; establecer `SEED_ADMIN_EMAIL` con ese valor y `TEST_ADMIN_PASSWORD` igual a `SEED_ADMIN_PASSWORD`. Usar `NODE_ENV=test` y un `JWT_SECRET` ficticio exclusivo de pruebas. Los valores Cloudinary pueden ser ficticios no vacíos para la suite actual: upload se simula y el borrado probado evita el proveedor. Esto no valida errores reales de Cloudinary ni supone un bloqueo global de red.

```powershell
cd backend
npm test
cd ../frontend
npm run lint
npm run build
cd ..
git diff --check
```

GitHub Actions ejecuta esos controles por push y PR a main, instala con `npm ci` y prepara PostgreSQL efímero desde cero. No realiza deploy ni usa secretos reales de aplicación.

Scripts SDD desde la raíz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sdd-status.ps1
powershell -ExecutionPolicy Bypass -File scripts/sdd-check.ps1
```

`sdd-status` consulta el estado local; `sdd-check` ejecuta fetch y verificaciones técnicas, usando la configuración local del backend. Antes de ejecutarlo, asegurar que las pruebas apuntan a una base exclusiva. La CLI OpenSpec debe estar disponible para sus validaciones.

## Estado MVP v1

MVP v1 funcionalmente cerrado. La regresión final aprobó 71/71 tests backend, lint y build frontend; la QA funcional aprobó catálogo, filtros, detalle, galería, WhatsApp en desktop, login, administración, productos, categorías, imágenes y logout. SL-41 está Done/Listo, el OpenSpec fue archivado y los cambios fueron publicados. Como limitación de QA, no se reprodujo manualmente el fallo de refetch posterior a una mutación exitosa; queda cubierto por implementación/tests. La sesión usa localStorage por decisión de MVP v1; cookies httpOnly, refresh tokens y revocación se difieren.

Consultar [spec MVP](docs/sdd/MVP-V1-FINAL-SPEC.md), [estado y evidencia](docs/sdd/SDD-PROGRESS.md), [casos de uso](docs/sdd/08_Use_Cases.md) y [workflow](docs/sdd/SDD-WORKFLOW.md). Las pruebas técnicas no sustituyen el QA manual.
