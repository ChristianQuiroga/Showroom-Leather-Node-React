# admin-product-image-access Specification

## Purpose

Permitir que la administración consulte y gestione imágenes de productos activos no publicados, sin modificar la privacidad de las colecciones de imágenes públicas.

## Requirements

### Requirement: Lectura pública de imágenes limitada por visibilidad

La colección pública de imágenes SHALL permanecer disponible únicamente para productos con `is_active = true` e `is_published = true`. Un visitante MUST recibir `404` sin datos de imágenes para un producto inexistente, inactivo o activo no publicado.

#### Scenario: Producto activo y publicado consultado públicamente
- **WHEN** un visitante solicita las imágenes públicas de un producto activo y publicado
- **THEN** el sistema devuelve la colección de imágenes con el contrato público existente

#### Scenario: Producto activo y no publicado consultado públicamente
- **WHEN** un visitante solicita las imágenes públicas de un producto activo y no publicado
- **THEN** el sistema responde `404` y no devuelve datos de imágenes

#### Scenario: Producto inactivo consultado públicamente
- **WHEN** un visitante solicita las imágenes públicas de un producto inactivo
- **THEN** el sistema responde `404` y no devuelve datos de imágenes

### Requirement: Lectura administrativa de imágenes de productos activos

El sistema SHALL ofrecer una lectura administrativa protegida de imágenes para productos activos. Un administrador autenticado MUST poder obtener la colección tanto de productos publicados como de productos no publicados; `is_published` MUST NOT restringir esa lectura administrativa. La respuesta SHALL usar la colección y el orden actuales de imágenes.

#### Scenario: Administrador consulta producto activo y publicado
- **WHEN** un administrador autenticado solicita las imágenes administrativas de un producto activo y publicado
- **THEN** recibe la colección de imágenes del producto

#### Scenario: Administrador consulta producto activo y no publicado
- **WHEN** un administrador autenticado solicita las imágenes administrativas de un producto activo y no publicado
- **THEN** recibe la colección de imágenes aunque el endpoint público continúe respondiendo `404`

#### Scenario: Producto activo sin imágenes
- **WHEN** un administrador autenticado solicita las imágenes administrativas de un producto activo sin imágenes
- **THEN** recibe una colección vacía con el contrato de respuesta existente

### Requirement: Autorización y estado administrativo de imágenes

La lectura administrativa MUST requerir JWT válido y rol admin. Una solicitud sin JWT SHALL responder `401`; una solicitud autenticada sin rol admin SHALL responder `403`. Para un producto inexistente, SHALL responder `404`. Para un producto inactivo, SHALL responder `409` sin devolver imágenes, coherente con la regla vigente que impide gestionar imágenes de productos desactivados.

#### Scenario: Lectura administrativa sin JWT
- **WHEN** un cliente solicita la colección administrativa sin token
- **THEN** el sistema responde `401` y no devuelve imágenes

#### Scenario: Lectura administrativa con usuario no admin
- **WHEN** un usuario autenticado sin rol admin solicita la colección administrativa
- **THEN** el sistema responde `403` y no devuelve imágenes

#### Scenario: Lectura administrativa de producto inactivo
- **WHEN** un administrador autenticado solicita la colección administrativa de un producto inactivo
- **THEN** el sistema responde `409` y no devuelve imágenes, y la interfaz no ofrece Gestionar imágenes para ese producto

### Requirement: Integración con el gestor administrativo

ProductImageManager SHALL usar la lectura administrativa protegida cuando se abre desde Gestionar productos. La carga inicial y los refetch posteriores a subir, marcar principal o eliminar MUST usar esa lectura. ProductDetail SHALL conservar la lectura pública y su comportamiento actual.

#### Scenario: Gestionar imágenes de producto no publicado
- **WHEN** un administrador abre Gestionar imágenes para un producto activo no publicado desde Gestionar productos
- **THEN** visualiza las imágenes existentes y puede continuar con las operaciones administrativas permitidas

#### Scenario: Mutación y refetch administrativo
- **WHEN** un administrador sube una imagen, marca una principal o elimina una imagen de un producto activo
- **THEN** las operaciones existentes conservan su autorización y el gestor recarga la colección mediante la lectura administrativa

#### Scenario: Detalle público sin regresión
- **WHEN** un visitante abre ProductDetail de un producto activo y publicado
- **THEN** la galería continúa usando la lectura pública y conserva su comportamiento actual
