## Context

Según `proposal.md`, las rutas públicas de detalle e imágenes deben aplicar la misma visibilidad que el catálogo. Actualmente `productRepository.findAll` agrega `p.is_active = true` y `p.is_published = true` cuando opera en modo público, pero `productRepository.findById` filtra solo por ID. Tanto `productService.getProductById` como `productImageService.getProductImages` usan esa consulta sin restricciones.

La consulta irrestricta por ID también sostiene operaciones administrativas y validaciones de mutación. Cambiar su semántica global rompería esos flujos, en especial la gestión y reactivación de productos no públicos.

## Goals / Non-Goals

**Goals:**

- Centralizar en la capa de acceso a datos el predicado público `is_active = true AND is_published = true`.
- Aplicar el mismo criterio al detalle y a la lectura de imágenes.
- Conservar el contrato `404 Producto no encontrado` sin revelar el estado interno.
- Mantener disponible la consulta irrestricta para los flujos administrativos existentes.

**Non-Goals:**

- Incorporar autenticación opcional o diferenciar respuestas según sesión en estas rutas.
- Cambiar consultas administrativas, mutaciones o reglas de transición de estado.
- Alterar el almacenamiento o la entrega de archivos en Cloudinary.

## Decisions

### Agregar una consulta de producto visible por ID

Se agregará al repositorio una operación específica para recuperar por ID únicamente productos activos y publicados. El detalle público y la lectura pública de imágenes usarán esa operación; `findById` conservará su comportamiento irrestricto para administración.

Esto mantiene la regla cerca de PostgreSQL, evita cargar datos de un producto que no debe exponerse y reutiliza el mismo criterio en ambos servicios. Como alternativa se consideró consultar con `findById` y validar las banderas en cada servicio, pero duplicaría la regla y facilitaría divergencias futuras.

### Mantener la respuesta existente de recurso ausente

Cuando la consulta pública no encuentre una fila visible, los servicios lanzarán el mismo `AppError("Producto no encontrado", 404)` que ya usan para un ID inexistente. No se introducirá `403`, porque distinguir un producto privado confirmaría su existencia.

### Verificar las rutas mediante pruebas de integración

La cobertura se incorporará en Jest/Supertest sobre las rutas públicas. Para cada endpoint se probarán al menos los estados activo/publicado, inactivo y activo/no publicado, además de preservar las validaciones actuales de ID y el resultado para productos inexistentes. Las consultas bloqueadas de imágenes deberán comprobar que no se devuelve la colección.

### Reutilizar el producto del listado administrativo para edición

`ProductManager` ya obtiene productos activos, inactivos, publicados y no publicados mediante `GET /api/products/admin`, protegido con `authenticate` y `authorizeAdmin`. Al seleccionar Editar, pasará el objeto del producto activo a `App` y este a `ProductForm`, que inicializará el formulario con esos datos sin llamar a `GET /api/products/:id`.

Esta decisión evita crear un endpoint administrativo de detalle porque el listado existente ya entrega los campos requeridos por el formulario. También mantiene una separación clara: `getProductById` continúa siendo exclusivamente público y `findById` continúa disponible para validaciones y mutaciones administrativas del backend. Como alternativa se consideró agregar `GET /api/products/admin/:id`, pero ampliaría el contrato sin una necesidad actual.

## Risks / Trade-offs

- [La regla pública podría divergir de la usada en el listado] → Reutilizar exactamente el predicado de ambas banderas y cubrir los tres estados representativos en pruebas.
- [Modificar `findById` afectaría operaciones administrativas] → Mantener esa función intacta y crear una consulta pública explícita.
- [Una prueba puede depender de datos compartidos o del orden de ejecución] → Crear o ajustar fixtures controlados y restaurar el estado conforme al patrón actual de la suite.
- [El frontend puede recibir `404` si conserva un detalle abierto mientras un administrador retira el producto] → Es el comportamiento de seguridad esperado; el manejo genérico de errores existente seguirá aplicando.
- [Los datos seleccionados podrían quedar desactualizados por una edición administrativa concurrente] → Se conserva el comportamiento actual del MVP; el backend seguirá validando la actualización y el listado se vuelve a consultar al regresar a la gestión.

## Migration Plan

No se requieren migraciones de base de datos, nuevas dependencias ni acciones sobre Cloudinary. El despliegue incluye el backend actualizado y el ajuste del flujo de edición en frontend; el rollback restaura las consultas y la carga anterior del formulario sin migración de datos.
