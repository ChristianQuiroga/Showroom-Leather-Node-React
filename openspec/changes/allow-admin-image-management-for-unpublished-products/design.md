## Context

Ver `proposal.md` para la motivación. El flujo actual contiene una diferencia entre lectura y mutación: `GET /api/products/:productId/images` es público y el servicio valida `findPublicById`, mientras POST/PATCH/DELETE ya requieren JWT, rol admin y permiten productos activos sin comprobar `is_published`. ProductManager ofrece Gestionar imágenes para todo producto activo; ProductImageManager usa la lectura pública tanto al abrir como después de cada mutación.

La visibilidad pública definida por `public-product-visibility` exige que productos activos no publicados continúen respondiendo `404` en detalle e imágenes públicas. La regla existente de mutaciones impide gestionar imágenes de productos inactivos con `409`.

## Goals / Non-Goals

**Goals:** completar la lectura administrativa para que coincida con las mutaciones ya autorizadas, conservar el aislamiento público y realizar refetch administrativo después de cada cambio.

**Non-Goals:** modificar el endpoint público, habilitar productos inactivos, alterar JWT, rutas de navegación, Cloudinary, PostgreSQL, dependencias o la presentación visual.

## Decisions

### 1. Ruta administrativa bajo el recurso de productos

Se propone `GET /api/products/admin/:productId/images`, protegido por `authenticate` y `authorizeAdmin`, como variante administrativa de la lectura actual. Reutiliza la convención de `GET /api/products/admin` y agrupa una operación de producto con su colección de imágenes.

La ruta se registra de forma explícita en el router de productos antes de rutas parametrizadas generales y delega en el controlador/servicio de imágenes. El servicio administrativo MUST reutilizar la misma lógica/helper/service existente que usan las mutaciones de imágenes para validar que el producto existe y está activo: producto inexistente → `404`; producto inactivo → `409`. No se duplicará esa lógica en un bloque independiente. La lectura administrativa no filtra por `is_published`. No se agrega un prefijo global `/api/admin`, pues la API actual agrupa lectura administrativa de productos bajo `/api/products/admin`.

Alternativas descartadas:

- Proteger `GET /api/products/:productId/images` según presencia de token: mezclaria contratos público y administrativo, volvería ambigua la autorización y podría exponer datos por configuración incorrecta.
- Crear `GET /api/admin/products/:productId/images`: sería válido, pero introduce una familia de rutas nueva mientras la arquitectura actual ya usa `/api/products/admin`.
- Reutilizar `GET /api/products/admin` con imágenes embebidas: ampliaría su payload, paginación y responsabilidades sin ser necesario.

### 2. Cliente administrativo separado

El servicio frontend expone una función específica que envía el token a la nueva ruta. ProductImageManager la usa para carga inicial y refetch. La función pública actual continúa siendo la dependencia de ProductDetail; no se decide por estado de sesión ni se cambia su URL.

### 3. Estado inactivo coherente con mutaciones

La lectura administrativa devuelve `409` para productos inactivos, usando la regla de que sus imágenes no se gestionan. ProductManager ya omite Gestionar imágenes para ellos; la respuesta protege llamadas directas y conserva la misma semántica que subir, marcar principal o eliminar.

## Risks / Trade-offs

- [Exposición accidental de imágenes no publicadas] → ruta separada, middlewares de JWT/rol obligatorios y pruebas explícitas de `401`, `403` y `404` público.
- [Divergencia entre la carga inicial y refetch] → ProductImageManager usa una sola función administrativa para ambos recorridos.
- [Regresión de ProductDetail] → conservar la función pública y sus pruebas de producto visible/no visible.
- [Cambio accidental del contrato de producto inactivo] → validar `409` en lectura administrativa y confirmar que ProductManager sigue sin presentar la acción.
- [Orden de rutas Express] → registrar la ruta administrativa estática antes de rutas genéricas y probar su resolución.

## Migration Plan

En una futura aplicación: implementar ruta, controlador/servicio y cliente; ejecutar pruebas backend de matriz público/admin y pruebas frontend existentes; realizar QA con productos activo/publicado, activo/no publicado e inactivo. No hay migración de datos, dependencia ni despliegue especial. La reversión consiste en retirar exclusivamente la ruta y cliente administrativo nuevos; la lectura pública y las mutaciones actuales permanecen sin cambios.
