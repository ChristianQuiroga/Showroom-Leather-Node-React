## Why

El modelo actual permite representar “no publicado” de dos formas distintas: `status = unpublished` e `is_published = false`. Esta duplicación admite combinaciones contradictorias, mezcla el ciclo comercial con la visibilidad del catálogo y dificulta que backend, frontend y base de datos apliquen una única regla.

El change asociado a Jira **SL-37** separará ambas responsabilidades: `status` describirá solo el estado comercial y `is_published` será la única fuente de verdad para la publicación pública.

## What Changes

- **BREAKING**: eliminar `unpublished` de los valores aceptados para `status`; los únicos estados comerciales válidos serán `available`, `reserved` y `sold`.
- Mantener `is_published` como indicador exclusivo de publicación, independiente de cualquiera de los tres estados comerciales.
- Normalizar los registros existentes con `status = unpublished` antes de restringir el `CHECK` de PostgreSQL: conservarlos fuera del catálogo con `is_published = false` y asignar `sold` cuando `stock = 0` o `available` cuando `stock > 0`.
- Alinear validaciones, filtros y respuestas de la API con el dominio comercial reducido, preservando la protección pública basada en `is_active` e `is_published`.
- Retirar “No publicado” de los selectores y etiquetas de estado comercial del frontend; el checkbox y el indicador de publicación seguirán representando la visibilidad.
- Agregar cobertura automática y QA manual para la migración, las validaciones, los filtros y la independencia entre estado comercial y publicación.
- Actualizar la documentación SDD/OpenSpec y registrar el avance y la verificación de Jira SL-37.

### Scope

- Backend: validación de altas, ediciones y filtros por `status`.
- Frontend: `ProductForm`, `ProductManager`, catálogo y componentes que traducen estados.
- PostgreSQL: datos existentes y restricción `CHECK` de `products.status`.
- Seeds, tests y documentación relacionada con el modelo, la API y el seguimiento SDD.

### Non-goals

- No agregar nuevos estados comerciales ni cambiar las reglas actuales de stock para `available` y `sold`.
- No agregar un nuevo filtro administrativo por publicación; `is_published` seguirá editándose y mostrándose por los mecanismos actuales.
- No modificar autenticación, autorización, rutas, contratos ajenos al campo `status` ni la integración con Cloudinary o WhatsApp.
- No realizar refactors generales, cambios visuales ni nuevas funcionalidades fuera de Jira SL-37.

## Capabilities

### New Capabilities

- `product-commercial-status`: define el dominio comercial permitido, su independencia respecto de la publicación, la normalización de datos existentes y la representación administrativa.

### Modified Capabilities

- `public-product-visibility`: explicita que la elegibilidad pública depende de `is_active` e `is_published`, con independencia del estado comercial válido.

## Impact

- Base de datos: requiere una migración de datos y el reemplazo del `CHECK` de `products.status`; no requiere nuevas tablas ni columnas.
- Backend: afecta el servicio de productos y sus pruebas; repositorio y rutas conservan sus responsabilidades actuales salvo los ajustes estrictamente necesarios para la migración y validación.
- Frontend: afecta las opciones de estado de `ProductForm`, `ProductManager`, el filtro público y las traducciones de `ProductCard`/`ProductDetail`.
- Seeds: los datos actuales ya usan `available`; deberán verificarse para impedir la reintroducción de `unpublished`.
- API: las operaciones y filtros que reciban `status = unpublished` responderán como valor inválido; la forma de los recursos y la autorización administrativa no cambian.
- Dependencias: no se requieren nuevas librerías ni servicios externos.
