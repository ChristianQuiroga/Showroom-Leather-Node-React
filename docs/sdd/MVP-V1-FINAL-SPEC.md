# Showroom Leather — MVP v1 Finalization Spec

**Proyecto:** Showroom-Leather-Node-React  
**Estado:** QA técnico aprobado parcialmente; cierre manual del MVP pendiente
**Objetivo:** cerrar y estabilizar el MVP v1 mediante Spec-Driven Development (SDD).

## 1. Propósito

Esta especificación consolida lo ya implementado, define el comportamiento esperado del MVP v1 y establece qué debe completarse antes de considerar la versión terminada.

A partir de este documento, la fase final se desarrolla contra especificaciones, criterios de aceptación y pruebas verificables.

## 2. Enfoque SDD

En esta fase adoptamos **Spec-Driven Development**:

1. Definir el comportamiento esperado.
2. Verificar el estado actual.
3. Identificar gaps.
4. Convertir los gaps en tareas.
5. Implementar por bloques.
6. Validar contra acceptance criteria.
7. Ejecutar regresión.
8. Cerrar cuando se cumpla la Definition of Done.

### Terminología

- **Spec / Specification:** contrato escrito del comportamiento esperado.
- **Requirement:** necesidad que el sistema debe satisfacer.
- **Acceptance Criteria:** condiciones observables para aceptar una funcionalidad.
- **Finding:** hallazgo detectado durante revisión o pruebas.
- **Gap:** diferencia entre estado actual y estado esperado.
- **Scope:** alcance incluido.
- **Out of Scope:** funcionalidad excluida.
- **Definition of Done (DoD):** condiciones globales para considerar terminado el MVP.
- **Regression Test:** prueba para verificar que un cambio nuevo no rompió algo existente.
- **Smoke Test:** prueba rápida de flujos críticos.
- **Refetch:** nueva consulta al backend para sincronizar UI con estado persistido.
- **State Transition:** cambio controlado de estado, por ejemplo Activo → Inactivo → Activo.
- **Soft Delete:** desactivación lógica sin borrar físicamente el registro.
- **Contract:** acuerdo entre capas, por ejemplo frontend ↔ API.

## 3. Alcance del MVP v1

### Catálogo público
- Listado de productos activos/publicados.
- Imagen principal o placeholder.
- Búsqueda por nombre y descripción.
- Búsqueda tolerante a mayúsculas/minúsculas y acentos.
- Filtros por estado y categoría.
- Paginación.
- Detalle de producto.
- Consulta por WhatsApp.
- Galería pública de imágenes, resuelta en SL-31.

### Administración
- Login admin con JWT.
- Persistencia de sesión.
- Logout.
- Alta y edición de productos.
- Gestión de categorías.
- Gestión de imágenes.
- Operaciones protegidas por JWT y rol admin.
- Gestión de productos inactivos y reactivación, resuelta en SL-34.

### Infraestructura
- Backend Node.js + Express.
- Frontend React + JavaScript + Vite.
- PostgreSQL.
- Cloudinary.
- API REST.
- Variables de entorno.
- Git/GitHub.
- Jest + Supertest en backend.

## 4. Fuera de alcance

No forma parte del MVP v1:
- carrito;
- checkout;
- pagos;
- órdenes;
- múltiples vendedores;
- múltiples proveedores de imágenes;
- analytics avanzado;
- refresh tokens;
- roles complejos;
- PWA;
- app móvil nativa;
- push notifications;
- internacionalización;
- SEO avanzado.

## 5. Arquitectura actual

### Backend
Capas:
- routes;
- controllers;
- services;
- repositories;
- middlewares;
- config;
- utils;
- seeds;
- scripts.

Responsabilidades:
- **Route:** endpoint + middlewares.
- **Controller:** adaptación HTTP.
- **Service:** reglas de negocio.
- **Repository:** persistencia.
- **Middleware:** auth, errores, upload.

### Frontend
Estructura:
- components;
- pages;
- services;
- hooks;
- utils;
- assets.

El estado principal sigue concentrado en `App.jsx`; deberá revisarse en la fase de refactor.

## 6. Catálogo público

### Requirement
El usuario no autenticado debe poder navegar el catálogo sin ver funciones administrativas.

Las tarjetas del catálogo mantienen su función de showroom aun con sesión admin activa: no ofrecen Editar ni Gestionar imágenes. Los accesos globales Nuevo producto, Gestionar productos, Gestionar categorías y Cerrar sesión permanecen disponibles para el administrador.

Los accesos por producto se centralizan en Gestionar productos: los activos ofrecen Editar, Gestionar imágenes y Desactivar; los inactivos ofrecen únicamente Activar.

### Acceptance Criteria
- `GET /api/products` público.
- Solo `is_active = true`.
- Solo `is_published = true`.
- Cada producto incluye `main_image_url`.
- Placeholder si no hay imagen.
- Card con nombre, precio, color, talle, estado e imagen.
- Responsive en desktop, tablet y mobile.

## 7. Búsqueda y filtros

### Búsqueda
- Busca por `name`.
- Busca por `description`.
- Usa `ILIKE`.
- Usa PostgreSQL `unaccent`.
- `marron` debe encontrar `marrón`.
- `clasica` debe encontrar `clásica`.

### Filtros
- `search`
- `status`: estado comercial `available`, `reserved` o `sold`
- `categoryId`

La publicación no es un estado comercial: `is_published` es la única fuente de verdad para la visibilidad pública.

### Acceptance Criteria
- Son combinables.
- Cambiar filtro vuelve a `page = 1`.
- Debe existir **Limpiar filtros**.
- Limpiar filtros debe:
  - vaciar search;
  - volver a Todos los estados;
  - volver a Todas las categorías;
  - volver a page 1;
  - hacer refetch.

### Estado

Resuelto en **SL-30**.

La acción **Limpiar filtros**:
- vacía búsqueda;
- restablece estado y categoría;
- vuelve a `page = 1`;
- provoca el refetch correspondiente.

## 8. Paginación

### Acceptance Criteria
El backend devuelve:
- `page`
- `limit`
- `total`
- `totalPages`

Además:
- Anterior deshabilitado en page 1.
- Siguiente deshabilitado en última página.
- Filtros + paginación funcionan juntos.
- No debe quedar page inválida.
- Definir limit final; durante pruebas se utilizó 4, originalmente 12.

## 9. Detalle de producto

Debe mostrar:
- nombre;
- código;
- descripción;
- categoría;
- material;
- color;
- talle;
- precio ARS formateado;
- estado en español;
- imagen principal;
- Volver;
- WhatsApp.

### Galería pública
Debe mostrar todas las imágenes del producto.

Acceptance Criteria:
- principal destacada;
- secundarias visibles;
- navegación clara;
- pública;
- responsive;
- funciona con una sola imagen;
- placeholder sin imágenes.

### Estado
Resuelto en **SL-31**, con pruebas manuales de múltiples imágenes, selección de miniaturas, una sola imagen, placeholder y responsive registradas en `SDD-PROGRESS.md`.

## 10. WhatsApp

### Acceptance Criteria
- URL generada en backend.
- Teléfono desde env.
- Mensaje incluye nombre, código y precio formateado.
- Frontend no duplica la lógica.
- Abre WhatsApp Web/app.

## 11. Autenticación y autorización

### Login
- credenciales válidas → éxito;
- inválidas → 401 y mensaje;
- campos email/password;
- botón Ingresar;
- botón Volver;
- layout responsive.

### JWT
- actualmente guardado en `localStorage`;
- F5 mantiene sesión;
- logout elimina token;
- admin requests envían `Authorization: Bearer <token>`;
- sin token → 401;
- token inválido/expirado → 401;
- no-admin → 403.

### Decisión de cierre
Decisión cerrada en **SL-33**: se mantiene `localStorage` para MVP v1.

- Validación inicial mediante `GET /api/auth/me` antes de habilitar administración.
- `401` y `403` eliminan la sesión; los demás errores y los errores de red no eliminan el token.
- Cierre local basado en `exp`; login + F5, token inválido/expirado y logout validados.
- Cookies `httpOnly`, refresh tokens y revocación de sesiones quedan como deuda futura.

## 12. Productos — administración

### Crear
- solo admin;
- JWT obligatorio;
- campos: nombre, descripción, categoría, material, color, talle, precio, stock, estado, destacado, publicado;
- validaciones frontend + backend;
- error visible;
- no limpiar en error;
- limpiar en éxito;
- persistir PostgreSQL;
- refetch de catálogo.

### Reglas
- precio > 0;
- stock >= 0;
- material obligatorio;
- categoría existente/activa;
- stock 0 + available → sold;
- stock > 0 + sold → 409.

### Editar
- solo admin;
- precarga con el producto seleccionado del listado administrativo `GET /api/products/admin`, según la corrección documentada en SL-36;
- botón Guardar deshabilitado sin cambios;
- campos cambiados resaltados;
- PUT protegido;
- `originalForm` actualizado tras éxito;
- opción Seguir editando;
- catálogo refleja cambios sin F5.

### Productos inactivos
Público no los muestra; admin sí debe poder gestionarlos.

Acceptance Criteria:
- admin lista inactivos;
- estado visible;
- reactivación disponible;
- Activo → Inactivo;
- Inactivo → Activo;
- refetch posterior.

### Estado
Resuelto en **SL-34**: listado administrativo, desactivación/reactivación, refetch y conservación de filtros/página validados. Reactivar establece `is_active = true` sin republicar automáticamente; la publicación posterior requiere una acción explícita desde Editar.

## 13. Categorías — administración

Admin puede:
- listar;
- crear;
- editar;
- desactivar;
- reactivar.

Reglas:
- nombre obligatorio;
- máximo 100 caracteres;
- no duplicados;
- 404 si no existe;
- 409 si se repite estado;
- categoría inactiva no debe usarse indebidamente.

Reactivación:
`PATCH /api/categories/:id/activate`

## 14. Imágenes — administración

Proveedor: Cloudinary.

Endpoints:
- `GET /api/products/:productId/images`
- `POST /api/products/:productId/images`
- `PATCH /api/products/:productId/images/:imageId/main`
- `DELETE /api/products/:productId/images/:imageId`

Acceptance Criteria:
- GET público;
- mutaciones admin;
- multipart/form-data;
- campo `image`;
- JPG/JPEG/PNG/WebP;
- máximo 5 MB;
- primera imagen principal;
- solo una principal;
- cambio de principal;
- eliminar;
- refetch automático;
- card actualiza `main_image_url`;
- fallo no deja UI/persistencia divergentes.

## 15. Manejo de errores

### Backend
Usar `AppError` + middleware centralizado.

Status esperados:
- 400
- 401
- 403
- 404
- 409
- 500
- 502 cuando corresponda a proveedor externo.

Multer:
- >5 MB → 400;
- formato inválido → 400.

Cloudinary:
- fallo upstream → 502 cuando corresponda.

### Frontend
- error visible;
- mensaje contextual;
- no borrar datos útiles ante error;
- no quedar en loading;
- no mostrar éxito si backend rechazó.

## 16. UX/UI y responsive

Objetivo:
- mobile: 1 columna;
- tablet: 2 columnas;
- desktop: auto-fit.

Filtros:
- desktop: fila;
- mobile: columna.

Formularios:
- desktop: 2 columnas cuando corresponda;
- mobile: 1 columna.

### Estado
Resuelto en **SL-32**: catálogo, filtros, detalle, galería, login/logout y gestión administrativa validados en un dispositivo móvil real, sin scroll horizontal no deseado y con controles táctiles accesibles. Los ajustes temporales de IP/CORS para QA no constituyen la configuración definitiva de producción.

## 17. Testing

### Backend existente
- auth;
- products;
- Jest;
- Supertest.

### Mínimo antes de cerrar
- `npm test` sin fallos;
- smoke test manual;
- regression test manual;
- auth;
- CRUD productos;
- categorías;
- imágenes;
- filtros/paginación;
- WhatsApp.

### Tests recomendados
Agregar cobertura para:
- categorías;
- imágenes;
- reactivación de categorías;
- productos inactivos;
- búsqueda sin acentos;
- reglas stock/status.

Frontend automatizado: recomendado, no necesariamente bloqueante para MVP v1 salvo bugs críticos.

## 18. Refactor mínimo

### Frontend
Revisar:
- responsabilidad/tamaño de `App.jsx`;
- múltiples flags para navegación;
- posible React Router;
- auth centralizada;
- formatters duplicados;
- `API_URL` centralizada;
- loading/error reutilizable;
- componentes repetidos.

### Backend
Revisar:
- naming;
- duplicación de validaciones;
- contratos de repositories;
- errores;
- SQL;
- índices;
- separación de responsabilidades.

No refactorizar solo por estética.

## 19. Seguridad

Antes de cerrar:
- `.env` ignorado;
- `.env.example` sin secretos;
- JWT secret fuera del repo;
- Cloudinary secret fuera del repo;
- passwords con bcrypt;
- rutas admin protegidas;
- CORS limitado;
- no stack trace en producción;
- persistencia JWT: decisión cerrada en SL-33, localStorage para MVP v1;
- expiración y limpieza de sesión: validadas en SL-33.

## 20. Performance

- mantener paginación;
- evitar N+1 para imagen principal;
- usar JOIN para `main_image_url`;
- count query sin joins innecesarios;
- Cloudinary/CDN;
- revisar índices;
- evaluar debounce de `search`.

## 21. Findings abiertos

Los cinco asuntos originalmente listados están cerrados según `SDD-PROGRESS.md`: Limpiar filtros (SL-30), galería pública (SL-31), validación mobile real (SL-32), decisión de persistencia de sesión (SL-33) y productos inactivos/reactivación (SL-34).

No quedan findings abiertos de esa lista. La estrategia avanzada de sesión se conserva como deuda futura; los controles de cierre aún sin evidencia se indican en la Definition of Done.

## 22. Prioridades

### P0 — Bloqueante
- sin errores críticos;
- auth admin;
- CRUD productos;
- categorías;
- imágenes;
- catálogo público;
- persistencia consistente;
- tests backend verdes.

### P1 — Debe resolverse para MVP v1
- limpiar filtros: resuelto en SL-30;
- galería pública: resuelta en SL-31;
- productos inactivos/reactivación: resuelto en SL-34;
- regresión final;
- seguridad;
- limit final.

### P2 — Puede quedar como deuda controlada
- estrategia avanzada de sesión: deuda futura acordada en SL-33;
- React Router;
- tests frontend completos;
- refactor amplio.

## 23. Definition of Done — MVP v1

- [x] Catálogo público funciona sin login.
- [x] Búsqueda y filtros funcionan.
- [x] Existe Limpiar filtros.
- [x] Paginación funciona.
- [x] Detalle completo.
- [x] Galería pública.
- [ ] WhatsApp funciona.
- [x] Login/logout funcionan.
- [x] JWT protege admin.
- [ ] Crear/editar productos.
- [x] Admin ve/reactiva inactivos.
- [ ] Categorías CRUD + reactivación.
- [x] Imágenes CRUD + principal.
- [x] Feedback de errores.
- [ ] Sin divergencias UI/PostgreSQL/Cloudinary.
- [x] Tests backend pasan.
- [ ] Smoke test final pasa.
- [ ] Regression test final pasa.
- [x] Secretos protegidos.
- [x] README actualizado.
- [ ] Jira refleja cierre o deuda diferida.

### Evidencia de cumplimiento

Estado contrastado con `SDD-PROGRESS.md` y QA técnico del 2026-09-21; no se declara cerrado el MVP completo ni se sustituye QA manual por análisis de código.

- Catálogo sin login, búsqueda/filtros y paginación: SL-30, SL-34 y Validación manual — navegación, paginación y sesión.
- Detalle y galería: QA mobile de SL-32, galería de SL-31 y acceso público validado en SL-36/SL-39; datos esperados documentados en esta spec y UC-03 de `08_Use_Cases.md`.
- Login/logout y JWT: SL-33, SL-36 y SL-39, con pruebas de expiración, sesión inválida, 401 y 403.
- Inactivos/reactivación: SL-34 y su QA de navegación y sincronización.
- Imágenes CRUD/principal: regresión automatizada y QA manual aprobados en SL-39.
- Feedback de errores: SL-33 valida 409 con error visible y sesión conservada; SL-34 conserva el listado ante errores. La consistencia global ante fallos sigue siendo un control separado.
- Tests backend: 2 suites y 61/61 tests aprobados en SL-39 y en la validación de CI registrada.
- QA técnico del 2026-09-21: 61/61 tests en PostgreSQL 18 temporal, frontend lint/build y git diff --check aprobados. La corrección de sincronización de categorías revisada entonces quedó publicada posteriormente en `0caa67d`; el registro de QA original no equivale a una validación manual posterior de ese commit.
- Secretos protegidos: .env ignorados y no versionados, ejemplos sin secretos, configuración backend por entorno y sin credenciales en variables frontend. Búsqueda por coincidencia exacta de seis valores sensibles locales sin hallazgos en archivos versionados. Alcance: estado actual; no certifica historial Git, infraestructura externa ni rotación de credenciales. Respuesta 500 en NODE_ENV=production verificada sin stack ni mensaje interno.
- README: completado con instalación, variables, base/unaccent, comandos, tests y estado real del MVP.

### Pendientes de evidencia o cierre

- WhatsApp: UC-04 documenta el flujo, pero no hay una validación de apertura Web/app y mensaje registrada en SDD-PROGRESS.
- Crear/editar productos: edición y refetch validados en SL-32/SL-34/SL-37/SL-38; falta evidencia explícita del flujo completo de alta desde UI. El criterio combinado permanece sin marcar.
- Categorías CRUD + reactivación: comportamiento documentado en UC-09; falta registro de validación integral.
- Sin divergencias UI/PostgreSQL/Cloudinary: hay sincronización y operaciones exitosas validadas, pero no evidencia global de consistencia ante fallos del proveedor o persistencia.
- Smoke test final y regression test final: las pruebas por work item no acreditan una ejecución final integral del MVP.
- Jira refleja cierre o deuda diferida: hay cierres de work items confirmados, pero no constancia de revisión final del MVP y trazabilidad de toda la deuda diferida.

### Límites y hallazgos del QA técnico final

- ProductForm conserva datos ante rechazo y limpia el alta solo tras éxito; categorías y gestores muestran errores y liberan estados de operación al completar/rechazar las promesas. No hay timeout explícito en apiClient: una solicitud que nunca finaliza puede mantener loading; no se certifica ausencia absoluta de bloqueos sin QA interactivo.
- App.jsx solo registra en consola los errores de carga de categorías. La versión publicada refresca categorías al volver del gestor y filtra las inactivas en ProductForm; el flujo integral todavía requiere validación manual.
- ProductForm recibe desde App.jsx solo categorías activas y el backend también rechaza categorías inactivas. La corrección está publicada en `0caa67d`; registrar el flujo de categorías en QA manual, sin asumir que el CRUD integral esté validado.
- deleteProductImage elimina primero en Cloudinary y luego en PostgreSQL: si falla la segunda operación puede quedar una referencia rota. El rollback de upload intenta limpiar Cloudinary, pero puede fallar. La suite actual no cubre estas fallas; el criterio de consistencia permanece abierto.

## 24. Flujo de trabajo SDD final

### Paso 1 — Requirement
Seleccionar requisito de esta spec.

### Paso 2 — Current State
Verificar implementación actual.

### Paso 3 — Gap Analysis
Comparar Current State vs Expected State.

### Paso 4 — Implementation Plan
Definir archivos, cambios y riesgos.

### Paso 5 — Implement
Modificar solo lo requerido.

### Paso 6 — Verify
Probar contra Acceptance Criteria.

### Paso 7 — Regression
Confirmar que no rompimos flujos relacionados.

### Paso 8 — Update Spec/Jira
Actualizar ticket y spec si cambia una decisión.

### Paso 9 — Commit
Commit pequeño, descriptivo y coherente.

## 25. Orden recomendado

1. Limpiar filtros — completado en SL-30.
2. Galería pública — completado en SL-31.
3. Productos inactivos/reactivación — completado en SL-34.
4. Validación mobile real — completado en SL-32.
5. Persistencia JWT — decisión cerrada en SL-33; estrategia avanzada diferida.
6. Refactor frontend mínimo.
7. Refactor backend mínimo.
8. Tests prioritarios.
9. Seguridad.
10. Performance.
11. Regression final.
12. README final.
13. Cierre MVP v1.

## 26. Regla de cierre de scope

Durante esta fase no se incorporan features nuevas fuera de esta especificación salvo que sean necesarias para:
- corregir un bug;
- cumplir un acceptance criterion;
- resolver un riesgo de seguridad;
- evitar una regresión;
- completar un flujo comprometido.

Cualquier idea adicional se registra para MVP v2.
