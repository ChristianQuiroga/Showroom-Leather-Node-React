# SDD Workflow

Este flujo organiza cambios verificables y reutilizables mediante Spec-Driven Development. Al adoptarlo en otro proyecto, ajustar las rutas de documentación, la spec principal y los comandos de verificación a ese repositorio.

## Roles

| Rol / herramienta | Responsabilidad |
| --- | --- |
| ChatGPT | Análisis, planificación, revisión de specs, arquitectura, control de alcance y generación de prompts para Codex. |
| Codex | Inspección del repositorio, implementación, ejecución de tests, validación de diffs y actualización documental solicitada. |
| VS Code / Developer | Ejecución local, revisión de código, QA manual y aprobación funcional. |
| OpenSpec | Contrato de cambio: propuesta, diseño, specs y tareas. |
| SDD-PROGRESS | Historial y estado real del proyecto, con evidencia y pendientes. |
| Jira | Gestión y trazabilidad de work items. |
| Git / GitHub | Evidencia técnica y versionado; GitHub es la única fuente remota oficial. |

## Arquitectura objetivo

```text
Developer / VS Code
        |
        v
Local Git repository
        |
        v
      GitHub
      |    |
      v    v
 ChatGPT  Codex
```

`docs/sdd` permanece como documentación fuente dentro del repositorio, OpenSpec como contrato de cambios y Jira como gestión. ChatGPT y Codex deben distinguir el contenido publicado en GitHub de los cambios y commits locales pendientes de push.

## Flujo estándar

Requirement → Repo inspection → Gap Analysis → Jira → OpenSpec proposal/design/spec/tasks → Review → Implementation → Automated verification → Manual QA → Documentation → Jira Done → Functional commit → OpenSpec archive → Archive commit → Push

1. Definir el requisito, inspeccionar el repositorio y comunicar el Current State. Comparar el comportamiento actual con el esperado para identificar el gap.
2. Identificar o crear el work item de Jira cuando esté autorizado. Preparar OpenSpec con alcance, exclusiones y criterios de aceptación verificables.
3. Revisar y aprobar el contrato antes de implementar. La validación OpenSpec no reemplaza la aprobación funcional del developer.
4. Implementar solo lo aprobado. No introducir features en bugfixes ni refactors ajenos. Si aparece alcance adicional, informarlo y obtener autorización antes de incorporarlo.
5. Ejecutar las verificaciones automatizadas pertinentes y registrar resultados. Realizar QA manual cuando aplique, con aprobación del developer antes del commit funcional.
6. Actualizar la documentación y SDD-PROGRESS con hechos comprobados. Actualizar Jira y moverlo a Done cuando se cumplan los criterios; no inferir una actualización externa a partir de un archivo local.
7. Revisar el diff, excluir archivos ajenos y ejecutar `git diff --check`. Crear el commit funcional autorizado.
8. Archivar OpenSpec y sincronizar las specs principales correspondientes. Revisar y validar los cambios generados; registrarlos en un commit de archive separado, cuando esté autorizado.
9. Hacer push cuando esté autorizado y revisar el estado final de la rama y del working tree.

El workflow indica el orden; no concede autorización automática para acciones externas, commits, archive o push. Una etapa no aplicable debe registrarse con su justificación, sin declararla ejecutada. Para cambios exclusivamente documentales, la verificación debe corresponder al contenido y a los scripts afectados; no inventar resultados de tests o QA funcional.

## Regla de fuente de verdad

Prioridad de consulta:

1. Repositorio Git local / GitHub: evidencia técnica definitiva del comportamiento implementado.
2. `docs/sdd`: documentación del proyecto; SDD-PROGRESS registra el estado y MVP-V1-FINAL-SPEC define el alcance del MVP.
3. OpenSpec: contrato aprobado de cada cambio.
4. Jira: gestión y trazabilidad del trabajo.
5. Conversaciones ChatGPT: solo contexto auxiliar.

La prioridad no convierte un comportamiento incorrecto del código en una decisión aprobada. Si el código, las specs y la documentación divergen, informar la diferencia entre estado actual y esperado antes de decidir una corrección. No asumir decisiones provenientes solamente de conversaciones de ChatGPT.

GitHub es la única fuente remota oficial. El repositorio local puede estar adelantado mientras existen commits pendientes de push. ChatGPT no debe asumir que un cambio local existe en GitHub hasta que se confirme el push.

## Estado local vs remoto

Antes de iniciar una tarea comprobar:

- Branch actual.
- Working tree, incluidos archivos untracked.
- Último commit local.
- Remote `origin` configurado y su URL.
- Upstream configurado y ahead/behind respecto de ese upstream.
- Ahead/behind respecto de `origin/main`; si no existe esa referencia, informar que no se puede calcular.
- OpenSpec activos, excluyendo `archive`.

Ahead indica commits locales ausentes en la referencia comparada; behind indica commits de esa referencia ausentes localmente. Ambos pueden ser mayores que cero si las historias divergen. Un working tree con cambios puede coexistir con ahead/behind en cero.

Estos valores usan las referencias remotas guardadas localmente y no garantizan el estado actual de GitHub. Para actualizar esas referencias primero puede ejecutarse manualmente:

```powershell
git fetch origin
```

Después, volver a comprobar ahead/behind. Si no se ejecutó fetch, reportar esa limitación y no afirmar sincronización actual con GitHub. El script no ejecuta fetch, pull ni push y no modifica archivos. Una rama sin upstream o con una referencia no disponible se informa como no calculable, no como sincronizada.

## Inicio de una sesión nueva

Antes de trabajar:

- Leer `AGENTS.md`.
- Leer `docs/sdd/SDD-PROGRESS.md`.
- Leer `docs/sdd/MVP-V1-FINAL-SPEC.md`.
- Buscar OpenSpec activo en `openspec/changes`, excluyendo `archive`, y leer sus artefactos si existe.
- Comprobar `git status` e identificar cambios locales y archivos untracked.
- Comprobar la branch actual.
- Identificar el último commit.
- Revisar origin, upstream y ahead/behind según la sección Estado local vs remoto.
- Identificar el work item de Jira y la autorización disponible.
- Leer el código relacionado e informar Current State antes de proponer cambios.

El script de consulta se ejecuta desde la raíz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sdd-status.ps1
```

Solo usa PowerShell y el Git ya instalado para trabajar con el repositorio. No requiere módulos, paquetes ni la CLI de OpenSpec. Es de solo lectura y no consulta Jira ni realiza operaciones de red. Enumera como activos los directorios inmediatos de `openspec/changes` distintos de `archive`; no evalúa la aprobación ni la completitud de sus tareas.

## Cierre de una tarea

- [ ] OpenSpec aprobado.
- [ ] Implementación dentro del scope.
- [ ] Tests verdes y resultados registrados.
- [ ] QA manual aprobado si aplica.
- [ ] Jira actualizado.
- [ ] SDD-PROGRESS actualizado.
- [ ] Commit funcional creado y revisado.
- [ ] OpenSpec archivado y specs sincronizadas y validadas.
- [ ] Commit archive creado y revisado.
- [ ] Push realizado con autorización.
- [ ] Local sincronizado con GitHub, con referencias remotas actualizadas y ahead/behind comprobado.
- [ ] Working tree limpio salvo archivos conocidos/intencionales, identificados en el reporte.

Reportar archivos modificados, pruebas realizadas, commits y pendientes. Nunca modificar o borrar archivos untracked sin autorización ni incluir archivos no relacionados. La checklist de sesión está en `SDD-SESSION-CHECKLIST.md`.
