## Why

La MVP v1 tenía un catálogo y administración funcional, pero el cliente eligió la dirección visual 02 Artesanal. Durante la integración pidió favoritos, comparación, acceso administrativo discreto, límite de intentos de login y mejoras de navegación y WhatsApp. Este OpenSpec reconstruye el alcance implementado para revisión; no afirma aprobación anterior a la programación.

## What Changes

- Portada, cabecera, pie, filtros, tarjetas y detalle con identidad Artesanal y datos reales de la API.
- Paginación de seis productos, tarjetas alineadas, detalle por foto o enlace y regreso a la colección.
- Favoritos locales al navegador y comparación de dos o tres prendas.
- Contacto general en el pie y consulta por producto con icono de WhatsApp.
- Panel separado del hero público; acceso mediante `#admin`, gestión de productos inicial y navegación activa.
- Límite de intentos fallidos en backend: HTTP 429 y espera máxima de quince minutos.

## Impact

React/Vite y estilos; `GET /api/contact` y middleware de `POST /api/auth/login` en Express. No hay migraciones, nuevas dependencias, e-commerce ni multicliente. Las fichas y fotos comerciales proceden del catálogo administrado; solo la foto de portada es un recurso editorial estático.

## Traceability

Implementación en `feature/showroom-artesanal-ui`; evidencia en `docs/sdd/SDD-PROGRESS.md`. Jira: work item aún no identificado. Completar la revisión y QA pendiente antes de archivar.
