# 🛍️ Showroom Leather

Aplicación Full Stack para publicar y administrar un catálogo de productos de cuero.

Permite a los usuarios explorar productos, aplicar filtros, consultar detalles e imágenes y contactar directamente por WhatsApp.

El área administrativa permite gestionar productos, categorías, imágenes y estado de publicación mediante autenticación JWT y rol administrador.

> Proyecto desarrollado como MVP funcional, con foco en arquitectura, buenas prácticas, testing y evolución incremental.

## ✨ Funcionalidades principales

### Catálogo público

- Listado de productos
- Búsqueda y filtros
- Paginación
- Detalle de producto
- Galería de imágenes
- Consulta directa por WhatsApp

### Administración

- Login de administrador
- Autenticación con JWT
- Gestión de productos
- Gestión de categorías
- Gestión de imágenes
- Publicación y despublicación
- Control de acceso por rol admin

## 🛠️ Stack y estructura

- Backend: Node.js (ESM), Express, PostgreSQL, JWT, bcrypt y Cloudinary.
- Frontend: React y Vite; ESLint para verificación estática.
- Tests backend: Jest y Supertest. CI: GitHub Actions con jobs backend/frontend independientes.
- `backend/src`: rutas, controllers, servicios, repositorios, middlewares y configuración.
- `backend/migrations`, `backend/tests`: esquema y pruebas.
- `frontend/src`: componentes, páginas y servicios HTTP.
- `docs/sdd`: especificación, estado y workflow del proyecto.
- `openspec`: contratos de cambios y archivo; `scripts`: verificaciones SDD.

## 🧱 Arquitectura

El backend está organizado por capas para separar responsabilidades:

```text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
PostgreSQL
```

Además, el proyecto utiliza middlewares para autenticación, autorización, validaciones y manejo centralizado de errores.

La gestión de imágenes se integra con Cloudinary y el frontend consume la REST API desarrollada con Node.js y Express.

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

El seed crea categorías, productos de ejemplo y un administrador con `SEED_ADMIN_*`. Usarlo solo sobre una base de desarrollo/pruebas; rechaza `NODE_ENV=production`. Las migraciones actuales no habilitan `unaccent` automáticamente.

La API local usa por defecto:

```text
http://localhost:3000
```

Health check:

```http
GET /api/health
```

En otra terminal desde la raíz:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

El frontend local usa normalmente:

```text
http://localhost:5173
```

Configurar ese origen en `CORS_ORIGINS` y:

```env
VITE_API_URL=http://localhost:3000/api
```

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

Frontend: `VITE_API_URL` es la URL pública del backend. Las variables `VITE_*` se incorporan al cliente y no deben contener secretos.

Nunca versionar `.env`, tokens ni credenciales reales.

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

Los tests backend escriben datos, por lo que deben ejecutarse sobre una base exclusiva de pruebas con `unaccent`, migraciones y seed.

La suite espera `admin@showroom.com`; establecer `SEED_ADMIN_EMAIL` con ese valor y `TEST_ADMIN_PASSWORD` igual a `SEED_ADMIN_PASSWORD`.

Usar `NODE_ENV=test` y un `JWT_SECRET` ficticio exclusivo de pruebas.

Los valores de Cloudinary pueden ser ficticios no vacíos para la suite actual: el upload se simula y el borrado probado evita el proveedor. Esto no valida errores reales de Cloudinary ni supone un bloqueo global de red.

```powershell
cd backend
npm test

cd ../frontend
npm run lint
npm run build

cd ..
git diff --check
```

GitHub Actions ejecuta estos controles por push y Pull Request hacia `main`, instala dependencias con `npm ci` y prepara PostgreSQL efímero desde cero.

Actualmente el workflow no realiza deployment ni utiliza secretos reales de aplicación.

### Scripts SDD

Desde la raíz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sdd-status.ps1
powershell -ExecutionPolicy Bypass -File scripts/sdd-check.ps1
```

`SDD Status` consulta el estado local del proyecto.

`SDD Check` ejecuta verificaciones técnicas y validaciones asociadas al workflow. Antes de ejecutarlo, asegurar que las pruebas apuntan a una base exclusiva.

La CLI OpenSpec debe estar disponible para sus validaciones.

## ✅ Estado MVP v1

El MVP v1 se encuentra funcionalmente completado.

La versión actual incluye:

- Catálogo público de productos.
- Búsqueda, filtros y paginación.
- Detalle y galería de imágenes.
- Integración con WhatsApp.
- Login y autenticación JWT.
- Administración de productos, categorías e imágenes.
- Publicación y despublicación de productos.
- Manejo centralizado de errores.
- Testing automatizado.
- Integración continua con GitHub Actions.

### Validación

- Backend: **71/71 tests aprobados**
- Frontend: **lint OK**
- Frontend: **build OK**
- QA funcional de los principales flujos: **OK**

La sesión utiliza `localStorage` como decisión del MVP v1. Mejoras como cookies `httpOnly`, refresh tokens y revocación de tokens quedan contempladas para futuras versiones.

Para más detalle consultar:

- [Especificación MVP](docs/sdd/MVP-V1-FINAL-SPEC.md)
- [Estado y evidencia](docs/sdd/SDD-PROGRESS.md)
- [Casos de uso](docs/sdd/08_Use_Cases.md)
- [Workflow SDD](docs/sdd/SDD-WORKFLOW.md)

> Las capturas del sistema se agregarán más adelante cuando estén listas.
