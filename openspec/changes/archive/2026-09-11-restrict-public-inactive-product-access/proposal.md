## Why

Las consultas públicas de detalle e imágenes aceptan cualquier producto existente cuando se conoce su ID, incluso si está inactivo o no publicado. Esto contradice la regla del catálogo público y puede exponer información que la administración retiró de publicación; el riesgo ya fue registrado como hallazgo relacionado durante SL-31.

El resultado esperado es que el detalle y las imágenes solo sean accesibles públicamente cuando el producto esté activo y publicado, y que cualquier otro estado se presente como producto no encontrado.

## What Changes

- Restringir `GET /api/products/:id` a productos que estén simultáneamente activos y publicados.
- Restringir `GET /api/products/:productId/images` con la misma regla de visibilidad pública.
- Responder como producto no encontrado (`404`) cuando el ID corresponde a un producto inactivo o no publicado, sin revelar cuál de esos estados impide el acceso.
- Mantener el comportamiento actual para IDs inválidos, productos inexistentes y productos activos/publicados.
- Conservar la edición administrativa de productos activos aunque no estén publicados, reutilizando los datos obtenidos mediante el listado administrativo protegido de SL-34.
- Agregar cobertura automatizada para ambas rutas y para cada estado no visible.
- Vincular el cambio con el ítem de Jira `SL-36` y mantener allí las mismas evidencias de implementación y verificación.

## Capabilities

### New Capabilities

- `public-product-visibility`: Define qué productos y recursos asociados pueden consultarse mediante endpoints públicos.

### Modified Capabilities

Ninguna. El repositorio todavía no contiene especificaciones principales de OpenSpec.

## Impact

- API pública: `GET /api/products/:id` y `GET /api/products/:productId/images` devolverán `404` para productos inactivos o no publicados.
- Backend: servicios y/o repositorios de productos e imágenes, siguiendo los patrones existentes de `AppError` y acceso a PostgreSQL.
- Frontend administrativo: el formulario de edición reutilizará el producto seleccionado desde el listado protegido, sin consultar el endpoint público de detalle.
- Pruebas: cobertura de integración con Jest y Supertest para las restricciones de visibilidad.
- Documentación: actualización del registro global en `docs/sdd/SDD-PROGRESS.md` y seguimiento del ítem Jira `SL-36`.
- Sin cambios previstos en el contrato de rutas administrativas, esquema de base de datos, Cloudinary ni dependencias.

## Non-goals

- Crear endpoints administrativos alternativos de detalle o imágenes.
- Cambiar las operaciones administrativas de alta, edición, activación, desactivación o gestión de imágenes.
- Eliminar archivos de Cloudinary o registros de imágenes cuando un producto deja de ser público.
- Modificar las reglas de publicación o activación de productos.
