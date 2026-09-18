## 1. Versión PostgreSQL y aprobación

- [x] 1.1 Verificar la versión del servidor mediante la conexión local del backend: PostgreSQL 18.3 (server_version_num 180003); registrar en design y spec la imagen `postgres:18`, resolviendo la selección de versión antes de implementar el servicio.
- [x] 1.2 Revisar el contrato completo con el developer y registrar su aprobación; verificar Node 24.x, límites de scope y la decisión PostgreSQL resuelta antes de iniciar IMPLEMENT.

## 2. Workflow

- [x] 2.1 Crear .github/workflows/ci.yml con push a main y pull_request hacia main, jobs independientes backend/frontend, runner Ubuntu, Node 24.x y cache npm por lockfile; verificar estructura, rutas de trabajo y ausencia de dependencia entre jobs.
- [x] 2.2 Configurar PostgreSQL efímero con imagen `postgres:18`, health check, DATABASE_URL exclusiva, unaccent, migraciones sin .env y seed existente; verificar arranque desde base vacía, admin de prueba correcto y categoría activa antes de npm test.
- [x] 2.3 Configurar npm ci y npm test backend, y npm ci, npm run lint y npm run build frontend; verificar que todos los comandos obligatorios propagan errores y usan los lockfiles existentes sin modificaciones.
- [x] 2.4 Aplicar contents: read, checkout sin credenciales persistentes, acciones fijadas a SHA revisado y variables ficticias; revisar ausencia de secrets reales, .env real, pull_request_target, deploy y llamadas reales a Cloudinary en los recorridos de tests existentes.

## 3. Verificación de CI

- [x] 3.1 Validar el workflow y ejecutar su preparación/comandos en entorno limpio equivalente, con PostgreSQL desechable; registrar resultados de npm ci, unaccent, migraciones, seed, tests, lint y build sin depender del entorno local preexistente.
- [x] 3.2 Tras autorización separada para publicación/PR, verificar disparos reales por push a main y PR hacia main; registrar URLs y commits de ejecuciones con backend/frontend separados y resultados exitosos. No marcar completa por inspección estática.
  - Push a main validado en 35402784406; pull_request hacia main validado en el PR #1, con ambos jobs exitosos en 35404739107 y 35404840646. Commits y enlaces registrados abajo.
- [x] 3.3 Verificar propagación de fallos controlados de backend y frontend en entorno o rama de prueba autorizada, sin integrar fallos en main; registrar CI fallido para cada check obligatorio y continuidad del job independiente.
- [x] 3.4 Realizar QA de infraestructura con revisión manual de jobs, logs y aislamiento; confirmar que no se necesitan secretos reales ni tráfico Cloudinary y que no hubo cambios funcionales, de dependencias, E2E o sdd-check.ps1. Ejecutar git diff --check y validación strict del change.

## 4. Documentación y seguimiento

- [x] 4.1 Actualizar SDD-WORKFLOW y SDD-PROGRESS con el CI implementado, versión PostgreSQL aprobada, evidencia y pendientes reales; verificar coherencia con spec y ejecuciones sin declarar QA no realizado.
- [x] 4.2 Cuando exista work item identificado y autorización explícita, actualizar Jira con alcance y evidencia final antes del cierre definitivo; verificar confirmación externa y no marcar completada por una actualización local. No se actualiza Jira en esta fase SPEC.

## Evidencia de implementación local — 2026-09-17

- Contrato aprobado mediante instrucción explícita del developer en modo IMPLEMENT, con Node 24.x y postgres:18.
- Workflow validado con actionlint, sin ShellCheck instalado; jobs independientes y sin tolerancia de errores. SHA de checkout v6.0.2 y setup-node v6.3.0 contrastados con sus tags oficiales.
- Copia temporal de backend/frontend versionados, sin .env ni node_modules previos: npm ci aprobado en ambos, con Node 24.14.0. Lockfiles del repositorio intactos.
- Instancia temporal PostgreSQL 18.3 en Windows, puerto 55439: base vacía, unaccent, cinco migraciones y seed aprobados; autenticación del admin y categoría activa verificadas por la suite. Backend: 2 suites, 61/61 tests. Frontend: lint y build aprobados.
- Variables ficticias del workflow; la prueba local solo adapta DATABASE_URL al puerto aislado. Se conservan el mock de upload y el borrado con public_id NULL; no se usan credenciales reales de Cloudinary.
- En esa validación local Docker no tenía motor activo y no se ejecutó la imagen postgres:18 ni el runner Ubuntu. En esa etapa todavía no se había realizado commit ni push. La validación Linux posterior se registra a continuación.

## Evidencia de GitHub Actions — registrada el 2026-09-18

- Resultado confirmado por el developer: [ejecución 35402784406](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35402784406), commit `f786078e11b0819554efa11ddfa741b2b17eca9f`, trigger push a main.
- Frontend: success; Node 24, npm ci, lint y build aprobados.
- Backend: success; postgres:18 levantado correctamente en runner Linux, unaccent, migraciones, seed y npm test aprobados; contenedor detenido correctamente.
- Esta evidencia completó 3.1 y validó la parte push de 3.2. Las pruebas posteriores de PR y fallos controlados se registran a continuación.

## Validación PR y fallos controlados — 2026-09-18

Rama temporal `ci-qa-validation`, creada desde main `f786078e11b0819554efa11ddfa741b2b17eca9f`. [PR #1 hacia main](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/pull/1), abierto como borrador, sin merge. Resultados consultados directamente en la API de GitHub Actions; todas estas ejecuciones tienen evento pull_request.

| Prueba | Commit | Run | Backend | Frontend | CI |
| --- | --- | --- | --- | --- | --- |
| Fallo backend | a7489398bb740ba5970e94a91976d42960ed8569 | [35404612949](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404612949) | failure | success | failure |
| Reversión backend | 5138d5c44abfdb915adfdcbcdf2090e8d6826f88 | [35404739107](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404739107) | success | success | success |
| Fallo frontend | d4e6740764675727b66813d0c5f0f5364d396f3d | [35404753135](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404753135) | success | failure | failure |
| Reversión frontend | f19a6810169887e9c4e5debc8856d5e71a4c1681 | [35404840646](https://github.com/ChristianQuiroga/Showroom-Leather-Node-React/actions/runs/35404840646) | success | success | success |

Los fallos consistieron en agregar temporalmente `exit 1` después de `npm test` en el paso Tests backend y, por separado, después de `npm run build` en Build frontend. Se demostró la propagación del código de salida no cero y la independencia de ambos jobs; no se inyectó un fallo individual en cada migración, instalación o health check. No se modificó código de aplicación ni dependencias.

Ambos cambios fueron revertidos y publicados en la misma rama. `git diff main HEAD` quedó vacío: los archivos versionados vuelven al contenido de main. Los cambios documentales locales previos se preservaron fuera de los cuatro commits temporales y se ampliaron únicamente con esta evidencia. FRONTEND-UI-CONTEXT.md permanece untracked e intacto. PR y rama se conservan para revisión, sin merge ni cierre. Tareas 3.2 y 3.3 completas conforme a las dos pruebas autorizadas; QA final completado según la revisión siguiente. Jira (4.2) completada según la confirmación del developer registrada abajo.

## QA final de infraestructura — 2026-09-18

Resultado: aprobado para el alcance del change; tarea 3.4 completa. Se revisaron jobs y steps de las cuatro ejecuciones de la tabla y del push 35402784406 (cinco en total), junto con logs backend de las cinco ejecuciones y logs frontend del fallo controlado y de la recuperación final.

- Logs backend: 2 suites y 61 tests aprobados en las cinco ejecuciones. En 35404612949 el fallo es el exit 1 posterior a los tests; en 35404753135 el build terminó antes del exit 1 de frontend. El otro job terminó en success en ambos casos. Ambos jobs independientes y sin needs; las reversiones terminaron en success.
- Secretos: workflow sin referencias a secrets de aplicación ni .env real; JWT y Cloudinary usan los valores ficticios declarados, corroborados en los logs. El token automático de GitHub Actions sí se utiliza para checkout, con permisos Contents: read y Metadata: read; no equivale a credenciales reales de la aplicación. No se detectó exposición de secretos reales en los logs revisados.
- Cloudinary: el upload de la suite reemplaza upload_stream por un mock; el delete probado usa public_id NULL y el servicio solo llama a destroy si ese campo existe. Los recorridos revisados no hacen llamadas reales al proveedor y sus tests pasan. Esta conclusión se basa en código y ejecución; no existe captura de tráfico ni bloqueo global de red que certifique todo el tráfico del runner.
- PostgreSQL: servicio postgres:18 por job, base inicializada, health check, unaccent, migraciones y seed; los cinco logs muestran docker rm --force del contenedor y docker network rm al finalizar, incluido el fallo backend. Sin almacenamiento persistente configurado.
- Integridad: el cambio CI respecto de su base 5b18b77 solo incluye workflow, documentación y OpenSpec. Los cuatro commits temporales solo tocaron ci.yml. Sin cambios de producto, dependencias, lockfiles, E2E ni scripts/sdd-check.ps1.
- main local y remoto consultado con git ls-remote permanecen en f786078e11b0819554efa11ddfa741b2b17eca9f; los commits de fallo no llegaron a main. git diff main HEAD está vacío, y el working tree solo conserva las dos actualizaciones documentales autorizadas y el untracked excluido.
- OpenSpec strict y git diff --check aprobados. No se ejecutó CI nuevo, commit, push, merge, archive, cierre de PR, eliminación de rama ni actualización de Jira en esta revisión. Al finalizar esa revisión quedaban 11/12 tareas; el cierre de 4.2 se registra a continuación.

## Cierre funcional — 2026-09-18

- El developer confirmó que marcó Jira manualmente como Done/Listo. Esta confirmación externa completa 4.2; el agente no modificó Jira. Identificador del ticket no informado.
- CI validado en push a main y pull_request hacia main; fallos controlados backend/frontend comprobados y revertidos; QA de infraestructura aprobado, con la evidencia y límites registrados arriba.
- Total: 12/12 tareas completas. Change listo para archive una vez registrada la evidencia pendiente mediante commit autorizado, conforme al workflow del proyecto. No se archiva en esta sesión.
- PR y rama temporal se conservan para revisión. Sin commit, push, cierre de PR ni eliminación de rama en esta actualización.
