## Why

Jira **SL-38** elimina la duplicación de Editar y Gestionar imágenes entre las tarjetas del catálogo principal y Gestionar productos. Centralizar esos accesos por producto en la gestión administrativa permite que el catálogo conserve su función de showroom incluso con una sesión admin activa.

## What Changes

- Retirar Editar y Gestionar imágenes de las tarjetas del catálogo principal para cualquier estado de sesión.
- Mantener los accesos globales Nuevo producto, Gestionar productos, Gestionar categorías y Cerrar sesión para el administrador.
- Conservar Editar, Gestionar imágenes y Desactivar en productos activos dentro de Gestionar productos; los inactivos siguen ofreciendo únicamente Activar.
- Preservar la selección de tarjetas para abrir el detalle, los filtros, la paginación y los flujos de regreso y actualización existentes.

### Non-goals

- No modificar backend, visibilidad pública, autenticación, autorización, modelo de datos ni reglas comerciales o de publicación.
- No agregar rutas, dependencias, controles, estilos ni refactors generales.
- No rediseñar ProductCard ni corregir problemas previos de lectura de imágenes o documentación ajenos a la ubicación de las acciones.
- Esta propuesta no implementa código, actualiza Jira, realiza commit ni archiva cambios.

## Capabilities

### New Capabilities

- `admin-product-action-placement`: define la ubicación exclusiva de los accesos administrativos por producto y la conservación del showroom, los accesos globales y la navegación administrativa.

### Modified Capabilities

Ninguna. `public-product-visibility` y `product-commercial-status` conservan sus requisitos; se verifican como regresión.

## Impact

- Frontend: modificación prevista únicamente en la invocación de ProductCard del catálogo en `frontend/src/App.jsx`.
- `ProductCard.jsx` y `ProductManager.jsx` reutilizan su contrato actual sin modificaciones previstas.
- API, backend, PostgreSQL, Cloudinary y dependencias: sin cambios.
- Verificación prevista: lint/build existentes y QA de catálogo, accesos globales, gestión y navegación; no existe un script de tests frontend en `frontend/package.json` y no se propone incorporar infraestructura de pruebas para esta eliminación de props.
- Seguimiento durante implementación: registrar SL-38 en `docs/sdd/SDD-PROGRESS.md`, aclarar la ubicación de acciones en la documentación funcional y actualizar Jira con autorización disponible.
