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

### Revisar persistencia de sesión

Status: Pending

### Gestionar productos inactivos

Status: Pending
