## Context

Véase [proposal.md](proposal.md) para la motivación de SL-38. La inspección estática del código actual identifica dos consumidores de `ProductCard`: el catálogo en `App.jsx` y el listado de `ProductManager.jsx`.

- En el catálogo, `App.jsx` entrega `onEdit` y `onManageImages` solo cuando existe `token`. `ProductCard.jsx` renderiza cada botón según la presencia del callback y evita propagar su click al artículo mediante `stopPropagation`.
- `ProductManager` entrega sus propios callbacks a la misma tarjeta: Editar, Gestionar imágenes y Desactivar para activos; Activar para inactivos. La publicación no determina esas acciones.
- Los callbacks de gestión recibidos desde `App` usan `setEditingProduct`/`setShowProductForm` y `setImageProductId`. No llaman ni dependen de los callbacks declarados en el catálogo.
- `App` prioriza formulario e imágenes antes de `showProductManager`. Este último permanece activo mientras se abre una subvista, de modo que Volver retorna a gestión. `productManagerState` vive en `App` y conserva filtros y página durante esos recorridos.
- `onSaved` actualiza el contador público. Al volver desde gestión al catálogo también se incrementa ese contador y se reinicia el estado administrativo. La corrección de páginas fuera de rango ya existe en ambos listados.
- Nuevo producto reutiliza el formulario con `editingProduct = null`. Los otros accesos globales y el cierre de sesión tienen handlers independientes.

No se encontró una dependencia funcional de los botones específicos del catálogo fuera de esa invocación. Los estados y el contrato compartido de ProductCard sí tienen consumidores administrativos y deben conservarse. El análisis confirma que la implementación puede resolverse solo en frontend; no se ejecutó QA en esta fase de propuesta.

## Goals / Non-Goals

**Goals:** retirar exclusivamente las dos conexiones administrativas de las tarjetas del catálogo, preservando los contratos compartidos y el estado de navegación.

**Non-Goals:** modificar `ProductCard`, `ProductManager`, formulario, gestor de imágenes, servicios, autenticación, CSS o routing; introducir nuevas props de modo, migraciones de datos o dependencias. Las exclusiones funcionales se detallan en la propuesta.

## Decisions

### 1. Resolver la ubicación en el punto de composición del catálogo

Eliminar `onEdit` y `onManageImages` únicamente del `ProductCard` dentro de `products.map` en `App.jsx`. Conservar `key`, `product` y `onSelect`. La ausencia de callbacks ya impide renderizar esos botones.

Alternativas descartadas: agregar `isAdmin` o un modo de catálogo a ProductCard introduciría una condición redundante; eliminar los botones del componente compartido rompería ProductManager; ocultarlos por CSS mantendría controles innecesarios y ampliaría el cambio.

### 2. Conservar los callbacks y estados administrativos existentes

No retirar las props homónimas de la invocación de `ProductManager` en `App`, ni los estados que abren formulario e imágenes. La separación actual permite centralizar los accesos sin reconstruir navegación o introducir React Router.

Alternativa descartada: mover formularios dentro de ProductManager requeriría reestructurar estado y sincronización sin beneficio necesario para SL-38.

### 3. Verificación proporcional y documentación focalizada

Usar lint y build del frontend, revisión del diff y QA de los escenarios de la especificación. El frontend no define un runner de tests; no se agregará infraestructura ni tests que solo repliquen la ausencia de dos props. Verificar imágenes con un producto activo/publicado y verificar por separado la precarga de edición de uno activo/no publicado.

En implementación, documentar la ubicación de los accesos en `docs/sdd/MVP-V1-FINAL-SPEC.md` y `docs/sdd/08_Use_Cases.md`, y registrar evidencia en `SDD-PROGRESS.md` y Jira SL-38. No corregir secciones históricas ajenas al alcance. La alternativa de una revisión documental general queda fuera de este cambio mínimo.

## Risks / Trade-offs

- [Eliminar props o estados compartidos por error] → limitar el diff de código a la invocación del catálogo y revisar que ProductManager conserve sus callbacks.
- [Pérdida de regreso, filtros o actualización sin F5] → ejecutar los recorridos gestión → edición/imágenes → gestión → catálogo, incluyendo página superior a 1 y mutaciones.
- [Un paso adicional para editar desde el showroom] → decisión funcional solicitada: utilizar el acceso global Gestionar productos.
- [Confundir ubicación de botones con autorización] → conservar JWT, validación de sesión y manejo de 401/403; ocultar acciones no sustituye controles backend.
- [Referencia SDD previa inconsistente] → `MVP-V1-FINAL-SPEC.md`, sección Editar, menciona precarga por `GET /products/:id`, mientras el código y `public-product-visibility` definen precarga desde el objeto administrativo. SL-38 preserva este último flujo conforme al pedido; no propone restaurar la consulta pública ni resolver esa discrepancia documental dentro de este alcance.
- [Limitación previa en imágenes de productos no publicados] → `ProductImageManager` usa `getProductImages(productId)` sin token para lectura; el contrato público de SL-36 responde 404 para no publicados. Es una limitación detectada por inspección, no una regresión verificada de SL-38. Conservar el acceso y comportamiento actuales; no agregar endpoints ni debilitar visibilidad para resolverla en este cambio.
- [Regresiones de SL-37] → comprobar los tres estados comerciales y la publicación separada al editar desde gestión, conservando las reglas actuales de stock.

## Migration Plan

Tras una solicitud explícita de implementación, aplicar la eliminación de props, ejecutar verificación y QA, y completar documentación y seguimiento. El despliegue eventual solo requiere el build habitual del frontend; no requiere cambios backend, migraciones PostgreSQL ni modificaciones de servicios externos. El rollback eventual consiste en restaurar esas dos props en la invocación del catálogo. No se ejecutan implementación, despliegue, commit ni archivo en esta propuesta.
