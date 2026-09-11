## 1. Implementación frontend

- [x] 1.1 Retirar únicamente `onEdit` y `onManageImages` de la invocación de ProductCard en el catálogo de `frontend/src/App.jsx`; verificar en el diff que permanecen `key`, `product`, `onSelect`, los accesos globales y los callbacks de ProductManager, sin modificar componentes compartidos ni estados de navegación.

## 2. Verificación automática y alcance

- [x] 2.1 Ejecutar `npm run lint` y `npm run build` desde `frontend` y confirmar ambos resultados satisfactorios, corrigiendo únicamente errores introducidos por SL-38.
- [x] 2.2 Ejecutar `git diff --check` y revisar el diff de SL-38 para confirmar que no cambia backend, autenticación, servicios, modelo de datos, dependencias ni código ajeno a la invocación del catálogo.

## 3. QA manual y regresión

- [x] 3.1 Verificar el catálogo sin sesión y con sesión admin: ninguna tarjeta muestra Editar, Gestionar imágenes, Activar o Desactivar; datos, imagen/placeholder, filtros, limpieza, paginación, resultado vacío y detalle/Volver conservan su funcionamiento y el estado de navegación.
- [x] 3.2 Verificar los cuatro accesos globales: Nuevo producto abre el alta, Gestionar productos abre el listado administrativo, Gestionar categorías abre su gestor y Cerrar sesión retorna al modo público; confirmar que los accesos administrativos no aparecen sin sesión válida ni tras invalidación de sesión.
- [x] 3.3 Verificar en Gestionar productos que los activos ofrecen Editar, Gestionar imágenes y Desactivar, y los inactivos únicamente Activar; comprobar la apertura del formulario y del gestor de imágenes de un producto activo/publicado y el ciclo Desactivar/Activar sin republicación automática.
- [x] 3.4 Verificar gestión filtrada en una página superior a 1 → Editar/Guardar/Volver y → Gestionar imágenes/Volver, conservando filtros y página; tras modificar datos o imagen principal y tras activar/desactivar, volver al catálogo y comprobar sincronización sin F5 y corrección de página cuando corresponda.
- [x] 3.5 Verificar regresión de SL-36/SL-37: un activo/no publicado se precarga y edita desde gestión; Disponible, Reservado y Vendido permanecen separados de Publicado y los valores se conservan al reabrir; listado, detalle e imágenes públicos mantienen la ocultación de no visibles. Registrar aparte la limitación previa de lectura de imágenes descrita en design.md, sin cambiar el contrato público.
- [x] 3.6 Verificar que un error de validación/conflicto administrativo permanece visible sin cerrar la sesión y que 401/403 conserva el manejo de sesión existente, registrando la evidencia de los escenarios comprobados.

## 4. Documentación y seguimiento

- [x] 4.1 Documentar en `docs/sdd/MVP-V1-FINAL-SPEC.md` y `docs/sdd/08_Use_Cases.md` que los accesos por producto parten de Gestionar productos y que el catálogo conserva los accesos globales; verificar que la actualización se limita a la ubicación de acciones de SL-38.
- [x] 4.2 Actualizar `docs/sdd/SDD-PROGRESS.md` con Jira SL-38, alcance implementado y resultados reales de lint/build, QA y regresión, verificando que no se declare completado ningún control pendiente.
- [x] 4.3 Actualizar Jira SL-38 con el alcance y evidencia final, mediante autorización disponible en la fase de implementación y antes de cualquier commit futuro; verificar su coherencia con SDD-PROGRESS y las tareas OpenSpec, sin marcar esta tarea completa mientras la actualización externa siga pendiente.
- [x] 4.4 Ejecutar `openspec validate centralize-admin-product-actions --strict` y `git diff --check` después del cierre documental, verificando que los cuatro artefactos sigan completos y coherentes con la implementación, sin hacer commit ni archivar.
