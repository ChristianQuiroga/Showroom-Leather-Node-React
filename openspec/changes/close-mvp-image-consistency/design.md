## Context

El flujo actual separa PostgreSQL y Cloudinary. El upload ya intenta compensar un INSERT fallido, mientras que delete elimina primero el asset remoto. El repositorio usa transacciones para crear, eliminar y cambiar la imagen principal, y conserva un índice único parcial para impedir más de una principal. El frontend recarga la lista después de cada mutación, pero el helper de recarga absorbe sus errores y los controles de set-main/delete no bloquean clicks repetidos.

## Goals / Non-Goals

### Goals

- Mantener el upload sin filas inválidas y hacer observable el resultado de la compensación.
- Priorizar la consistencia de PostgreSQL en delete y dejar el fallo remoto como incidencia reconciliable.
- Hacer que setAsMain sea atómico aun cuando la imagen desaparezca durante la operación.
- Evitar mensajes de éxito engañosos y mutaciones duplicadas en el gestor.
- Cubrir los escenarios parciales con tests backend y validaciones frontend aplicables.

### Non-Goals

- No agregar outbox, jobs, retry persistente ni reconciliación automática.
- No cambiar de proveedor, esquema, dependencias o arquitectura general.
- No agregar infraestructura frontend de testing salvo necesidad estricta demostrada.

## Decisions

1. **Upload compensatorio best-effort.** Se conserva el orden upload remoto → INSERT local y el cleanup existente. Si el cleanup falla, se registra contexto suficiente (`public_id`, error de persistencia y error remoto) y se acepta el riesgo residual de asset huérfano para MVP.
2. **Delete PostgreSQL-first.** La transacción local elimina/reasigna primero y hace commit. Solo después se ejecuta destroy en Cloudinary. Si el destroy falla, se devuelve HTTP 502 y se registra el asset para reconciliación manual; no se reinsertan filas.
3. **Principal transaccional.** El repositorio mantiene el índice único parcial y exige que `UPDATE ... RETURNING` devuelva la imagen objetivo. La ausencia de filas provoca rollback y error de recurso no encontrado.
4. **Frontend explícito.** Las mutaciones mantienen estado pendiente y deshabilitan el control correspondiente. La recarga debe propagar su resultado: si falla después de una mutación confirmada, se muestra el mensaje explícito de vista desactualizada y no el éxito normal.
5. **Cobertura acotada.** Los tests backend simulan Cloudinary y PostgreSQL, incluyendo `public_id` válido, sin llamadas reales al proveedor. La verificación frontend usa lint/build y QA manual existente; no se incorpora un nuevo framework.

## Risks / Trade-offs

- Un cleanup de upload fallido puede dejar un asset huérfano.
- Un destroy posterior al commit puede dejar un asset remoto huérfano, pero evita que una fila válida apunte a un asset inexistente.
- Si el refetch frontend falla, la lista puede seguir mostrando datos anteriores; el aviso explícito evita presentarlos como confirmación sincronizada.
- La reconciliación queda manual y requiere revisar logs; es una deuda aceptada fuera del MVP v1.
