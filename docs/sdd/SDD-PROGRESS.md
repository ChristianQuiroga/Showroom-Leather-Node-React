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

### SL-36 — Restringir acceso público a productos no visibles

**Estado:** Done

**Change:** `restrict-public-inactive-product-access`

**Jira:** `SL-36`

#### Requirement

El detalle público y las imágenes de un producto solo deben ser accesibles cuando el producto está activo y publicado. Los productos inexistentes, inactivos y no publicados deben resultar indistinguibles para clientes públicos.

#### Current State

- El listado público ya filtraba por `is_active = true` e `is_published = true`.
- `GET /api/products/:id` consultaba por ID sin aplicar esas condiciones.
- `GET /api/products/:productId/images` validaba la existencia del producto sin comprobar su visibilidad pública.

#### Gap

Conocer un ID permitía obtener el detalle o los metadatos de imágenes de productos retirados del catálogo público.

#### Implementación

- Se agregó una consulta de repositorio específica para productos públicos por ID.
- La consulta exige simultáneamente `is_active = true` e `is_published = true`.
- El detalle público y la lectura pública de imágenes reutilizan esa consulta.
- Los productos inexistentes, inactivos y no publicados responden `404` con `Producto no encontrado`.
- `findById` conserva su comportamiento para los flujos administrativos.
- No se modificaron el esquema de base de datos, las dependencias ni la integración con Cloudinary.

#### Verificación automática

- Suite de productos: 31 tests aprobados.
- Suite completa del backend: 2 suites y 39 tests aprobados.
- Se cubrieron productos activos/publicados, inactivos, no publicados e inexistentes, IDs inválidos, acceso sin JWT y colección de imágenes vacía.
- Se verificó que las consultas no públicas usan el mismo contrato `404` y no devuelven metadatos de imágenes.

#### QA HTTP

- Detalle activo/publicado sin JWT: `200` ✅
- Imágenes de producto activo/publicado sin JWT: `200` ✅
- Detalle e imágenes de producto inactivo: `404` ✅
- Detalle e imágenes de producto no publicado: `404` ✅
- Detalle e imágenes de producto inexistente: `404` ✅
- IDs inválidos: `400` ✅
- Los fixtures temporales fueron eliminados al finalizar ✅

#### Resultado

El backend aplica de forma consistente la regla de visibilidad del catálogo a los endpoints públicos por ID, sin ampliar el alcance del MVP.

#### Regresión administrativa detectada durante QA

Al despublicar un producto y volver a editarlo desde Gestionar productos, el formulario quedaba vacío con `Producto no encontrado`.

Causa raíz:

- `ProductForm` reutilizaba `GET /api/products/:id` para cargar una edición administrativa.
- Ese endpoint pasó correctamente a usar `findPublicById` y, por contrato, oculta productos no publicados.
- El frontend mezclaba así una lectura pública con un flujo administrativo.

Corrección:

- Se reutiliza el objeto completo obtenido por `GET /api/products/admin`, endpoint existente de SL-34 protegido con JWT y rol admin.
- `ProductManager` pasa el producto seleccionado a `App` y `ProductForm` inicializa el formulario con esos datos.
- No se agregó un endpoint administrativo nuevo.
- `GET /api/products/:id` y `GET /api/products/:productId/images` conservan la protección pública mediante `findPublicById`.
- `findById` permanece disponible para validaciones y mutaciones administrativas.

Verificación de la corrección:

- Regresión backend: el listado administrativo devuelve productos activos no publicados a un admin autenticado ✅
- Autorización del listado administrativo: `401` sin JWT y `403` sin rol admin ✅
- Suite de productos: 31 tests aprobados ✅
- Suite completa del backend: 2 suites y 39 tests aprobados ✅
- Frontend `npm run lint` ✅
- Frontend `npm run build` ✅

QA manual recomendado:

- Despublicar un producto activo, volver a Gestionar productos y abrirlo nuevamente en Editar.
- Confirmar que el formulario conserva todos sus datos y muestra Publicado desmarcado.
- Guardar otra modificación y confirmar que el producto continúa no publicado.
- Confirmar desde una sesión pública que su detalle y sus imágenes responden `404`.
- Confirmar que un producto activo/publicado sigue abriendo su detalle e imágenes públicamente.

#### Resultado final

La protección pública y la edición administrativa quedan separadas: los productos no visibles continúan ocultos al público y los productos activos no publicados siguen siendo editables por administradores.

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

---

### SL-37 — Separar estado comercial de publicación

**Estado:** Done

**Change:** `separate-product-commercial-status-from-publication`

**Jira:** `SL-37`

#### Causa

El producto permitía representar “no publicado” mediante `status = unpublished` y mediante `is_published = false`. PostgreSQL, el servicio de productos y distintos selectores del frontend aceptaban ambas representaciones, lo que permitía combinaciones conceptualmente contradictorias.

#### Implementación

- `status` acepta exclusivamente `available`, `reserved` y `sold` en PostgreSQL y en las validaciones de altas, ediciones y filtros.
- `is_published` permanece como única fuente de verdad para la visibilidad pública.
- Se retiró “No publicado” de los controles y traducciones de estado comercial del frontend; el checkbox y el indicador de publicación permanecen separados.
- No se cambiaron rutas, autorización, repositorios ni la semántica pública establecida por SL-36.
- No se agregaron dependencias.

#### Migración

- Audit previo de la base configurada: 0 productos reales con `status = unpublished`.
- La migración normaliza filas heredadas a `sold` cuando `stock = 0` o `available` cuando `stock > 0`, y fija `is_published = false`.
- El `CHECK products_status_check` se reemplazó por `available`, `reserved` y `sold`.
- Se verificó el ciclo `up/down/up` con fixtures controlados, preservación de filas válidas y rechazo PostgreSQL `23514` para `unpublished`.
- Los fixtures temporales de migración y QA fueron eliminados.
- El rollback restaura el dominio anterior, pero no reconstruye los valores ambiguos normalizados.

#### Verificación automática

- Suite enfocada de productos: 45 tests aprobados.
- Suite completa backend: 2 suites y 53 tests aprobados.
- Frontend `npm run lint`: aprobado.
- Frontend `npm run build`: aprobado.
- Se cubrieron los tres estados permitidos, rechazo de `unpublished`, filtros público/administrativo, independencia de publicación y regresión de visibilidad/autorización de SL-36.

#### QA HTTP

- Las seis combinaciones entre `available`/`reserved`/`sold` e `is_published` verdadero/falso conservaron ambos valores independientemente.
- Detalle e imágenes respondieron `200` para productos activos/publicados y `404` para activos/no publicados en los tres estados comerciales.
- Los filtros público y administrativo aceptaron los tres estados; el listado público conservó la condición de publicación.
- El listado administrativo continuó incluyendo productos no publicados con JWT admin.

#### QA manual aprobado

- El usuario confirmó la aprobación del QA manual el 2026-09-11.
- Solo se muestran Disponible, Reservado y Vendido como estados comerciales.
- Publicado permanece separado del estado comercial.
- Todas las combinaciones de `status` e `is_published` guardan correctamente y conservan sus valores al volver a editar.
- No se detectaron regresiones de SL-36.

#### Resultado final

SL-37 finalizado en Jira según confirmación del usuario. Implementación y QA completos; las 24/24 tareas de OpenSpec quedan completadas. El cambio permanece sin archivar y no se realiza commit en este cierre.
