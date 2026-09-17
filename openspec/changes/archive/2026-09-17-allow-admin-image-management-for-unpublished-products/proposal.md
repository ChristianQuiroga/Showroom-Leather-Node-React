## Why

Gestionar productos permite abrir el gestor de imágenes para cualquier producto activo, incluso si no está publicado. Sin embargo, la pantalla obtiene la colección mediante una lectura pública que responde `404` para productos no publicados; el administrador no puede consultar ni administrar correctamente sus imágenes.

## What Changes

- Incorporar una lectura administrativa protegida de imágenes para productos activos, independiente de `is_published`.
- Mantener sin cambios la lectura pública, que solo expone imágenes de productos activos y publicados.
- Hacer que ProductImageManager use la lectura administrativa al abrirse desde Gestionar productos.
- Cubrir autorización, visibilidad y regresión de las operaciones de imagen existentes.

## Capabilities

### New Capabilities

- `admin-product-image-access`: acceso administrativo protegido a la colección de imágenes de productos activos, incluidos los no publicados.

### Modified Capabilities

Ninguna. `public-product-visibility` ya exige que los endpoints públicos oculten productos no visibles y no cambia. `admin-product-action-placement` conserva la ubicación de Gestionar imágenes; este cambio completa su acceso de datos.

## Impact

- Backend: rutas, controlador o servicio de imágenes y pruebas de autorización/visibilidad.
- Frontend: `ProductImageManager.jsx` y `productImageService.js` para la lectura administrativa.
- Sin cambios previstos en ProductDetail, endpoint público, JWT global, Cloudinary, PostgreSQL, dependencias, React Router ni diseño visual.
- Jira: aún no existe identificador; se lo denomina próximo ticket hasta su creación.

## Non-goals

- Hacer público el acceso a imágenes de productos no publicados o inactivos.
- Modificar las mutaciones existentes de subir, marcar principal o eliminar fuera de su regresión.
- Rediseñar vistas, refactorizar rutas de producto en general, modificar la estrategia JWT, Cloudinary o la base de datos salvo necesidad estrictamente justificada durante una futura implementación.
