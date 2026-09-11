## Context

Véase [proposal.md](proposal.md) para la motivación de Jira SL-37. Actualmente `products.status` es `varchar(20)` con valor por defecto `available` y un `CHECK` que admite `available`, `reserved`, `sold` y `unpublished`; no es un enum de PostgreSQL. La misma lista aparece en la validación de altas, ediciones y filtros del servicio de productos.

La tabla ya posee `is_published boolean NOT NULL DEFAULT false`. El repositorio público filtra por `is_active = true` e `is_published = true`, mientras que el repositorio administrativo devuelve ambos campos sin aplicar esa visibilidad. No hace falta cambiar rutas, controladores, autorización JWT/rol admin ni la separación introducida por SL-36.

En el frontend, `ProductForm` ofrece `unpublished` en el selector comercial y además un checkbox `isPublished`; `ProductManager` y el catálogo lo incluyen como filtro, y `ProductCard`/`ProductDetail` lo traducen como “No publicado”. Los seeds inspeccionados usan `available` e `isPublished = true`. Los tests existentes usan `is_published = false` para productos no publicados, pero no cubren el rechazo específico de `status = unpublished` ni la migración.

## Goals / Non-Goals

**Goals:**

- Aplicar el mismo conjunto comercial (`available`, `reserved`, `sold`) en PostgreSQL, backend y frontend.
- Migrar datos heredados sin publicar accidentalmente productos cuyo estado comercial era ambiguo.
- Mantener `is_published` como única decisión de publicación y preservar la visibilidad pública y los accesos administrativos actuales.
- Cubrir la ruptura de contrato con validaciones automáticas, regresión y QA manual.

**Non-Goals:**

- Rediseñar el modelo de inventario, estados, filtros o ciclo de reservas.
- Agregar un filtro específico por `is_published` o nuevos endpoints administrativos.
- Centralizar constantes en toda la aplicación, cambiar formatos de respuesta o refactorizar repositorios/componentes fuera de los usos afectados.
- Modificar autenticación, Cloudinary, WhatsApp, paginación o activación lógica.

## Decisions

### 1. Mantener dos dimensiones independientes

`status` conservará el ciclo comercial y `is_published` conservará la visibilidad. No se agregará una restricción entre ambos campos: cualquiera de los tres estados comerciales podrá estar publicado o no publicado. Esto elimina la duplicación sin crear combinaciones artificialmente prohibidas.

Alternativa descartada: derivar `is_published` desde `status`. Mantendría la mezcla conceptual y rompería casos válidos, como preparar un producto disponible antes de publicarlo.

### 2. Normalizar de forma conservadora antes de restringir el CHECK

Una nueva migración `node-pg-migrate`, ejecutada transaccionalmente según el patrón actual, actualizará solo filas con `status = unpublished`:

- fijará `is_published = false` para no exponer datos por efecto de la conversión;
- asignará `sold` cuando `stock = 0`;
- asignará `available` cuando `stock > 0`;
- reemplazará el `CHECK` actual por uno que admita únicamente `available`, `reserved` y `sold`.

No se inferirá `reserved` porque los datos actuales no contienen información suficiente para distinguir una reserva. Antes de aplicar la migración se registrará el conteo de filas afectadas para revisión y luego se verificará que no quede ninguna.

Alternativa descartada: convertir todas las filas a `available`. Violaria la regla existente que impide un producto disponible sin stock. También se descarta conservar `is_published = true` porque podría hacer públicamente visible un producto antes representado como “no publicado”.

### 3. Reducir la validación en el servicio existente

La lista de estados válida del servicio se reducirá a tres valores y se reutilizará para altas, ediciones y filtros, eliminando la declaración duplicada dentro del listado. El repositorio seguirá aceptando un filtro ya validado y no incorporará reglas de negocio.

Las solicitudes con `status = unpublished` seguirán el contrato existente para estados inválidos (`400`). Las reglas actuales que convierten `available` sin stock a `sold` y rechazan `sold` con stock se conservarán.

Alternativa descartada: aceptar temporalmente `unpublished` y traducirlo a `is_published = false`. Eso prolongaría el contrato ambiguo y ocultaría errores de clientes desactualizados.

### 4. Retirar solo las representaciones comerciales obsoletas del frontend

Se quitará `unpublished` de los selectores de `ProductForm`, `ProductManager` y catálogo, y de los mapas de etiquetas de `ProductCard` y `ProductDetail`. El checkbox de publicación y el indicador separado de `ProductManager` permanecerán basados en `is_published`. No se agregará un filtro de publicación como parte de este change.

Alternativa descartada: renombrar la opción comercial “No publicado”. Seguiría representando una dimensión incorrecta dentro de `status`.

### 5. Mantener las fronteras y dependencias actuales

La API pública seguirá usando las consultas que exigen producto activo y publicado; la API administrativa conservará JWT y rol admin. No se requieren nuevas rutas, tablas, columnas, servicios externos ni dependencias. Sí se requiere una migración de base de datos y ajustes coordinados de backend, frontend, tests y documentación.

## Risks / Trade-offs

- [No es posible recuperar si una fila `unpublished` estaba reservada] → normalizar según stock, mantenerla no publicada y documentar el conteo para revisión administrativa previa/posterior.
- [Clientes antiguos pueden seguir enviando `status = unpublished`] → devolver `400` explícito y actualizar simultáneamente los controles y documentación del cliente incluido en el proyecto.
- [Una secuencia incorrecta puede hacer fallar el nuevo CHECK] → normalizar primero, comprobar cero filas inválidas y recién después reemplazar la restricción dentro de la migración.
- [El nombre generado de la restricción existente puede variar] → inspeccionar la restricción real y usar las primitivas de `node-pg-migrate` o SQL catalogado que la reemplacen de forma determinista.
- [El rollback no puede reconstruir el estado ambiguo original] → el `down` restaurará el dominio anterior, pero la normalización de valores se documentará como irreversible; respaldar o registrar las filas afectadas antes del despliegue si se necesita recuperación exacta.
- [Regresión en visibilidad pública o edición administrativa] → conservar rutas/repositorio y repetir las pruebas de listado, detalle, imágenes y carga administrativa de SL-36 para productos publicados y no publicados.

## Migration Plan

1. Consultar y registrar cuántas filas tienen `status = unpublished`, separadas por stock y publicación, antes del despliegue.
2. Desplegar backend y frontend compatibles con el dominio de tres estados junto con la migración planificada.
3. Dentro de la migración, normalizar las filas afectadas, verificar que no queden valores `unpublished` y reemplazar el `CHECK`.
4. Verificar altas, ediciones, filtros públicos/administrativos y visibilidad con las seis combinaciones entre los tres estados e `is_published`.
5. Para rollback de aplicación, restaurar primero el `CHECK` anterior mediante `down`; los valores normalizados permanecerán en su estado comercial derivado y no se reconstruirá `unpublished` automáticamente.
