# Reglas de trabajo para Codex

## Fuente de verdad

1. Repositorio Git local / GitHub: fuente técnica definitiva.
2. `docs/sdd`: fuente documental del proyecto.
3. OpenSpec: contrato de cada cambio.
4. Jira: gestión de work items y trazabilidad.
5. Conversaciones ChatGPT: solo contexto auxiliar.

- GitHub es la única fuente remota oficial.
- El repositorio local puede estar adelantado respecto a GitHub mientras existen commits pendientes de push.
- Antes de asumir el estado remoto se debe comprobar ahead/behind. Las referencias remotas locales pueden estar desactualizadas; `git fetch origin` permite actualizarlas manualmente antes de comparar.
- ChatGPT no debe asumir que un cambio local existe en GitHub hasta que se confirme el push.
- `docs/sdd/SDD-PROGRESS.md` define el estado actual y registra el historial real.
- `docs/sdd/MVP-V1-FINAL-SPEC.md` define el alcance del MVP.
- No asumir decisiones provenientes solamente de conversaciones de ChatGPT. Usarlas como contexto auxiliar y contrastarlas con el repositorio; registrar las nuevas decisiones aprobadas en los documentos pertinentes.

## Orden de lectura antes de trabajar

1. `AGENTS.md`.
2. `docs/sdd/SDD-PROGRESS.md`.
3. `docs/sdd/MVP-V1-FINAL-SPEC.md`.
4. OpenSpec activo, si existe: proposal, design, specs y tasks.
5. Código relacionado con la tarea.

Comprobar también `git status`, la rama actual, el último commit, origin, el upstream y ahead/behind respecto de `origin/main`. Informar el Current State antes de proponer cambios, aclarando si las referencias remotas se actualizaron. Consultar `docs/sdd/SDD-WORKFLOW.md` y usar `docs/sdd/SDD-SESSION-CHECKLIST.md` para el seguimiento de la sesión.

## Workflow obligatorio

Requirement → Current State → Gap Analysis → OpenSpec → Review → Implementation → Automated Tests → Manual QA → SDD/Jira update → Commit → OpenSpec archive → Archive commit → Push

OpenSpec debe aprobarse antes de implementar. La validación de la CLI comprueba la estructura; no sustituye la revisión y aprobación del contrato. Identificar el work item de Jira y documentar criterios de aceptación y alcance antes de implementar.

Cada paso se ejecuta dentro de la autorización de la tarea. Este flujo no autoriza por sí solo actualizaciones de Jira, commits, archive o push. Si una etapa no aplica, documentar el motivo; no marcarla como ejecutada.

## Modos de trabajo

El trabajo se organiza en dos niveles. Si el developer indica **LIGHT** o **FULL**, respetar ese nivel. Si no indica modo, usar **LIGHT** solo cuando el riesgo sea claramente bajo; ante duda sobre seguridad, datos, contratos, arquitectura o regresiones, usar **FULL**. No convertir LIGHT en FULL sin explicar el motivo.

Ningún nivel autoriza automáticamente commit o push. Las transiciones y operaciones de cierre requieren instrucción o aprobación explícita del developer.

### LIGHT

- Para cambios pequeños, localizados y de bajo riesgo.
- Requiere análisis breve, implementación y solo las validaciones aplicables.
- No requiere OpenSpec salvo que aparezca un riesgo o cambio de contrato.
- Mantiene el control de scope, la protección de untracked y la revisión antes de commit.
- Commit y push siguen requiriendo autorización explícita.

### FULL

- Para cambios de API, base de datos, seguridad, arquitectura, integraciones externas, features relevantes o riesgo importante de regresión.
- Mantiene el flujo `ANALYZE → SPEC → IMPLEMENT → QA → COMMIT → ARCHIVE → PUSH`.
- Cada etapa requiere la instrucción o aprobación correspondiente; completar una etapa no autoriza la siguiente.

Los modos detallados `ANALYZE`, `SPEC`, `IMPLEMENT`, `COMMIT`, `ARCHIVE` y `PUSH` se usan dentro de FULL o cuando el developer los solicite explícitamente. Las reglas específicas de cada uno están debajo.

Las conversaciones ChatGPT siguen siendo contexto auxiliar; el repositorio Git/GitHub, `docs/sdd`, OpenSpec y Jira continúan siendo las fuentes formales según sus responsabilidades.

### ANALYZE

- Solo lectura y análisis: puede inspeccionar documentación, código, Git y OpenSpec.
- No puede modificar archivos, crear commits ni hacer push.
- Debe informar Current State, Gap Analysis, riesgos y archivos probablemente afectados.
- No ejecutar automáticamente comandos con efectos de escritura, como fetch o el chequeo integral `sdd-check.ps1`, bajo la autorización de solo lectura.

### SPEC

- Puede crear o modificar únicamente documentación de especificación/OpenSpec relacionada con el cambio.
- No puede implementar código de aplicación.
- No puede hacer commit ni push salvo autorización explícita para la operación correspondiente.
- Debe detenerse para revisión/aprobación antes de pasar a implementación.

### IMPLEMENT

- Puede modificar únicamente los archivos necesarios para cumplir el OpenSpec aprobado.
- Puede ejecutar tests, lint, build y validaciones.
- No puede ampliar scope, hacer commit ni push.
- Debe detenerse después de implementación y verificación para QA/revisión.

### COMMIT

- Solo puede ejecutarse con autorización explícita.
- Debe revisar `git diff`, `git diff --check` y staging antes de crear el commit.
- Debe incluir únicamente archivos aprobados para ese commit.
- No implica push automático.

### ARCHIVE

- Solo puede ejecutarse con autorización explícita.
- Archiva el OpenSpec aprobado y completado, con la sincronización de specs correspondiente.
- Debe revisar los archivos generados por el archive.
- El commit de archive debe permanecer separado del commit funcional y requiere autorización de COMMIT; archivar no autoriza commitear.

### PUSH

- Solo puede ejecutarse con autorización explícita.
- Debe confirmar rama, upstream y ahead/behind antes del push, indicando la vigencia de las referencias remotas.
- Después del push debe verificar sincronización con origin.

### Ejemplos mínimos

```text
SL-40. Modo ANALYZE.
SL-40. Modo SPEC.
SL-40. Modo IMPLEMENT.
SL-40. Modo COMMIT.
SL-40. Modo ARCHIVE.
SL-40. Modo PUSH.
```

Cada ejemplo representa una instrucción independiente del developer, no una secuencia automática. El modo no sustituye la identificación del cambio ni la aprobación de los archivos y del alcance correspondientes.

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
