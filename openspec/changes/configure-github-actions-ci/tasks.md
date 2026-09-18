## 1. Versión PostgreSQL y aprobación

- [x] 1.1 Verificar la versión del servidor mediante la conexión local del backend: PostgreSQL 18.3 (server_version_num 180003); registrar en design y spec la imagen `postgres:18`, resolviendo la selección de versión antes de implementar el servicio.
- [x] 1.2 Revisar el contrato completo con el developer y registrar su aprobación; verificar Node 24.x, límites de scope y la decisión PostgreSQL resuelta antes de iniciar IMPLEMENT.

## 2. Workflow

- [x] 2.1 Crear .github/workflows/ci.yml con push a main y pull_request hacia main, jobs independientes backend/frontend, runner Ubuntu, Node 24.x y cache npm por lockfile; verificar estructura, rutas de trabajo y ausencia de dependencia entre jobs.
- [x] 2.2 Configurar PostgreSQL efímero con imagen `postgres:18`, health check, DATABASE_URL exclusiva, unaccent, migraciones sin .env y seed existente; verificar arranque desde base vacía, admin de prueba correcto y categoría activa antes de npm test.
- [x] 2.3 Configurar npm ci y npm test backend, y npm ci, npm run lint y npm run build frontend; verificar que todos los comandos obligatorios propagan errores y usan los lockfiles existentes sin modificaciones.
- [x] 2.4 Aplicar contents: read, checkout sin credenciales persistentes, acciones fijadas a SHA revisado y variables ficticias; revisar ausencia de secrets reales, .env real, pull_request_target, deploy y llamadas reales a Cloudinary en los recorridos de tests existentes.

## 3. Verificación de CI

- [ ] 3.1 Validar el workflow y ejecutar su preparación/comandos en entorno limpio equivalente, con PostgreSQL desechable; registrar resultados de npm ci, unaccent, migraciones, seed, tests, lint y build sin depender del entorno local preexistente.
- [ ] 3.2 Tras autorización separada para publicación/PR, verificar disparos reales por push a main y PR hacia main; registrar URLs y commits de ejecuciones con backend/frontend separados y resultados exitosos. No marcar completa por inspección estática.
- [ ] 3.3 Verificar propagación de fallos controlados de backend y frontend en entorno o rama de prueba autorizada, sin integrar fallos en main; registrar CI fallido para cada check obligatorio y continuidad del job independiente.
- [ ] 3.4 Realizar QA de infraestructura con revisión manual de jobs, logs y aislamiento; confirmar que no se necesitan secretos reales ni tráfico Cloudinary y que no hubo cambios funcionales, de dependencias, E2E o sdd-check.ps1. Ejecutar git diff --check y validación strict del change.

## 4. Documentación y seguimiento

- [x] 4.1 Actualizar SDD-WORKFLOW y SDD-PROGRESS con el CI implementado, versión PostgreSQL aprobada, evidencia y pendientes reales; verificar coherencia con spec y ejecuciones sin declarar QA no realizado.
- [ ] 4.2 Cuando exista work item identificado y autorización explícita, actualizar Jira con alcance y evidencia final antes del cierre definitivo; verificar confirmación externa y no marcar completada por una actualización local. No se actualiza Jira en esta fase SPEC.

## Evidencia de implementación local — 2026-09-17

- Contrato aprobado mediante instrucción explícita del developer en modo IMPLEMENT, con Node 24.x y postgres:18.
- Workflow validado con actionlint, sin ShellCheck instalado; jobs independientes y sin tolerancia de errores. SHA de checkout v6.0.2 y setup-node v6.3.0 contrastados con sus tags oficiales.
- Copia temporal de backend/frontend versionados, sin .env ni node_modules previos: npm ci aprobado en ambos, con Node 24.14.0. Lockfiles del repositorio intactos.
- Instancia temporal PostgreSQL 18.3 en Windows, puerto 55439: base vacía, unaccent, cinco migraciones y seed aprobados; autenticación del admin y categoría activa verificadas por la suite. Backend: 2 suites, 61/61 tests. Frontend: lint y build aprobados.
- Variables ficticias del workflow; la prueba local solo adapta DATABASE_URL al puerto aislado. Se conservan el mock de upload y el borrado con public_id NULL; no se usan credenciales reales de Cloudinary.
- Docker no tenía motor activo: no se ejecutó la imagen postgres:18 ni el runner Ubuntu. Por eso 3.1 permanece pendiente de validación Linux. También quedan pendientes disparos remotos, fallos controlados, QA de Actions y Jira. No hubo commit ni push.
