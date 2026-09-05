# Showroom Leather — SDD Progress

## Fase actual

MVP v1 - Revisión y estabilización

## Spec principal

`MVP-V1-FINAL-SPEC.md`

## Flujo SDD

1. Requirement
2. Current State
3. Gap Analysis
4. Implementation Plan
5. Implement
6. Verify
7. Regression
8. Update Spec / Jira
9. Commit

## Work Items

### SL-30 — Agregar opción para limpiar filtros

**Estado:** Done

#### Implementación

- Se agregó la opción para limpiar búsqueda, estado y categoría.
- Se restablece `page` a 1.
- El `useEffect` existente realiza el refetch automáticamente.
- El botón queda deshabilitado cuando no existen filtros activos.

#### Verificación

- `npm run lint` ✅
- `npm run build` ✅
- Pruebas manuales de filtros individuales y combinados ✅

### SL-31 — Mostrar galería de imágenes en detalle de producto

**Estado:** Done

### Requirement

El detalle público del producto debe mostrar todas las imágenes asociadas, con una imagen destacada y miniaturas navegables.

### Current State

- `ProductDetail.jsx` ya consultaba el producto.
- Existía `getProductImages(productId)` en `productImageService.js`.
- El endpoint `GET /api/products/:productId/images` ya era público.
- El backend ya devolvía imágenes ordenadas y con `is_main`.

### Gap

- No se mostraba la colección completa de imágenes.
- No existían miniaturas.
- No había selección local de imagen destacada.
- No había estilos responsive específicos para la galería.

### Implementación

Archivos modificados:

- `frontend/src/components/ProductDetail.jsx`
- `frontend/src/App.css`

Cambios realizados:

- Se reutilizó `getProductImages(productId)`.
- Producto e imágenes se cargan en paralelo.
- La imagen con `is_main = true` se selecciona inicialmente.
- Si no existe principal, se usa la primera imagen.
- Se muestran miniaturas cuando hay más de una imagen.
- El click en una miniatura cambia solo la selección local.
- No se realizan escrituras al backend al navegar la galería.
- Se mantiene placeholder cuando el producto no tiene imágenes.
- Un error en la galería no bloquea los datos del producto.
- Se agregaron mejoras responsive y de accesibilidad.
- No fue necesario modificar backend.

### Verificación técnica

- `npm run lint` ✅
- `npm run build` ✅

### Pruebas manuales

- Producto con varias imágenes ✅
- Cambio de imagen destacada mediante miniaturas ✅
- Producto con una sola imagen ✅
- Producto sin imágenes / placeholder ✅
- Navegación entre productos ✅
- Responsive ✅

### Resultado

SL-31 cumple los Acceptance Criteria definidos para la galería pública.

### Finding relacionado

Se detectó que el endpoint público de imágenes podría permitir consultar imágenes de productos inactivos/no publicados conociendo su ID.

Este hallazgo queda fuera del alcance de SL-31 y debe registrarse para la fase de seguridad.

### SL-32 — Validar MVP en dispositivo móvil real

Status: Pending

### SL-34 — Gestionar productos inactivos desde administración

**Estado:** Done

#### Requirement
El administrador debe poder visualizar productos activos e inactivos, desactivarlos y reactivarlos sin afectar el comportamiento del catálogo público.

#### Current State
- El backend ya soportaba soft delete mediante `DELETE /api/products/:id`.
- La desactivación establecía `is_active = false` e `is_published = false`.
- No existía listado administrativo de productos.
- No existía endpoint de reactivación.
- El frontend no permitía gestionar productos inactivos.

#### Gap
- Faltaba listar activos, inactivos, publicados y no publicados en administración.
- Faltaba reactivación.
- Faltaban acciones Activar/Desactivar en frontend.
- Faltaba refetch posterior.
- Faltaban tests de transición y autorización.

#### Implementación
Backend:
- Se agregó `GET /api/products/admin`.
- El endpoint está protegido por JWT y rol admin.
- Se agregó `PATCH /api/products/:id/activate`.
- Reactivar solo cambia `is_active = true`.
- No se republica automáticamente el producto.
- Se mantiene el soft delete existente.
- Se reutilizan búsqueda, filtros y paginación.

Frontend:
- Se agregó vista administrativa de productos.
- Se muestran por separado:
  - estado comercial;
  - Activo/Inactivo;
  - Publicado/No publicado.
- Se agregó acción Desactivar para productos activos.
- Se agregó acción Activar para productos inactivos.
- Los productos inactivos no ofrecen Editar ni Gestionar imágenes.
- Después de activar/desactivar se realiza refetch.
- Se corrige automáticamente la página si queda fuera de rango.
- Los errores mantienen visible el listado.

#### Verificación técnica
- Backend: 2 suites y 25 tests aprobados ✅
- Frontend `npm run lint` ✅
- Frontend `npm run build` ✅
- `git diff --check` ✅

#### Pruebas manuales
- Catálogo público sin login continúa funcionando ✅
- Admin puede abrir Gestionar productos ✅
- Se muestran activos, inactivos, publicados y no publicados ✅
- Desactivación sin F5 ✅
- Producto inactivo desaparece del catálogo público ✅
- Producto inactivo no ofrece Editar ni Gestionar imágenes ✅
- Reactivación sin F5 ✅
- Producto reactivado permanece No publicado ✅
- Editar y Gestionar imágenes reaparecen al reactivar ✅
- Publicación posterior desde Editar funciona según diseño ✅
- Filtros y paginación ✅

#### Resultado
SL-34 cumple los Acceptance Criteria definidos para la gestión de productos inactivos.

#### Decisión funcional
Reactivar un producto no lo publica automáticamente.

Flujo esperado:

`Activo + Publicado → Inactivo + No publicado → Activo + No publicado → Publicado manualmente desde Editar`

Esto evita publicar nuevamente un producto sin revisión administrativa previa.

### Revisar persistencia de sesión

Status: Pending


