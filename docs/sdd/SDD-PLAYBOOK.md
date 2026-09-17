# SDD Playbook

Método reusable para desarrollar proyectos con VS Code, Git, GitHub, ChatGPT, Codex, Spec-Driven Development (SDD), OpenSpec, Jira, tests automáticos y QA manual.

Aplica tanto a proyectos nuevos como a repositorios avanzados. Este documento explica el método; [SDD-WORKFLOW.md](SDD-WORKFLOW.md) define el flujo operativo y [SDD-SESSION-CHECKLIST.md](SDD-SESSION-CHECKLIST.md) ofrece la checklist de sesión. Adaptar nombres, rutas y comandos al reutilizarlo; no copiar estados, tickets o aprobaciones del proyecto de origen.

## Principios

- GitHub es la única fuente remota oficial.
- El repositorio Git local es la fuente técnica: código, historial, configuración y pruebas.
- `docs/sdd` es la fuente documental. La spec principal define el alcance; SDD-PROGRESS registra el estado real y la evidencia.
- OpenSpec define contratos de cambios: propuesta, diseño, requisitos y tareas.
- Jira gestiona trabajo, prioridades y trazabilidad.
- Las conversaciones ChatGPT son contexto auxiliar; las decisiones aprobadas deben quedar registradas en el repositorio.
- Distinguir comportamiento implementado de comportamiento esperado. Si código y documentación divergen, informar antes de decidir cuál debe corregirse.
- Un commit local no existe necesariamente en GitHub. Comprobar origin, upstream y ahead/behind; confirmar el push antes de afirmar publicación.
- No declarar validaciones o aprobaciones sin evidencia. Una etapa no aplicable se justifica, no se presenta como ejecutada.

## Roles

| Rol | Responsabilidad |
| --- | --- |
| ChatGPT | Analizar requisitos, explorar arquitectura, revisar specs, controlar alcance y preparar prompts concretos para Codex. Debe identificar qué versión del repositorio sustenta su análisis. |
| Codex | Inspeccionar el repositorio, comunicar Current State, implementar lo aprobado, ejecutar verificaciones, revisar diffs y actualizar documentación solicitada. |
| Developer | Trabajar en VS Code, configurar el entorno local, revisar código, resolver decisiones de producto, realizar QA manual y aprobar funcionalidad y operaciones de cierre. |
| GitHub | Conservar la versión remota oficial y la evidencia publicada; admitir revisión mediante pull requests cuando corresponda al proyecto. |
| OpenSpec | Expresar el contrato verificable de cada cambio y mantener las specs principales mediante sincronización y archive. |
| Jira | Identificar el work item, sus criterios, estado, evidencia y deuda relacionada. |

Git registra cambios y versiones. Ninguna herramienta sustituye la aprobación del responsable. Este playbook no autoriza automáticamente actualizaciones de Jira, commits, archive o push: ejecutar cada acción dentro de la autorización disponible.

## Proyecto nuevo

1. **Idea:** describir el problema, usuarios, valor esperado y un recorrido principal. Separar necesidades de soluciones posibles.
2. **Alcance inicial:** definir MVP, exclusiones, restricciones y criterios de éxito. Seleccionar una primera feature pequeña que atraviese el flujo completo.
3. **Repositorio:** crear o clonar el repo, abrirlo en VS Code y configurar Git, origin en GitHub, rama de trabajo y upstream. Registrar convenciones de ramas y revisión.
4. **Documentación mínima:** preparar `AGENTS.MD`, una spec principal, `docs/sdd/SDD-PROGRESS.md`, un README y el workflow/checklist. La spec debe incluir requisitos, criterios de aceptación, alcance y DoD; el progreso debe indicar que todavía no hay implementación, si ese es el estado real.
5. **Decisiones iniciales:** documentar arquitectura mínima, datos, integraciones y configuración necesaria. Mantener secretos fuera de Git y ejemplos de entorno sin credenciales.
6. **Base de desarrollo:** definir y aprobar el alcance del setup técnico; preparar OpenSpec cuando corresponda antes de implementarlo. Establecer comandos reproducibles de tests, lint y build, según la tecnología elegida.
7. **Primer work item:** registrar en Jira la primera feature, con alcance, exclusiones y criterios observables, cuando esté autorizado.
8. **Primer contrato:** preparar proposal, design, specs y tasks en OpenSpec. Revisar coherencia, validar estructura y obtener aprobación antes de implementar.
9. **Primera feature:** seguir el workflow de feature de este documento, incluyendo tests y QA. Registrar resultados, no solo comandos.
10. **Primera entrega:** completar documentación y Jira, revisar y commitear el cambio, archivar/sincronizar OpenSpec, registrar el archive por separado y publicar mediante push autorizado.

Un repositorio sin commits, sin upstream o sin scripts técnicos aún no puede aprobar todos los controles automatizados. Registrar esas condiciones como trabajo de setup; no simular una validación verde ni instalar dependencias automáticamente desde los scripts de chequeo.

## Proyecto existente

1. **Repo inspection:** revisar rama, origin, upstream, commits, working tree, estructura, scripts, configuración y OpenSpec activo. Preservar cambios locales y archivos untracked.
2. **Current State:** describir qué funciona hoy, qué pruebas existen, qué fallan y qué no pudo comprobarse. Citar archivos, tests o registros de QA; no reconstruir decisiones a partir de recuerdos de conversaciones.
3. **Gap Analysis:** comparar estado actual con requisitos. Clasificar cada punto como cumplido, falta validar, falta implementar o deuda propuesta. Diferenciar fallo previo de regresión introducida.
4. **Documentación mínima:** crear solo lo que falta y reconciliar inconsistencias con autorización. Incluir alcance, arquitectura vigente, instrucciones locales, DoD y SDD-PROGRESS. No reescribir todo ni declarar terminados los controles sin evidencia.
5. **Identificar deuda:** registrar limitación, impacto, riesgo, evidencia y propuesta de tratamiento. No convertir automáticamente una obligación del MVP en deuda futura.
6. **Priorizar:** resolver primero bloqueantes de funcionamiento, seguridad e integridad; luego requisitos comprometidos y validaciones pendientes. Separar mejoras opcionales.
7. **Continuar con OpenSpec:** seleccionar un gap acotado, identificar Jira y preparar o revisar el contrato. No recrear changes existentes ni alterar archivos archivados como si fueran trabajo activo.
8. **Entregar incrementalmente:** ejecutar el workflow por cambio, conservar comportamiento fuera de alcance y actualizar el estado con evidencia después de cada entrega.

## Workflow de una feature

Requirement → Current State → Gap → Jira → OpenSpec → Review → Implementation → Tests → QA → Docs → Jira Done → Commit → Archive → Archive commit → Push

| Etapa | Resultado esperado |
| --- | --- |
| Requirement | Necesidad y alcance definidos, con exclusiones. |
| Current State / Gap | Evidencia del estado actual y diferencia respecto de lo esperado. |
| Jira | Work item identificado, criterios y prioridad coherentes con el cambio. |
| OpenSpec | Proposal, design, specs y tasks consistentes y verificables. |
| Review | Contrato revisado y aprobado. La validación strict de OpenSpec no equivale a aprobación funcional. |
| Implementation | Cambios mínimos dentro del alcance aprobado. |
| Tests | Verificaciones automatizadas pertinentes y regresión aprobadas; comandos y resultados registrados. |
| QA | Recorridos y casos de error verificados, con aprobación manual cuando aplique. |
| Docs / Jira Done | Estado y evidencia actualizados. Jira Done acredita aceptación del trabajo; commit, archive y push todavía se registran por separado. |
| Commit | Diff revisado, `git diff --check` aprobado y staging limitado a archivos autorizados. |
| Archive | Tareas completas, specs sincronizadas y validadas, change trasladado a archive. |
| Archive commit | Revisión y commit separado de los cambios producidos por el archive. |
| Push | Publicación autorizada y comprobación del estado local/remoto. |

Si un paso falla, informar y resolver o registrar el bloqueo; no marcar los siguientes como completos por anticipado. No hacer commit antes del QA manual requerido. En proyectos con ramas protegidas, adaptar la publicación al proceso de pull request y revisión sin omitir controles.

## Inicio de sesión

Leer primero el contexto indicado más abajo. Desde la raíz, elegir la consulta adecuada:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sdd-status.ps1
```

Este comando consulta el estado local, origin, upstream, ahead/behind, commits, cambios, OpenSpec activos y documentos. No ejecuta fetch. Sus referencias remotas pueden estar desactualizadas; un resultado 0/0 no prueba por sí solo el estado actual de GitHub.

Para una verificación integral, con entorno de pruebas preparado y autorización para sus efectos:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sdd-check.ps1
```

Este comando ejecuta fetch, consulta Git, llama a sdd-status, verifica documentos, valida changes activos y ejecuta tests, lint, build y diff check. No es estrictamente libre de escrituras: fetch actualiza referencias, tests pueden usar fixtures y build produce archivos de salida. No usar una base con datos sensibles sin revisar antes cómo trabajan los tests.

Antes de proponer cambios, comunicar rama, commit, diferencias local/remoto, cambios existentes, change/Jira relevante y Current State. No ejecutar chequeos con efectos únicamente por costumbre si la tarea se limita a lectura documental.

## Cierre de sesión

- [ ] Alcance y archivos modificados revisados; sin cambios ajenos incluidos.
- [ ] Tests pertinentes ejecutados y resultados/fallos registrados.
- [ ] QA manual aprobado si aplica, identificando responsable y versión evaluada.
- [ ] SDD-PROGRESS actualizado con hechos, decisiones y pendientes.
- [ ] Jira refleja el estado real; si falta acceso o confirmación, queda pendiente.
- [ ] Tareas OpenSpec coherentes con la evidencia; solo completar las realmente terminadas.
- [ ] Diff y staging verificados antes del commit autorizado.
- [ ] Commit funcional registrado cuando el cambio está listo.
- [ ] OpenSpec archivado y specs validadas cuando corresponde al cierre del cambio.
- [ ] Archive commit revisado y registrado por separado.
- [ ] Push confirmado y ahead/behind comprobado con referencias actualizadas.
- [ ] Working tree limpio salvo archivos conocidos/intencionales, listados en el reporte.

Cerrar una sesión no obliga a cerrar una feature incompleta. En ese caso, dejar un punto de continuación con evidencia y pendientes, sin forzar Done, commit o archive. Nunca limpiar untracked para obtener un estado CLEAN.

## Definition of Done

| Concepto | Pregunta que responde | Ejemplo |
| --- | --- | --- |
| Requirement | ¿Qué necesidad debe satisfacer el sistema? | Un administrador puede consultar imágenes de un producto activo no publicado. |
| Acceptance Criteria | ¿Qué resultados observables prueban ese requisito? | Admin recibe la colección; sin token recibe 401; no-admin recibe 403; el público sigue recibiendo 404 para el producto no publicado. |
| Definition of Done (DoD) | ¿Qué condiciones permiten considerar terminada la feature o versión? | Criterios cumplidos, pruebas y QA aprobadas, documentación y trazabilidad actualizadas, entrega versionada y publicada según el proceso acordado. |

La DoD debe indicar su nivel: cambio o versión completa. Cumplir una feature no demuestra que todos los flujos del MVP estén validados. Un test verde solo acredita lo que cubre; ni el número de tests ni un porcentaje estimado sustituyen la evidencia de cada criterio.

Registrar por punto: estado, evidencia, fecha/commit y pendiente. Distinguir “implementado sin validar” de “validado”. Una excepción a la DoD necesita aceptación explícita y trazabilidad; no se convierte en cumplimiento por cambiar una casilla.

## Manejo de contexto

Nunca depender de conversaciones anteriores para reconstruir el estado. Antes de trabajar leer, en orden:

1. `AGENTS.MD` en la raíz; conservar el nombre y capitalización establecidos por el repositorio.
2. `docs/sdd/SDD-PROGRESS.md`.
3. Spec principal: en este proyecto, `docs/sdd/MVP-V1-FINAL-SPEC.md`.
4. OpenSpec activo relacionado: proposal, design, specs y tasks.
5. Código y tests relacionados con la tarea.

Si falta una fuente, informarlo. Si hay discrepancias, distinguir implementación actual de contrato aprobado antes de corregir. Las nuevas decisiones del developer pueden orientar el trabajo, pero deben documentarse cuando corresponda para que sobrevivan al cambio de sesión.

Un traspaso de sesión debe incluir requisito/Jira/change, rama y commit, archivos pendientes, verificación realizada, bloqueos y próximo paso. No incluir secretos. ChatGPT debe reconocer si su copia del código es anterior a los commits locales aún no publicados.

## Automatización

| Script existente | Qué hace | Límites |
| --- | --- | --- |
| `scripts/sdd-status.ps1` | Muestra rama, origin, upstream, ahead/behind, último commit local/remoto, status, cambios SDD/OpenSpec, changes activos y existencia de documentos básicos. | Solo consulta local; sin fetch, pull, push ni tests. No valida la aprobación de un change. |
| `scripts/sdd-check.ps1` | Ejecuta fetch; estado Git; sdd-status; verifica cinco documentos; valida cada change activo con strict; ejecuta backend tests y frontend lint/build si existen sus package.json; revisa diff y resume. | Continúa ante errores. No instala dependencias, no hace commit/push ni limpia archivos. No reemplaza QA manual. |

En la implementación actual, sdd-check devuelve código 0 si las validaciones obligatorias pasan. Git sync exige ahead/behind 0/0; commits locales pendientes pueden causar ERROR aunque los tests pasen. Working tree DIRTY es informativo y no causa por sí solo código 1. OpenSpec informa N/A si no hay changes activos. Si no existe el package.json de una capa, su control se omite y se informa; un OK por omisión no acredita pruebas ejecutadas.

Para extender o reutilizar los scripts:

1. Revisar primero los comandos reales del nuevo repositorio, tecnologías, rama base y documentos requeridos.
2. Adaptar rutas y validaciones; no asumir Node.js, backend/frontend ni `origin/main` en todos los proyectos.
3. Declarar cada control como obligatorio, condicional o informativo, con resultado y código de salida definidos.
4. Aislar fallos para continuar el resto y distinguir herramienta ausente de verificación aprobada.
5. Documentar efectos de red, base de datos y archivos generados. No agregar instalación, limpieza, migraciones, commits o push automáticos como efectos ocultos.
6. Verificar tanto el camino exitoso como un fallo controlado, sin afectar datos de producción ni archivos ajenos.
7. Actualizar la guía y mantener autorización explícita para nuevos efectos.

Los scripts actuales usan PowerShell, Git, Node/npm para las capas presentes y OpenSpec CLI cuando hay changes activos. No instalan esas herramientas. La adopción de CI en GitHub debe reutilizar verificaciones equivalentes y agregarse como trabajo aprobado, no suponerse existente.

## Deuda técnica

Registrar cada deuda con descripción, evidencia, impacto, riesgo de postergarla, solución provisional, responsable, prioridad, versión objetivo y criterio de resolución. Vincular Jira con SDD-PROGRESS y con la spec afectada cuando corresponda.

Separar defecto, falta de validación y mejora opcional. Una feature prometida, un riesgo de integridad o un bloqueo de seguridad no pasa a MVP v2 solo porque resolverlo sea costoso. La postergación debe ser aprobada y reflejar cualquier cambio del contrato o de la DoD.

Ejemplo de registro reusable:

```text
Deuda / Jira:
Evidencia y comportamiento actual:
Impacto y riesgo aceptado:
Medida provisional:
Responsable y aprobacion:
Prioridad / version objetivo:
Criterio de resolucion:
```

Revisar deudas al planificar una versión y al cerrar el MVP. No implementar mejoras futuras dentro de un change cerrado ni mantenerlas como acuerdos exclusivos de una conversación.

## Regla de scope

No agregar features no aprobadas durante un change. No introducir refactors ajenos ni convertir un bugfix en un rediseño.

Ante un hallazgo nuevo: describirlo con evidencia, evaluar si bloquea los criterios del cambio y proponer su tratamiento. Si amplía el alcance, obtener autorización y actualizar el contrato antes de implementar; si es independiente, registrarlo como propuesta separada. No crear automáticamente Jira u OpenSpec sin autorización.

Conservar cambios preexistentes. Nunca modificar, borrar ni incluir archivos untracked ajenos sin autorización. Revisar staging por rutas concretas; un working tree sucio no autoriza a limpiar trabajo del developer.

## Plantilla rápida para futuros proyectos

Copiar y adaptar esta checklist al nuevo repositorio:

- [ ] Problema, usuarios, MVP y exclusiones definidos.
- [ ] Repo abierto en VS Code; GitHub/origin, rama y upstream configurados.
- [ ] `AGENTS.MD` creado con fuentes de verdad, alcance y reglas de autorización.
- [ ] `docs/sdd` contiene spec principal, DoD y SDD-PROGRESS.
- [ ] README explica setup, configuración sin secretos y comandos locales.
- [ ] Workflow y checklist adaptados; scripts de status/check revisados para la tecnología real.
- [ ] Current State y Gap Analysis registrados con evidencia.
- [ ] Deudas clasificadas y postergaciones aprobadas.
- [ ] Primer Jira identificado; OpenSpec propuesto, validado y aprobado.
- [ ] Implementación limitada al contrato.
- [ ] Tests y QA aprobados; resultados ligados a una versión.
- [ ] Docs y Jira actualizados con estado real.
- [ ] Diff/staging revisados; commit funcional autorizado.
- [ ] OpenSpec sincronizado/archivado; archive commit separado.
- [ ] Push confirmado; ahead/behind y working tree revisados.
- [ ] Pendientes y archivos intencionales documentados para la siguiente sesión.
