## 1. Contratos y datos de prueba

- [x] 1.1 Incorporar fixtures o transiciones controladas para productos activo/publicado, inactivo y activo/no publicado, y verificar mediante preparación y limpieza repetidas que no dependen del orden ni de estado residual.
- [x] 1.2 Agregar casos Jest/Supertest inicialmente fallidos para el detalle público que cubran acceso sin JWT, `200` para producto visible, `404` indistinguible para productos inexistentes o no visibles y la validación `400` existente.
- [x] 1.3 Agregar casos Jest/Supertest inicialmente fallidos para las imágenes públicas que cubran acceso sin JWT, colección con datos o vacía para producto visible, `404` sin metadatos para productos inexistentes o no visibles y la validación `400` existente.

## 2. Implementación del acceso público

- [x] 2.1 Agregar en `product.repository.js` una consulta por ID que exija `is_active = true` e `is_published = true`, y verificar que los tests preparados distinguen productos públicos de no visibles sin alterar `findById`.
- [x] 2.2 Actualizar `productService.getProductById` para usar la consulta pública y conservar `AppError("Producto no encontrado", 404)`, y verificar que pasan los casos de detalle `200`, `404`, acceso sin JWT y validación `400`.
- [x] 2.3 Actualizar `productImageService.getProductImages` para validar el producto con la misma consulta pública antes de recuperar imágenes, y verificar que pasan los casos de imágenes `200`, colección vacía, `404`, acceso sin JWT y validación `400`.

## 3. Verificación, regresión y cierre documental

- [x] 3.1 Ejecutar la suite completa del backend y confirmar que el listado público, el listado administrativo, la activación, la desactivación y la gestión administrativa de imágenes no presentan regresiones.
- [x] 3.2 Ejecutar QA manual de ambos endpoints con IDs válidos e inválidos, sin JWT y en cada estado de visibilidad, y verificar códigos, mensajes y ausencia de datos privados.
- [x] 3.3 Actualizar `docs/sdd/SDD-PROGRESS.md` con el resultado final y vincular el ítem Jira `SL-36`, verificando que ambos registros describan el mismo alcance y las mismas evidencias.
- [x] 3.4 Ejecutar `git diff --check` y revisar el diff completo para confirmar que la implementación y la verificación están completas y que no hay cambios de frontend, migraciones, dependencias, refactors ni funcionalidades fuera del alcance antes de considerar un commit.

## 4. Regresión de edición administrativa

- [x] 4.1 Agregar cobertura backend que confirme que `GET /api/products/admin` mantiene productos activos no publicados disponibles solo con JWT y rol admin, y verificar que las pruebas de autorización y listado pasan.
- [x] 4.2 Ajustar `ProductManager`, `App` y `ProductForm` para reutilizar el producto seleccionado desde el listado administrativo protegido, sin consultar el detalle público ni crear un endpoint nuevo, y verificar el flujo con lint y build de frontend.
- [x] 4.3 Ejecutar la suite completa del backend y verificar que el detalle y las imágenes públicas siguen ocultando productos inactivos o no publicados.
- [x] 4.4 Actualizar `docs/sdd/SDD-PROGRESS.md` con la causa raíz, la corrección y la evidencia de regresión de SL-36; ejecutar `git diff --check` y revisar que el alcance final no incluya migraciones, dependencias ni refactors ajenos.
