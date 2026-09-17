# Reglas de trabajo para Codex

## Fuente de verdad

- El repositorio Git es la fuente técnica definitiva.
- `docs/sdd` es la fuente documental del proyecto.
- OpenSpec define el contrato de cada cambio.
- `docs/sdd/SDD-PROGRESS.md` define el estado actual y registra el historial real.
- `docs/sdd/MVP-V1-FINAL-SPEC.md` define el alcance del MVP.
- Jira gestiona los work items y su trazabilidad.
- Drive es un espejo documental; no reemplaza al repositorio.
- No asumir decisiones provenientes solamente de conversaciones de ChatGPT. Usarlas como contexto auxiliar y contrastarlas con el repositorio; registrar las nuevas decisiones aprobadas en los documentos pertinentes.

## Orden de lectura antes de trabajar

1. `AGENTS.md`.
2. `docs/sdd/SDD-PROGRESS.md`.
3. `docs/sdd/MVP-V1-FINAL-SPEC.md`.
4. OpenSpec activo, si existe: proposal, design, specs y tasks.
5. Código relacionado con la tarea.

Comprobar también `git status`, la rama actual y el último commit. Informar el Current State antes de proponer cambios. Consultar `docs/sdd/SDD-WORKFLOW.md` y usar `docs/sdd/SDD-SESSION-CHECKLIST.md` para el seguimiento de la sesión.

## Workflow obligatorio

Requirement → Current State → Gap Analysis → OpenSpec → Review → Implementation → Automated Tests → Manual QA → SDD/Jira update → Commit → OpenSpec archive → Archive commit → Push

OpenSpec debe aprobarse antes de implementar. La validación de la CLI comprueba la estructura; no sustituye la revisión y aprobación del contrato. Identificar el work item de Jira y documentar criterios de aceptación y alcance antes de implementar.

Cada paso se ejecuta dentro de la autorización de la tarea. Este flujo no autoriza por sí solo actualizaciones de Jira, commits, archive o push. Si una etapa no aplica, documentar el motivo; no marcarla como ejecutada.

## Reglas

- No ampliar scope sin autorización.
- No hacer refactors no relacionados.
- No crear features durante un bugfix.
- No hacer commit antes de QA cuando el cambio requiere QA manual.
- Reportar archivos modificados, pruebas realizadas, resultados y controles pendientes. Distinguir pruebas ejecutadas de aprobaciones informadas por el developer.
- Si documentación y código divergen, informar la discrepancia antes de asumir cuál es correcto. El código evidencia el comportamiento actual; el contrato aprobado define el esperado.
- Nunca modificar o borrar archivos untracked sin autorización. Preservar también cambios locales ajenos a la tarea y excluirlos de los commits.
- Revisar el diff y ejecutar `git diff --check` antes del commit.
- Separar el commit funcional del commit que registra el archive y la sincronización de specs. Revisar los archivos generados por el archive antes de incluirlos.
- No declarar Jira actualizado, QA aprobado, commit, archive o push sin evidencia de ejecución o confirmación explícita del responsable.
