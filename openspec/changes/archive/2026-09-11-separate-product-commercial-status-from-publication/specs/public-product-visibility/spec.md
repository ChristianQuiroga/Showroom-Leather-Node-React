## ADDED Requirements

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

