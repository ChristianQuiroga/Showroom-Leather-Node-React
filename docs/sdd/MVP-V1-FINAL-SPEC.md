# Showroom Leather — MVP v1 Finalization Spec

**Proyecto:** Showroom-Leather-Node-React  
**Estado:** Draft para fase final SDD  
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
- Galería pública de imágenes como pendiente de cierre.

### Administración
- Login admin con JWT.
- Persistencia de sesión.
- Logout.
- Alta y edición de productos.
- Gestión de categorías.
- Gestión de imágenes.
- Operaciones protegidas por JWT y rol admin.
- Gestión de productos inactivos como pendiente de cierre.

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

### Gap
Pendiente: acción **Limpiar filtros**.

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

### Gap
Pendiente: galería pública.

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

### Gap / decisión
Revisar política de persistencia:
- `localStorage`;
- `sessionStorage`;
- estrategia más robusta futura.

Para MVP v1 puede mantenerse `localStorage` si queda documentado y el JWT expira.

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
- precarga por `GET /products/:id`;
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

### Gap
Pendiente: administración/reactivación de productos inactivos.

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

### Gap
Validación en dispositivo móvil real pendiente por acceso local/red/CORS.

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
- revisar persistencia JWT;
- verificar expiración.

## 20. Performance

- mantener paginación;
- evitar N+1 para imagen principal;
- usar JOIN para `main_image_url`;
- count query sin joins innecesarios;
- Cloudinary/CDN;
- revisar índices;
- evaluar debounce de `search`.

## 21. Findings abiertos

1. Limpiar filtros.
2. Galería pública.
3. Validación mobile real.
4. Persistencia de sesión.
5. Productos inactivos/reactivación.

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
- limpiar filtros;
- galería pública;
- productos inactivos/reactivación;
- regresión final;
- seguridad;
- limit final.

### P2 — Puede quedar como deuda controlada
- mobile físico si la red local no se resuelve;
- estrategia avanzada de sesión;
- React Router;
- tests frontend completos;
- refactor amplio.

## 23. Definition of Done — MVP v1

- [ ] Catálogo público funciona sin login.
- [ ] Búsqueda y filtros funcionan.
- [ ] Existe Limpiar filtros.
- [ ] Paginación funciona.
- [ ] Detalle completo.
- [ ] Galería pública.
- [ ] WhatsApp funciona.
- [ ] Login/logout funcionan.
- [ ] JWT protege admin.
- [ ] Crear/editar productos.
- [ ] Admin ve/reactiva inactivos.
- [ ] Categorías CRUD + reactivación.
- [ ] Imágenes CRUD + principal.
- [ ] Feedback de errores.
- [ ] Sin divergencias UI/PostgreSQL/Cloudinary.
- [ ] Tests backend pasan.
- [ ] Smoke test final pasa.
- [ ] Regression test final pasa.
- [ ] Secretos protegidos.
- [ ] README actualizado.
- [ ] Jira refleja cierre o deuda diferida.

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

1. Limpiar filtros.
2. Galería pública.
3. Productos inactivos/reactivación.
4. Resolver/documentar mobile.
5. Revisar persistencia JWT.
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
