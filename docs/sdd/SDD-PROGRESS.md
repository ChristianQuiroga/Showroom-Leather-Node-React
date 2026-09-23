# Showroom Leather — SDD Progress

## QA técnico final MVP v1 — 2026-09-21

**Resultado:** verificación técnica aprobada con pendientes manuales y hallazgos documentados; no se declara cierre integral del MVP. Se revisaron la spec, los casos de uso, los registros SL-30 a SL-39 y el código actual. La revisión se realizó sobre una copia local anterior; el estado actual de `main` está publicado en `0caa67d`. La corrección de sincronización de categorías de `frontend/src/App.jsx` quedó publicada en ese commit. `FRONTEND-UI-CONTEXT.md` permanece untracked e intacto.

### Pruebas ejecutadas

- Backend `npm test`: 2 suites, 61/61 tests aprobados con Node 24 y PostgreSQL 18.3 temporal en puerto 55439. Base vacía, unaccent, cinco migraciones y seed de prueba; variables ficticias y carga de .env real deshabilitada. No se utilizó la base de desarrollo. Instancia temporal detenida al finalizar.
- Frontend `npm run lint` y `npm run build`: aprobados sobre el working tree, incluida la modificación local previa de App.jsx. No acredita QA manual ni validación exclusiva del HEAD publicado.
- Comprobación directa de errorHandler con NODE_ENV=production: error inesperado devuelve 500 genérico sin stack ni detalle interno.
- `git diff --check`: aprobado. No se cambiaron dependencias ni lockfiles.

### Revisión de flujos y evidencia

| Flujo | Evidencia y límite |
| --- | --- |
| Catálogo, búsqueda, filtros, paginación | App.jsx y product.repository/service: búsqueda parametrizada con unaccent/ILIKE, filtros combinados, paginación y corrección de página; suite products y QA previo SL-30/SL-34. Límite backend 1–50, default 12; frontend solicita 4. |
| Detalle y galería | ProductDetail usa Promise.allSettled, muestra fallo de galería sin perder detalle, principal/miniaturas; suite products y QA SL-31/SL-36/SL-39. |
| WhatsApp | utils/whatsapp genera wa.me con mensaje codificado; ProductDetail consume whatsappUrl. No hay test dedicado ni nueva apertura real de Web/app: pendiente manual. |
| Login/logout, sesión y JWT | auth.service usa bcrypt.compare, firma JWT con expiración; auth.middleware verifica firma y rol; App valida /auth/me, limpia 401/403, conserva token en otros errores y cierra por exp. Suite auth y QA SL-33. Revocación avanzada sigue diferida. |
| Crear/editar productos | ProductForm, servicios y tests POST/PUT revisados; datos conservados en error y limpieza del alta tras éxito. Edición con datos del listado admin, coherente con SL-36. Falta QA manual integral del alta. |
| Categorías | CategoryManager, categoryService y rutas/service/repository soportan CRUD, activar/desactivar, 400/404/409 y JWT admin. No existe suite de categorías ni evidencia nueva de QA manual: permanece pendiente. |
| Imágenes | ProductImageManager y servicios: lectura admin separada, upload/main/delete; suite verifica recorrido exitoso con upload simulado y delete sin public_id. No cubre errores del proveedor ni compensaciones fallidas. |
| Actividad y visibilidad | Suite products verifica desactivación/reactivación, 401/403/404/409 y activo/publicado; reactivar no publica. |
| Navegación admin | App conserva estado de ProductManager, callbacks de regreso y refresco; respaldo manual SL-34/SL-38. El nuevo refresco local de categorías no tiene QA manual en esta sesión. |

### Seguridad mínima

- .env de backend/frontend ignorados y no versionados; .env.example sin secretos reales. JWT_SECRET y Cloudinary provienen del entorno backend; frontend solo configura una URL pública.
- Búsqueda exacta de JWT_SECRET, CLOUDINARY_API_KEY/API_SECRET, DATABASE_URL, SEED_ADMIN_PASSWORD y TEST_ADMIN_PASSWORD locales en archivos versionados: sin coincidencias; valores no impresos. Revisión del estado actual, no auditoría del historial ni de secretos externos.
- bcrypt con costo 12 al crear admin/seed; comparación con bcrypt al login. Mutaciones de productos, categorías e imágenes y lecturas admin protegidas por authenticate/authorizeAdmin.
- CORS configurable mediante CORS_ORIGINS; producción no incluye stack en errores. No se comprobó una configuración desplegada de producción.
- No se realizaron operaciones reales contra Cloudinary; mocks y recorridos existentes conservados.

### Hallazgos y límites

- La carga de categorías en App.jsx informa errores solo por consola. La versión publicada refresca categorías al regresar del gestor y filtra las inactivas en ProductForm; el flujo integral todavía requiere validación manual.
- ProductForm recibe solo categorías activas desde App.jsx; el backend también rechaza categorías inactivas. La corrección está publicada en `0caa67d`, pero el flujo integral de categorías todavía requiere validación manual.
- Los handlers con loading lo liberan en finally o tras resolver/rechazar la carga; apiClient no define timeout. No se garantiza liberación ante peticiones indefinidamente pendientes.
- Riesgo de divergencia confirmado por análisis: deleteProductImage elimina el recurso remoto antes del registro PostgreSQL. Si falla PostgreSQL puede quedar referencia rota; también puede fallar la compensación de un upload. No se reprodujo contra proveedor real ni existe cobertura de esas fallas. Requiere validación/corrección o decisión explícita antes de cerrar ese DoD.
- No se detectaron fallos en los comandos ejecutados. Lo anterior no es una aprobación de smoke/regresión manual integral.

### Documentación y DoD

README completado con objetivo, stack, estructura, requisitos, instalación, variables sin secretos, migraciones/unaccent, seed, comandos, tests y estado del MVP. Spec corregida para reflejar la precarga administrativa actual y distinguir evidencia técnica/manual.

Se cierran README y protección de secretos con el alcance indicado: **14/21 puntos DoD completos**. Permanecen abiertos WhatsApp, crear/editar (alta UI), categorías CRUD/reactivación, consistencia UI/PostgreSQL/Cloudinary, smoke final, regresión final y revisión global de cierre/deuda en Jira. En esta sesión de QA no se actualizaron Jira ni OpenSpec; el registro se realizó antes de los commits posteriores de documentación y de `App.jsx`.

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

---

### SL-38 — Centralizar acciones administrativas de producto

**Estado:** Done

**Change:** `centralize-admin-product-actions`

**Jira:** `SL-38` — actualizado manualmente y en Listo/Finalizado, según confirmación del usuario.

#### Implementación

- Se retiraron únicamente `onEdit` y `onManageImages` de las tarjetas del catálogo en `frontend/src/App.jsx` (11 líneas eliminadas).
- Las tarjetas del showroom no muestran Editar ni Gestionar imágenes, aun con sesión admin; conservan los datos y la selección para abrir detalle.
- Se conservaron Nuevo producto, Gestionar productos, Gestionar categorías y Cerrar sesión.
- ProductManager conserva Editar, Gestionar imágenes y Desactivar para activos, y únicamente Activar para inactivos.
- No se modificaron ProductCard, ProductManager, backend, base de datos, autenticación, servicios, visibilidad pública ni dependencias.
- Se documentó la ubicación de acciones en `MVP-V1-FINAL-SPEC.md` y `08_Use_Cases.md`.

#### Verificación técnica

- Frontend `npm run lint`: aprobado.
- Frontend `npm run build`: aprobado.
- `git diff --check`: aprobado en la revisión de implementación.
- `openspec validate centralize-admin-product-actions --strict`: aprobado después de actualizar la documentación.
- Seguimiento OpenSpec: 13/13 tareas completas; QA manual (3.1–3.6) y actualización externa de Jira (4.3) completados según confirmación del usuario.
- Revisión estática de regresión: el catálogo conserva `product` y `onSelect`, filtros, paginación y detalle/Volver; ProductManager conserva sus callbacks, reglas de activación, filtros y página en App, regreso desde formulario/imágenes y refetch al volver al catálogo.
- Esta revisión de código no sustituye el QA interactivo ni demuestra persistencia o respuestas HTTP en ejecución.

#### QA manual aprobado

- El usuario confirmó que el QA manual de SL-38 fue completado correctamente.
- El catálogo principal no muestra Editar ni Gestionar imágenes con sesión admin.
- Los accesos globales administrativos continúan visibles.
- ProductManager conserva Editar, Gestionar imágenes y Activar/Desactivar.
- La navegación y sincronización entre edición, gestor y catálogo funcionan sin F5.
- Regresión SL-36 aprobada: productos no publicados continúan respondiendo 404 en detalle e imágenes públicas.
- Regresión SL-37 aprobada: solo existen Disponible, Reservado y Vendido como estados comerciales.
- Logout/login y controles administrativos funcionan correctamente.

#### Resultado final del QA

Implementación y QA de SL-38 aprobados. La evidencia manual proviene de la confirmación del usuario; no corresponde a una nueva ejecución del navegador por el agente.

#### Cierre final y alcance

- Jira SL-38 actualizado manualmente y finalizado según confirmación del usuario; no quedan tareas pendientes del change.
- Se conserva fuera de alcance la limitación previa del gestor de imágenes para productos no publicados: utiliza la lectura pública, cuyo contrato responde 404 para productos no visibles, según el análisis de design.md.

SL-38 fue commiteado en `a9a98ad` (`refactor: centralize admin product actions`) y archivado en `openspec/changes/archive/2026-09-11-centralize-admin-product-actions/`.

---

### SL-39 — Permitir gestión admin de imágenes en productos no publicados

**Estado:** Done. Implementación completada, pruebas automatizadas y QA manual aprobadas; OpenSpec archivado.

**Change:** `allow-admin-image-management-for-unpublished-products`

**Jira:** `SL-39` — Done/Listo según confirmación del usuario.

**Commit funcional:** `f6246bf` — `feat: allow admin image management for unpublished products`

**Archive commit:** `70b6c07` — `chore: archive admin image management change`

#### Problema

ProductManager ofrecía Gestionar imágenes para productos activos no publicados,
pero ProductImageManager cargaba la colección mediante el endpoint público. La
regla de visibilidad pública respondía correctamente `404`, impidiendo completar
el flujo administrativo.

#### Implementación

- Se agregó `GET /api/products/admin/:productId/images` con `authenticate` y
  `authorizeAdmin`.
- La lectura administrativa reutiliza `validateProductForImageChanges`, la misma
  validación de las mutaciones: inexistente → `404`; inactivo → `409`.
- Un producto activo puede listar sus imágenes aunque `is_published = false`.
- El endpoint público permanece sin cambios: solo expone imágenes de productos
  activos y publicados.
- ProductImageManager usa la lectura administrativa en la carga inicial y en los
  refetch posteriores a subir, marcar principal y eliminar.
- ProductDetail conserva la lectura pública.
- No se modificaron navegación, diseño visual, JWT global, Cloudinary, base de
  datos ni dependencias.

#### Verificación automática

- Backend `npm test`: 2 suites y 61 tests aprobados.
- Se cubrió público publicado/no publicado/inactivo; admin publicado/no
  publicado/sin imágenes/inactivo/inexistente/sin token/no admin.
- Regresión automatizada de subir, marcar principal y eliminar aprobada con
  Cloudinary simulado; no se realizó una operación real contra el proveedor.
- Frontend `npm run lint`: aprobado.
- Frontend `npm run build`: aprobado.
- OpenSpec strict: aprobado.

#### QA manual aprobado

- QA manual completado y aprobado según confirmación del usuario el 2026-09-17; esta actualización documental no implica una nueva ejecución de las pruebas.
- Público: activo/publicado → `200`; activo/no publicado, inactivo e inexistente → `404`.
- Admin: activo/publicado y activo/no publicado → `200`; inactivo → `409`; inexistente → `404`.
- Autorización: sin token → `401`; token válido con `role=customer` → `403`; token admin → acceso permitido.
- ProductManager permite gestionar imágenes de productos activos, incluidos los no publicados; los inactivos no muestran Gestionar imágenes.
- ProductDetail mantiene el comportamiento público.
- Subir, marcar principal y eliminar imágenes continúan funcionando correctamente.

#### Resultado del cierre técnico

- Implementación, pruebas automatizadas y QA manual completos y aprobados.
- OpenSpec: 14/14 tareas completas; todas las tareas 1.x, 2.x, 3.x y 4.x están completas. La tarea 4.3 se completa con la confirmación del usuario sobre Jira.
- `git diff --check`: aprobado; solo se informaron avisos de normalización LF/CRLF.
- Jira SL-39 completada según confirmación del usuario; no se realizó una actualización externa desde el agente.
- El cambio fue commiteado y archivado, sin tareas pendientes.

OpenSpec archivado en `openspec/changes/archive/2026-09-17-allow-admin-image-management-for-unpublished-products/`, con la spec principal sincronizada en `openspec/specs/admin-product-image-access/spec.md`.

---

### configure-github-actions-ci — Integración continua

**Estado:** implementación completada; CI en Linux por push a main y pull_request validado; fallos controlados backend/frontend, recuperación y QA final de infraestructura aprobados el 2026-09-18. Cierre funcional completo: 12/12 tareas. Contrato aprobado por instrucción explícita del developer en modo IMPLEMENT. Jira: Done/Listo, marcado manualmente por el developer según su confirmación del 2026-09-18; identificador no informado.

- Creado `.github/workflows/ci.yml`: push a main y PR hacia main, jobs backend/frontend independientes, Ubuntu 24.04, Node 24.x, npm ci y cache por lockfile.
- Backend: postgres:18 efímero con health check, unaccent, cinco migraciones sin .env, seed y npm test. Frontend: lint y build.
- Variables ficticias, permisos contents: read, acciones fijadas a SHA y checkout sin persistencia de credenciales. Se conservan las simulaciones existentes de Cloudinary; sin secretos reales, deploy ni cambios funcionales o de dependencias.

**Validación local:** actionlint aprobado (sin ShellCheck). En copia temporal de archivos versionados sin .env ni node_modules previos, Node 24.14.0: npm ci aprobado en ambos proyectos; PostgreSQL 18.3 temporal y aislado en Windows, desde base vacía, completó unaccent, migraciones y seed; backend 2 suites y 61/61 tests aprobados; frontend lint/build aprobados. No se utilizó la base de desarrollo del proyecto.

**Evidencia remota confirmada por el developer:** [GitHub Actions, run 35402784406](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35402784406), disparado por push a main del commit `f786078e11b0819554efa11ddfa741b2b17eca9f` (`ci: add GitHub Actions validation workflow`). Frontend: success con Node 24, npm ci, lint y build. Backend: success con postgres:18 en runner Linux, unaccent, migraciones, seed y npm test; contenedor detenido correctamente. Esta evidencia resuelve la validación Linux pendiente de la prueba local y completa la tarea 3.1.

**Validación real por PR:** rama temporal `ci-qa-validation` desde main f786078; [PR #1](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/pull/1) hacia main, abierto en borrador y sin merge. Resultados consultados en GitHub Actions:

| Commit temporal | Ejecución pull_request | Backend | Frontend |
| --- | --- | --- | --- |
| a748939 — fallo backend | [35404612949](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404612949) | failure | success |
| 5138d5c — reversión backend | [35404739107](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404739107) | success | success |
| d4e6740 — fallo frontend | [35404753135](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404753135) | success | failure |
| f19a681 — reversión frontend | [35404840646](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404840646) | success | success |

Se inyectó `exit 1` temporalmente en el workflow después de npm test y, por separado, después del build. Ambas ejecuciones fallaron globalmente sin impedir el éxito del otro job. No se modificó código funcional; no se probaron fallos individuales de cada comando de preparación. Tras las reversiones, `git diff main HEAD` está vacío y el PR vuelve a tener ambos jobs verdes. Documentación pendiente preservada fuera de los commits temporales; main no recibió estos commits.

**QA final de infraestructura (3.4): aprobado el 2026-09-18.** Revisión directa de jobs/steps de las cinco ejecuciones, logs backend de todas ellas y logs frontend del fallo y recuperación final. Confirmados 61/61 tests backend, fallos por exit 1 posteriores a tests/build exitosos, independencia de jobs y recuperación. Los logs muestran eliminación de cada contenedor PostgreSQL y su red, incluso ante fallo. Workflow sin secretos reales de aplicación ni .env real; usa valores ficticios y el token automático de Actions con Contents: read y Metadata: read.

Cloudinary: los recorridos de tests revisados usan mock de upload y delete con public_id NULL, evitando llamadas reales al proveedor. Conclusión basada en código y ejecución, sin captura de tráfico ni bloqueo global de red; no se afirma una auditoría de toda la red del runner.

Sin cambios funcionales, de dependencias, lockfiles, E2E ni sdd-check.ps1. Los cuatro commits temporales solo tocaron el workflow y se revirtieron; main local y remoto consultado siguen en f786078. `git diff main HEAD` vacío. OpenSpec strict y git diff --check aprobados. Detalle de la revisión registrado en tasks.md.

**Cierre funcional — 2026-09-18:** el developer confirmó Jira Done/Listo, actualizado manualmente por él; 4.2 completada con esa confirmación externa. Total: 12/12 tareas completas. CI validado por push y pull_request, fallos controlados backend/frontend comprobados y revertidos, QA de infraestructura aprobado. Change listo para archive una vez registrada mediante commit autorizado la evidencia documental pendiente, conforme al workflow del proyecto. El PR y la rama se conservan para revisión. Esta actualización no realiza commit, push, merge, cierre de PR, eliminación de rama, archive ni modificación externa de Jira.
