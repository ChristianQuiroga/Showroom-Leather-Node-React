## Why

Las verificaciones actuales dependen del entorno local. Incorporar CI permite que cada push a main y PR hacia main publique resultados reproducibles de backend y frontend sin usar datos ni credenciales reales.

## What Changes

- Incorporar un workflow de GitHub Actions con jobs backend/frontend independientes, Node 24.x LTS y npm ci con lockfiles existentes.
- Preparar PostgreSQL efímero desde cero, con health check, unaccent, migraciones y seed antes de los tests backend.
- Ejecutar lint y build frontend; cualquier check fallido debe hacer fallar CI.
- Usar variables ficticias de CI, permisos mínimos y simulaciones Cloudinary existentes, sin llamadas reales al proveedor.
- Usar `postgres:18`, alineado con la versión mayor del servidor local PostgreSQL 18.3 verificado mediante la conexión configurada del backend.

## Capabilities

### New Capabilities

- `continuous-integration`: contrato observable de disparadores, jobs, preparación aislada y resultados de CI para developers.

### Modified Capabilities

Ninguna; no cambia el comportamiento funcional del producto.

## Impact

Implementación futura: `.github/workflows/ci.yml`, documentación pertinente del workflow y SDD-PROGRESS. Se reutilizan npm scripts, seed, migraciones y tests existentes. No se requieren cambios de dependencias, esquema de aplicación ni código funcional. Jira: identificador no informado; no se crea ni actualiza en esta fase SPEC.

## Non-goals

Deploy, branch protection, nuevas features, refactors, cambios de dependencias, cambios funcionales, cobertura E2E y modificación de `scripts/sdd-check.ps1`. No usar pull_request_target, .env reales o secretos reales de Cloudinary. Esta propuesta no implementa workflows, modifica Jira, hace commit ni push.
