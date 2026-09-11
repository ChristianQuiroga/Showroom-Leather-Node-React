## Purpose

Definir estados comerciales inequívocos para los productos y separar ese ciclo comercial de la decisión independiente de publicarlos en el catálogo.

## ADDED Requirements

### Requirement: Dominio de estado comercial
El sistema SHALL aceptar únicamente `available`, `reserved` y `sold` como valores de `status` para un producto y MUST rechazar `unpublished` como estado comercial.

#### Scenario: Crear con un estado comercial permitido
- **WHEN** un administrador crea un producto con `status` igual a `available`, `reserved` o `sold` y el resto de los datos es válido
- **THEN** el sistema procesa el alta conforme a las reglas de stock existentes

#### Scenario: Actualizar con un estado comercial permitido
- **WHEN** un administrador actualiza un producto con `status` igual a `available`, `reserved` o `sold` y el resto de los datos es válido
- **THEN** el sistema procesa la actualización conforme a las reglas de stock existentes

#### Scenario: Rechazar unpublished en una escritura
- **WHEN** un administrador intenta crear o actualizar un producto con `status = unpublished`
- **THEN** el sistema responde `400` con el contrato existente de estado inválido y no persiste el cambio

#### Scenario: Rechazar unpublished en un filtro
- **WHEN** un cliente público o administrador solicita un listado con `status = unpublished`
- **THEN** el sistema responde `400` e informa que el estado no pertenece a los valores comerciales permitidos

### Requirement: Independencia entre estado comercial y publicación
El sistema MUST representar el estado comercial mediante `status` y la publicación mediante `is_published`; cada estado comercial permitido SHALL poder combinarse con `is_published = true` o `is_published = false` sin convertir la publicación en un estado comercial.

#### Scenario: Producto comercial disponible no publicado
- **WHEN** un administrador guarda un producto con `status = available` e `is_published = false`
- **THEN** el sistema conserva ambos valores sin sustituir `status` por otro valor

#### Scenario: Producto comercial reservado publicado
- **WHEN** un administrador guarda un producto con `status = reserved` e `is_published = true`
- **THEN** el sistema conserva ambos valores sin alterar el estado comercial por su publicación

#### Scenario: Producto vendido no publicado
- **WHEN** un administrador guarda un producto con `status = sold` e `is_published = false`
- **THEN** el sistema conserva ambos valores conforme a las reglas de stock existentes

### Requirement: Normalización de datos heredados
La migración SHALL convertir todos los registros existentes con `status = unpublished` antes de restringir el dominio: MUST fijar `is_published = false`, MUST asignar `status = sold` cuando `stock = 0` y MUST asignar `status = available` cuando `stock > 0`.

#### Scenario: Normalizar un producto heredado sin stock
- **WHEN** la migración encuentra un producto con `status = unpublished` y `stock = 0`
- **THEN** el registro queda con `status = sold` e `is_published = false`

#### Scenario: Normalizar un producto heredado con stock
- **WHEN** la migración encuentra un producto con `status = unpublished` y `stock > 0`
- **THEN** el registro queda con `status = available` e `is_published = false`

#### Scenario: Preservar productos ya consistentes
- **WHEN** la migración encuentra un producto cuyo `status` ya es `available`, `reserved` o `sold`
- **THEN** conserva su `status` e `is_published` actuales

#### Scenario: Impedir reintroducción en base de datos
- **WHEN** una escritura directa intenta persistir `status = unpublished` después de la migración
- **THEN** PostgreSQL rechaza el valor por la restricción del dominio comercial

### Requirement: Representación administrativa separada
La interfaz administrativa SHALL ofrecer únicamente `available`, `reserved` y `sold` en los controles de estado comercial, y SHALL mantener el control y el indicador de publicación basados en `is_published`.

#### Scenario: Editar publicación sin cambiar estado comercial
- **WHEN** un administrador marca o desmarca “Publicado” en el formulario de producto
- **THEN** la interfaz modifica `is_published` sin asignar `unpublished` a `status`

#### Scenario: Filtrar por estado comercial
- **WHEN** un administrador abre el filtro de estado en la gestión de productos
- **THEN** la interfaz ofrece `available`, `reserved` y `sold` y no ofrece “No publicado” como estado

#### Scenario: Mostrar ambas dimensiones
- **WHEN** la gestión administrativa muestra un producto
- **THEN** presenta por separado su estado comercial y su indicador de publicación
