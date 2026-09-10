# Showroom Leather — SDD Progress

## Fase actual

MVP v1 — Revisión, estabilización y QA final

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

---

### SL-31 — Mostrar galería de imágenes en detalle de producto

**Estado:** Done

#### Requirement

El detalle público del producto debe mostrar todas las imágenes asociadas, con una imagen destacada y miniaturas navegables.

#### Current State

- `ProductDetail.jsx` ya consultaba el producto.
- Existía `getProductImages(productId)` en `productImageService.js`.
- El endpoint `GET /api/products/:productId/images` ya era público.
- El backend ya devolvía imágenes ordenadas y con `is_main`.

#### Gap

- No se mostraba la colección completa de imágenes.
- No existían miniaturas.
- No había selección local de imagen destacada.
- No había estilos responsive específicos para la galería.

#### Implementación

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

#### Verificación técnica

- `npm run lint` ✅
- `npm run build` ✅

#### Pruebas manuales

- Producto con varias imágenes ✅
- Cambio de imagen destacada mediante miniaturas ✅
- Producto con una sola imagen ✅
- Producto sin imágenes / placeholder ✅
- Navegación entre productos ✅
- Responsive ✅

#### Resultado

SL-31 cumple los Acceptance Criteria definidos para la galería pública.

#### Finding relacionado

Se detectó que el endpoint público de imágenes podría permitir consultar imágenes de productos inactivos/no publicados conociendo su ID.

Este hallazgo queda fuera del alcance de SL-31 y debe registrarse para la fase de seguridad.

---

### SL-32 — Validar MVP en dispositivo móvil real

**Estado:** Done

#### Objetivo

Validar el MVP v1 en un dispositivo móvil real conectado a la misma red local que el entorno de desarrollo.

#### Ajustes necesarios para QA local

- Frontend iniciado con:
  - `npm run dev -- --host 0.0.0.0`
- Se utilizó la IP local de la PC para acceder desde el celular.
- El frontend consumió temporalmente la API mediante la IP local.
- CORS fue ajustado temporalmente para permitir el origen del frontend en red local.

#### Pruebas manuales

- Acceso al catálogo desde dispositivo móvil real ✅
- Carga de productos ✅
- Layout responsive del catálogo ✅
- Filtros y limpiar filtros ✅
- Detalle de producto ✅
- Galería y miniaturas ✅
- Login admin ✅
- Vista Gestionar productos ✅
- Edición de producto ✅
- Gestión de imágenes ✅
- Activar/desactivar producto ✅
- Logout ✅
- Sin scroll horizontal no deseado ✅
- Controles táctiles accesibles ✅

#### Resultado

SL-32 cumple los criterios definidos para validación mobile real del MVP v1.

#### Nota

Los valores de IP local y CORS utilizados para QA no deben quedar hardcodeados como configuración definitiva de producción.

La configuración final debería resolverse mediante variables de entorno.

---

### SL-33 — Revisar estrategia de persistencia de sesión en frontend

**Estado:** Done

#### Requirement

Mantener persistencia de sesión en frontend de forma consistente para el MVP v1, validando correctamente JWT inválidos, expirados o sin permisos de administrador.

#### Implementación

- Se mantiene `localStorage` para MVP v1.
- Se agregó validación inicial mediante `GET /api/auth/me`.
- Los controles administrativos permanecen ocultos hasta completar la validación.
- Solo usuarios activos con `role === "admin"` habilitan administración.
- Se centralizó `clearSession()`.
- `401` y `403` eliminan la sesión administrativa.
- `400`, `404`, `409`, `500` y errores de red no eliminan el token.
- Se agregó cierre local basado en el claim `exp`.
- Se centralizaron URL base, Bearer y manejo de respuestas mediante `ApiError`.
- Se eliminó la entrada duplicada `JWT_SECRET` de `.env.example`.

#### Verificación técnica

- Backend: 2 suites y 27 tests aprobados ✅
- Frontend `npm run lint` ✅
- Frontend `npm run build` ✅
- `git diff --check` ✅

#### Pruebas manuales

- Login admin + F5 conserva sesión ✅
- Token alterado se elimina y vuelve a modo público ✅
- Token expirado se elimina correctamente ✅
- `401` cierra sesión y oculta administración ✅
- `409` mantiene sesión y muestra error ✅
- Logout manual + F5 no restaura sesión ✅

#### Decisión

Se mantiene `localStorage` en MVP v1.

La estrategia avanzada con cookies `httpOnly`, refresh tokens y revocación de sesiones queda como deuda futura.

#### Resultado

SL-33 cumple los criterios definidos para persistencia y consistencia de sesión del MVP v1.

---

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

#### Fix posterior — navegación administrativa

Se detectó una pérdida de estado de navegación al desmontar `ProductManager`.

Cambios realizados:

- Se elevó a `App.jsx` el estado administrativo:
  - `search`
  - `status`
  - `categoryId`
  - `page`
- Se conserva página y filtros al volver desde:
  - Editar producto;
  - Gestionar imágenes.
- Se agregó `resetProductManagerState()`.
- El estado administrativo se reinicia al:
  - salir explícitamente al catálogo;
  - cerrar sesión;
  - iniciar una nueva sesión administrativa;
  - invalidarse la sesión mediante `401/403`.
- Cambiar filtros continúa restableciendo `page = 1`.
- Se mantiene la corrección automática cuando `page > totalPages`.

Verificación:

- `npm run lint` ✅
- `npm run build` ✅
- `git diff --check` ✅
- Pruebas manuales de navegación y paginación ✅
#### Fix posterior — sincronización con catálogo público

Se detectó que, después de activar o desactivar un producto desde administración, al volver al catálogo público podía seguir mostrándose información desactualizada hasta realizar F5.

Causa:

- `ProductManager` mantenía un contador de refresh propio.
- El catálogo público dependía del `refreshProducts` de `App.jsx`.
- Las mutaciones administrativas no notificaban al estado público.
- Al volver desde administración, el catálogo conservaba en memoria el listado anterior.

Cambios realizados:

- Al volver desde `ProductManager`, `App.jsx` incrementa el contador público `refreshProducts`.
- El catálogo realiza un nuevo `GET /api/products` sin requerir F5.
- Se reutiliza el mecanismo de refresh existente.
- No se agregó un nuevo `refreshKey`.
- No fue necesario modificar backend ni servicios.
- Se evita volver mientras una operación Activar/Desactivar está en curso.
- Se mantiene la corrección de paginación si la página pública queda fuera de rango.

Pruebas manuales:

- Desactivar producto y volver al catálogo: desaparece sin F5 ✅
- Reactivar/publicar y volver: aparece correctamente ✅
- Editar producto y volver: refleja los cambios ✅
- Filtros y paginación pública se mantienen consistentes ✅
- Última página se corrige si queda fuera de rango ✅
- Volver sin cambios mantiene catálogo correcto ✅

Verificación técnica:

- `npm run lint` ✅
- `npm run build` ✅
- `git diff --check` ✅

#### Resultado

SL-34 cumple los Acceptance Criteria definidos para la gestión de productos inactivos.

#### Decisión funcional

Reactivar un producto no lo publica automáticamente.

Flujo esperado:

`Activo + Publicado → Inactivo + No publicado → Activo + No publicado → Publicado manualmente desde Editar`

Esto evita publicar nuevamente un producto sin revisión administrativa previa.

---

## Validación manual — navegación, paginación y sesión

### Catálogo público

- Estado inicial en página 1 ✅
- Filtros vacíos al iniciar ✅
- Paginación Anterior/Siguiente correcta ✅
- Cambiar filtros vuelve a `page = 1` ✅
- Limpiar filtros vuelve a `page = 1` y limpia `search` / `status` / `categoryId` ✅
- Búsqueda y filtros combinados funcionan ✅
- Página alta + filtro que reduce resultados corrige navegación ✅
- Entrar a detalle y Volver conserva página y filtros ✅
- F5 en catálogo reinicia página/filtros, aceptado para MVP ✅
- F5 desde detalle vuelve al catálogo público, aceptado para MVP ✅

### Administración de productos

- Estado inicial limpio ✅
- Filtros administrativos independientes del catálogo público ✅
- Cambiar filtros vuelve a `page = 1` ✅
- Editar + Volver conserva página y filtros ✅
- Gestionar imágenes + Volver conserva página y filtros ✅
- Logout + login reinicia gestor limpio ✅
- Activar/desactivar mantiene filtros y realiza refetch ✅
- Página fuera de rango se corrige ✅
- Producto inactivo solo ofrece Activar ✅
- Reactivar mantiene No publicado ✅
- Publicación manual posterior funciona ✅
- Error `409` mantiene la sesión ✅
- Error `401` / sesión expirada limpia la sesión y vuelve al modo público ✅

### Decisiones aceptadas para MVP v1

- Página y filtros públicos no persisten después de F5.
- Las vistas actuales no persisten mediante URL/routing.
- F5 desde una vista administrativa vuelve al catálogo público.
- React Router y persistencia de navegación mediante URL quedan como deuda futura.
