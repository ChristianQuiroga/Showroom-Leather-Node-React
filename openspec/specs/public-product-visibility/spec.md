# public-product-visibility Specification

## Purpose
Define la regla de visibilidad que protege el detalle público de productos y sus imágenes para que solo el catálogo vigente sea accesible por ID.

## Requirements

### Requirement: Visibilidad del detalle público
El sistema SHALL mantener `GET /api/products/:id` accesible sin autenticación y SHALL devolver el detalle solicitado únicamente cuando el producto exista y tenga `is_active = true` e `is_published = true` simultáneamente.

#### Scenario: Consulta pública sin credenciales
- **WHEN** un cliente sin JWT solicita el detalle con el ID válido de un producto activo y publicado
- **THEN** el sistema responde `200` sin exigir autenticación

#### Scenario: Producto activo y publicado
- **WHEN** un cliente público solicita el detalle con el ID válido de un producto activo y publicado
- **THEN** el sistema responde `200` con la información pública del producto

#### Scenario: Producto inactivo
- **WHEN** un cliente público solicita el detalle con el ID válido de un producto inactivo
- **THEN** el sistema responde `404` con el mismo contrato de producto no encontrado usado para un ID inexistente

#### Scenario: Producto activo no publicado
- **WHEN** un cliente público solicita el detalle con el ID válido de un producto activo pero no publicado
- **THEN** el sistema responde `404` con el mismo contrato de producto no encontrado usado para un ID inexistente

#### Scenario: ID de detalle inválido
- **WHEN** un cliente público solicita el detalle con un ID que no es un entero positivo
- **THEN** el sistema conserva la respuesta de validación `400` existente

### Requirement: Visibilidad de imágenes públicas
El sistema SHALL mantener `GET /api/products/:productId/images` accesible sin autenticación y SHALL devolver las imágenes solicitadas únicamente cuando el producto propietario exista y tenga `is_active = true` e `is_published = true` simultáneamente.

#### Scenario: Consulta pública de imágenes sin credenciales
- **WHEN** un cliente sin JWT solicita las imágenes de un producto activo y publicado usando un ID válido
- **THEN** el sistema responde `200` sin exigir autenticación

#### Scenario: Imágenes de producto activo y publicado
- **WHEN** un cliente público solicita las imágenes de un producto activo y publicado usando un ID válido
- **THEN** el sistema responde `200` con la colección de imágenes asociadas, incluida una colección vacía cuando el producto no tiene imágenes

#### Scenario: Imágenes de producto inactivo
- **WHEN** un cliente público solicita las imágenes con el ID válido de un producto inactivo
- **THEN** el sistema responde `404` con el mismo contrato de producto no encontrado usado para un ID inexistente y no devuelve metadatos de imágenes

#### Scenario: Imágenes de producto activo no publicado
- **WHEN** un cliente público solicita las imágenes con el ID válido de un producto activo pero no publicado
- **THEN** el sistema responde `404` con el mismo contrato de producto no encontrado usado para un ID inexistente y no devuelve metadatos de imágenes

#### Scenario: ID de imágenes inválido
- **WHEN** un cliente público solicita imágenes con un ID de producto que no es un entero positivo
- **THEN** el sistema conserva la respuesta de validación `400` existente

### Requirement: No divulgación del estado privado
El sistema MUST presentar productos inexistentes, inactivos y no publicados de forma indistinguible en los endpoints públicos de detalle e imágenes.

#### Scenario: Comparación de productos no visibles
- **WHEN** un cliente consulta cualquiera de los dos endpoints públicos con un ID inexistente, inactivo o no publicado
- **THEN** la respuesta usa el mismo estado `404` y el mismo mensaje público de producto no encontrado

### Requirement: Preservación de la edición administrativa
El sistema SHALL permitir que un administrador autenticado cargue para edición los datos de un producto activo obtenido mediante el listado administrativo protegido, aunque el producto no esté publicado, sin debilitar las restricciones de los endpoints públicos.

#### Scenario: Administrador edita un producto activo no publicado
- **WHEN** un administrador autenticado selecciona para edición un producto activo y no publicado desde la gestión de productos
- **THEN** el formulario se carga con los datos del producto sin consultar el endpoint público de detalle

#### Scenario: Listado administrativo sin credenciales
- **WHEN** un cliente sin JWT intenta obtener los productos mediante el listado administrativo
- **THEN** el sistema responde `401` y no devuelve datos administrativos

#### Scenario: Listado administrativo sin rol admin
- **WHEN** un usuario autenticado sin rol admin intenta obtener los productos mediante el listado administrativo
- **THEN** el sistema responde `403` y no devuelve datos administrativos

### Requirement: Visibilidad pública independiente del estado comercial
El sistema SHALL decidir la visibilidad pública mediante `is_active = true` e `is_published = true`; `status` SHALL limitarse a filtrar por `available`, `reserved` o `sold` y MUST NOT actuar como indicador de publicación.

#### Scenario: Listar un producto publicado con estado comercial permitido
- **WHEN** un producto está activo, tiene `is_published = true` y su `status` es `available`, `reserved` o `sold`
- **THEN** puede aparecer en el listado público sujeto a los demás filtros solicitados

#### Scenario: Ocultar un producto no publicado con cualquier estado comercial
- **WHEN** un producto está activo, tiene `is_published = false` y su `status` es `available`, `reserved` o `sold`
- **THEN** no aparece en el listado público ni queda accesible por sus endpoints públicos de detalle o imágenes

#### Scenario: Filtrar catálogo por estado comercial
- **WHEN** un cliente público filtra por `available`, `reserved` o `sold`
- **THEN** el sistema devuelve únicamente productos que cumplen ese estado y además están activos y publicados
