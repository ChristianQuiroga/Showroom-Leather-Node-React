## 1. Preparación y migración de datos

- [x] 1.1 Auditar la base objetivo y registrar el conteo de productos con `status = unpublished`, agrupado por `stock` e `is_published`, verificando que el resultado permita revisar todas las filas afectadas antes de migrar.
- [x] 1.2 Crear una migración `node-pg-migrate` que normalice `status = unpublished` a `sold` si `stock = 0` o a `available` si `stock > 0`, fije `is_published = false` y reemplace el `CHECK` por los tres estados permitidos; verificar `up` en una base con casos heredados.
- [x] 1.3 Implementar el `down` que restaure el dominio anterior y documentar que no reconstruye valores ambiguos; verificar el ciclo `up`/`down`/`up` y que el último estado no contenga `unpublished`.
- [x] 1.4 Verificar seeds y fixtures para que no creen `status = unpublished`, y ejecutar el seed o su validación disponible sin modificar datos de ejemplo ajenos al alcance.

## 2. Backend

- [x] 2.1 Reducir a `available`, `reserved` y `sold` la validación compartida por altas, ediciones y filtros en el servicio de productos, eliminando la lista local duplicada; verificar errores `400` para `unpublished` y aceptación de los tres estados válidos.
- [x] 2.2 Ajustar los mensajes de validación que enumeran estados y verificar que no anuncien `unpublished` como permitido.
- [x] 2.3 Confirmar que repositorio, rutas y controladores conservan el filtro público por `is_active` e `is_published` y el acceso administrativo protegido existente, mediante las pruebas de visibilidad y autorización.

## 3. Frontend

- [x] 3.1 Retirar “No publicado” del selector comercial de `ProductForm` y verificar que el checkbox `isPublished` siga cargando y enviando la publicación independientemente de `status`.
- [x] 3.2 Retirar `unpublished` de los filtros comerciales de `ProductManager` y del catálogo público, verificando que los tres estados permitidos generen el parámetro `status` esperado.
- [x] 3.3 Retirar la traducción comercial de `unpublished` en `ProductCard` y `ProductDetail`, y verificar que `ProductManager` continúe mostrando por separado el estado comercial y “Publicado/No publicado”.

## 4. Tests automáticos y regresión

- [x] 4.1 Agregar tests backend para altas y ediciones con los tres estados permitidos y para el rechazo de `status = unpublished`, verificando respuestas, persistencia y reglas de stock.
- [x] 4.2 Agregar tests backend para filtros público y administrativo con estados permitidos y con `unpublished`, verificando `400` para el valor eliminado y la conservación de paginación y forma de respuesta.
- [x] 4.3 Agregar una verificación de migración que cubra filas heredadas con stock cero y positivo, preservación de filas válidas y rechazo directo de `unpublished` por PostgreSQL.
- [x] 4.4 Ejecutar la suite backend completa y corregir únicamente regresiones causadas por SL-37 hasta obtener resultado satisfactorio.
- [x] 4.5 Ejecutar lint y build del frontend y corregir únicamente errores causados por SL-37 hasta obtener ambos resultados satisfactorios.
- [x] 4.6 Repetir la regresión de SL-36 para listado, detalle e imágenes públicos y edición administrativa de productos no publicados, verificando que JWT/rol admin y la ocultación pública permanezcan intactos.

## 5. QA manual

- [x] 5.1 Crear y editar productos con cada combinación entre `available`, `reserved`, `sold` e `is_published` verdadero/falso, verificando que publicación y estado comercial se conserven por separado.
- [x] 5.2 Verificar en catálogo, detalle e imágenes que solo aparezcan productos activos y publicados, y que el filtro comercial funcione para los tres estados permitidos.
- [x] 5.3 Verificar en gestión administrativa que un producto no publicado siga visible y editable, que no exista “No publicado” como estado comercial y que el indicador de publicación siga siendo correcto.
- [x] 5.4 Ejecutar `git diff --check` y revisar el diff completo para confirmar que no haya cambios ni refactors fuera del alcance de SL-37.

## 6. Documentación y seguimiento

- [x] 6.1 Actualizar `docs/sdd/03_Domain_Model.md`, `docs/sdd/05_Database_Schema.md`, `docs/sdd/07_API.md` y, si corresponde por su contrato, `docs/sdd/MVP-V1-FINAL-SPEC.md`; verificar que todos definan `available`, `reserved` y `sold` como estados comerciales y `is_published` como publicación.
- [x] 6.2 Actualizar `docs/sdd/SDD-PROGRESS.md` con Jira SL-37, la migración, la implementación y la evidencia de tests/QA, verificando que refleje el resultado real y no anticipe trabajo incompleto.
- [x] 6.3 Actualizar Jira SL-37 con el alcance y la evidencia final de validación antes de cualquier commit, verificando que coincida con los artefactos OpenSpec y `SDD-PROGRESS.md`.
- [x] 6.4 Ejecutar `openspec validate separate-product-commercial-status-from-publication --strict` y confirmar que los cuatro artefactos permanezcan completos y coherentes después de la implementación y documentación.
