# SDD Session Checklist

Usar en cada sesión. Marcar solo hechos verificados; indicar “No aplica” con motivo cuando corresponda. Commit, archive, Jira y push requieren autorización disponible.

## Inicio

- [ ] git fetch origin ejecutado manualmente
- [ ] Branch correcta
- [ ] Ahead/behind revisado
- [ ] git status revisado
- [ ] SDD-PROGRESS leído
- [ ] MVP spec leída
- [ ] OpenSpec activo identificado
- [ ] Jira identificado

## Durante

- [ ] Scope definido
- [ ] Gap Analysis realizado
- [ ] OpenSpec aprobado
- [ ] Implementación limitada al scope
- [ ] Tests ejecutados

## Cierre

- [ ] QA aprobada
- [ ] SDD actualizado
- [ ] Jira actualizado
- [ ] Commit funcional
- [ ] OpenSpec archive
- [ ] Commit archive
- [ ] Push
- [ ] Local sincronizado con GitHub
- [ ] Git status limpio

Si quedan archivos conocidos/intencionales, registrarlos como excepción explícita al estado limpio y preservarlos. No modificar ni borrar untracked sin autorización.

El script no ejecuta fetch. Si no se actualizan las referencias remotas, dejar ese control pendiente e informar que ahead/behind puede estar desactualizado; no afirmar sincronización con GitHub.
