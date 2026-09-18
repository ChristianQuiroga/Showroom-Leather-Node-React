## Context

Ver proposal.md para motivación y alcance. No existe `.github/workflows`. Backend y frontend tienen package-lock.json versionados y scripts separados. Los lockfiles admiten Node 24; no se cambiarán dependencias.

`backend/tests/auth.test.js` y `product.test.js` requieren PostgreSQL y login de `admin@showroom.com` con TEST_ADMIN_PASSWORD. Productos requiere una categoría activa. `src/seeds/seed.js` crea categorías, admin y productos mediante SEED_ADMIN_*. `src/config/cloudinary.js` exige tres valores no vacíos al importar la aplicación; la subida está simulada en product.test.js y el borrado probado usa public_id NULL. No existe un mock global del proveedor.

`npm run migrate:up` exige `.env` mediante `--env-file`; el CI no debe usarlo. El repositorio usa unaccent en búsqueda, pero las cinco migraciones actuales no habilitan la extensión. La preparación del CI debe cubrir esa dependencia sin modificar migraciones de aplicación.

## Goals / Non-Goals

**Goals:** verificar un checkout limpio con servicios y datos desechables, publicar resultados independientes y fallar ante cualquier control obligatorio fallido.

**Non-Goals:** los de proposal.md; especialmente no desplegar, no configurar branch protection, no ampliar tests a E2E ni cambiar sdd-check.ps1. No se requieren cambios funcionales de backend/frontend, migraciones nuevas ni dependencias. QA de infraestructura revisa ejecuciones y logs de Actions, no reemplaza el QA funcional del MVP.

## Decisions

### Workflow y jobs

Crear posteriormente `.github/workflows/ci.yml`, con push a main y pull_request cuya base sea main. Dos jobs sin dependencia `needs` entre sí: backend y frontend, en Ubuntu 24.04. Un único job se descarta para evitar que un fallo backend impida obtener resultados frontend. No usar filtros por rutas inicialmente ni pull_request_target.

Ambos jobs usan Node `24.x` LTS, no `latest` ni `lts/*`: se fija la línea mayor y se admiten parches de esa línea. Cache npm por el lockfile de cada carpeta; npm ci siempre se ejecuta, sin cache de node_modules. Acciones oficiales de checkout/setup-node fijadas a SHA revisado al implementar, con versión legible como comentario. No se define una matriz de Node.

### Backend reproducible

Servicio PostgreSQL efímero por ejecución con credenciales ficticias y health check pg_isready; esperar disponibilidad antes del bootstrap. Usar `postgres:18`, alineado con la versión mayor del servidor local 18.3 verificado; se permiten actualizaciones menores de la línea 18, nunca latest. DATABASE_URL debe apuntar solo al servicio del job, sin reutilizar secrets del proyecto.

Secuencia en backend: npm ci; habilitar `CREATE EXTENSION IF NOT EXISTS unaccent`; ejecutar `node ./node_modules/node-pg-migrate/bin/node-pg-migrate up` con DATABASE_URL del entorno; npm run seed; npm test. La extensión puede habilitarse mediante el paquete pg ya instalado y una invocación temporal de Node en el workflow, cerrando el pool y propagando errores. No requiere escribir un .env ni instalar herramientas adicionales.

Variables backend: NODE_ENV=test; DATABASE_URL del servicio; JWT_SECRET ficticio; TEST_ADMIN_PASSWORD ficticia; SEED_ADMIN_NAME de prueba; SEED_ADMIN_EMAIL=admin@showroom.com; SEED_ADMIN_PASSWORD igual a TEST_ADMIN_PASSWORD; CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET ficticios no vacíos; WHATSAPP_PHONE ficticio. Reutilizar el seed existente, no credenciales ni datos de producción. No iniciar un servidor HTTP separado: Supertest usa la aplicación directamente.

### Frontend

En frontend: npm ci, npm run lint, npm run build. Sin PostgreSQL ni secretos backend. VITE_API_URL puede usar un valor público de prueba; no incluir credenciales en variables VITE_*. No aplicar NODE_ENV=production a la instalación: lint/build requieren devDependencies.

### Seguridad y fallos

Permisos `contents: read`; checkout con persist-credentials=false. Sin tokens personalizados, secrets reales, despliegue ni volcado de variables. El token automático de Actions conserva únicamente los permisos mínimos necesarios.

No llamar realmente a Cloudinary. Reutilizar las simulaciones existentes; no confundir valores ficticios con un bloqueo de red. Revisar que el recorrido de tests conserve el mock de upload y la ausencia de destroy remoto. Si apareciera una llamada real, detener la aceptación y revisar el contrato antes de ampliar alcance; no resolverlo agregando credenciales reales.

No usar continue-on-error ni `|| true` para controles obligatorios. Fallos de instalación, health check, extensión, migraciones, seed, tests, lint o build deben producir job fallido y ejecución de CI no exitosa. El otro job independiente debe poder completar sus comprobaciones.

## Risks / Trade-offs

- [Diferencias PostgreSQL local/CI] → mantener la versión mayor 18 y validar en el servicio Linux efímero; la evidencia local no demuestra todavía el funcionamiento en CI.
- [Entorno local oculta dependencias] → base vacía, migraciones, unaccent y seed en cada ejecución.
- [Mocks parciales] → verificar recorridos existentes y ausencia de solicitudes externas; no usar Cloudinary real para conseguir CI verde.
- [Diferencias Windows/Linux] → probar npm ci y binarios instalados en runner limpio, sin regenerar lockfiles para ocultar fallos.
- [Tests escriben datos] → base efímera exclusiva; nunca conexión de producción ni servicio compartido persistente.
- [Validación remota requiere publicación] → evidencia real de push/PR queda pendiente hasta autorización independiente; no marcar QA por inspección de YAML.

## Migration Plan

No hay migración de datos del producto. Tras aprobación del contrato, implementar workflow y documentación con PostgreSQL 18. Publicación y PR de prueba requieren autorización separada. Registrar URLs/commits/resultados de ejecuciones positivas y negativas. Un fallo controlado temporal se limita al entorno de verificación o rama autorizada y no se integra en main. Reversión: retirar el workflow mediante un cambio autorizado; no modificar la base de aplicación.

## Evidencia de versión PostgreSQL

Decisión resuelta el 2026-09-17: usar `postgres:18`. Una consulta de solo lectura mediante el paquete pg del backend y su DATABASE_URL local configurada devolvió `PostgreSQL 18.3 on x86_64-windows, compiled by msvc-19.44.35223, 64-bit`. Se ejecutó `SELECT version() AS version, current_setting('server_version') AS server_version, current_setting('server_version_num') AS server_version_num`, con resultados `18.3` y `180003` para los dos últimos campos. No se imprimieron la URL ni las credenciales.

La evidencia corresponde al servidor utilizado por la conexión local del proyecto, no al cliente psql ni al paquete npm pg. Se fija la versión mayor 18 para reducir diferencias con ese entorno y admitir parches de la misma línea. No se afirma haber verificado producción ni ejecutado CI; la aprobación del contrato y la validación en runner limpio siguen pendientes.
