## Why

La gestión de imágenes ya cubre los recorridos exitosos, pero una falla parcial entre PostgreSQL y Cloudinary puede dejar filas apuntando a assets inexistentes o assets huérfanos. Además, `setAsMain` y el refetch del frontend tienen casos de error que no están cubiertos por tests y pueden dejar un estado engañoso para el administrador.

El cambio es necesario para cerrar el criterio de consistencia del MVP v1 con compensaciones, transacciones, mensajes y pruebas verificables, manteniendo fuera una arquitectura de jobs o reconciliación automática.

## What Changes

- Mantener y probar la compensación del upload cuando PostgreSQL falla después de un upload correcto.
- Registrar y devolver un comportamiento explícito cuando el cleanup de Cloudinary también falla.
- Cambiar el delete para confirmar primero la eliminación/reasignación PostgreSQL y ejecutar luego el destroy remoto, dejando evidencia suficiente para reconciliación manual si Cloudinary falla.
- Hacer que `setAsMain` falle y haga rollback si la imagen objetivo no puede marcarse como principal.
- Mantener el índice único existente para una principal por producto.
- Evitar que el frontend muestre éxito normal cuando la mutación fue correcta pero el refetch falló.
- Evitar clicks duplicados durante set-main y delete.
- Agregar cobertura backend para los fallos parciales y actualizar la cobertura del flujo de imágenes con `public_id` simulado.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `admin-product-image-access`: modificar los requisitos de consistencia, errores parciales y sincronización del gestor de imágenes sin cambiar autorización ni visibilidad pública.

## Impact

- Backend: service y repository de imágenes, manejo de errores y tests Jest/Supertest.
- Frontend: `ProductImageManager` y su estado de loading, mensajes y refetch.
- Cloudinary: se conserva el proveedor actual; no se agregan llamadas fuera de las operaciones existentes.
- PostgreSQL: se conserva el esquema y el índice único de principal; no se agrega outbox, retry persistente ni migración salvo que la implementación aprobada demuestre necesidad estricta.
- Dependencias, rutas públicas, autorización JWT y comportamiento público de `ProductDetail` permanecen sin cambios.
- Jira: `SL-41` — "Cerrar consistencia de imágenes del MVP v1" — estado Done/Listo confirmado por el developer.

## Non-goals

- No crear outbox, jobs, retry persistente ni reconciliación automática.
- No rediseñar la arquitectura de imágenes ni cambiar de proveedor.
- No agregar infraestructura frontend de testing nueva salvo necesidad estricta.
- No realizar refactors no relacionados ni cambios funcionales fuera del flujo de imágenes.
