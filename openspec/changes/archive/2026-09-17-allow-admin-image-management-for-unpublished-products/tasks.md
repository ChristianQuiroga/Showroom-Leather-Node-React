## 1. Lectura administrativa protegida

- [x] 1.1 Agregar la ruta administrativa de imágenes bajo `/api/products/admin/:productId/images`, protegida por `authenticate` y `authorizeAdmin`; verificar que solicitudes sin JWT respondan `401` y solicitudes de usuario no admin respondan `403`.
- [x] 1.2 Implementar la lectura administrativa para productos existentes y activos sin filtrar `is_published`; verificar que un producto activo publicado y uno activo no publicado devuelvan sus colecciones, incluida una colección vacía cuando corresponda.
- [x] 1.3 Conservar la regla de producto inactivo para la lectura administrativa; verificar respuesta `409` sin imágenes, consistente con las mutaciones actuales y con la ausencia de Gestionar imágenes en ProductManager.
- [x] 1.4 Conservar la ruta pública actual sin JWT ni cambios de visibilidad; verificar `200` para activo/publicado y `404` para activo/no publicado, inactivo e inexistente.

## 2. Integración frontend

- [x] 2.1 Agregar al servicio frontend una lectura administrativa explícita que envíe el token a la ruta protegida y verificar que no sustituya ni modifique la función pública usada por ProductDetail.
- [x] 2.2 Actualizar ProductImageManager para cargar y recargar imágenes con la lectura administrativa al acceder desde ProductManager; verificar carga inicial, subida, cambio de principal y eliminación para un producto activo no publicado.
- [x] 2.3 Conservar callbacks de autorización, regreso a ProductManager, filtros/página y sincronización de imagen principal; verificar que una respuesta `401` o `403` mantiene el manejo de sesión actual.

## 3. Pruebas y regresión

- [x] 3.1 Agregar pruebas backend para la matriz pública: producto activo/publicado devuelve imágenes y activo/no publicado devuelve `404`; verificar que el endpoint público conserve exactamente el contrato de respuesta actual y no incorpore campos administrativos o internos como consecuencia de este cambio.
- [x] 3.2 Agregar pruebas backend para la matriz administrativa: admin con producto activo/publicado y activo/no publicado recibe imágenes; sin token recibe `401`; usuario no admin recibe `403`; inactivo recibe `409`; inexistente recibe `404`.
- [x] 3.3 Ejecutar `npm test` en backend y confirmar que las suites existentes y nuevas pasan; ejecutar `npm run lint`, `npm run build` en frontend y `git diff --check`.
- [x] 3.4 Realizar QA manual: comprobar público/publicado, público/no publicado, admin/publicado, admin/no publicado, producto inactivo, sin token y no admin; verificar subir, principal, eliminar, ProductDetail público y ProductManager.

## 4. Documentación y seguimiento

- [x] 4.1 Actualizar los documentos SDD pertinentes con el contrato público/administrativo de imágenes y el comportamiento explícito para inactivos; verificar que no contradigan `public-product-visibility` ni `admin-product-action-placement`.
- [x] 4.2 Registrar en SDD-PROGRESS la implementación, pruebas y QA reales, sin declarar controles no ejecutados como completados.
- [x] 4.3 Cuando exista el próximo ticket en Jira y la implementación esté validada, actualizarlo con alcance y evidencia antes de cualquier commit futuro; verificar coherencia con OpenSpec y SDD.
