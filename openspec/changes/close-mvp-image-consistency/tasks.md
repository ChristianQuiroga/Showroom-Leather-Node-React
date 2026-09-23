## 1. Upload y compensación

- [x] 1.1 Mantener la compensación upload → INSERT existente y hacer explícito el registro de `public_id` y errores cuando falle el cleanup; verificar que no se confirme una fila inválida.
- [x] 1.2 Agregar test de upload rechazado por Cloudinary y verificar error de proveedor sin INSERT ni cleanup compensatorio.
- [x] 1.3 Agregar test de INSERT PostgreSQL fallido con cleanup Cloudinary exitoso y verificar propagación del error, ausencia de fila y asset remoto eliminado.
- [x] 1.4 Agregar test de INSERT PostgreSQL fallido con cleanup Cloudinary fallido y verificar logs con `public_id`, ambos errores y riesgo de asset huérfano.

## 2. Delete y consistencia de la imagen principal

- [x] 2.1 Reordenar delete para confirmar eliminación/reasignación en PostgreSQL dentro de una transacción antes de invocar Cloudinary y devolver HTTP 502 si falla el destroy posterior al commit; verificar que se registra `public_id` y error sin restaurar filas.
- [x] 2.2 Agregar test de delete con `public_id` simulado válido y destroy exitoso, verificando respuesta, fila eliminada/reasignada y llamada remota posterior al commit.
- [x] 2.3 Agregar test de rollback PostgreSQL en delete, verificando que Cloudinary no sea invocado y que la fila permanezca consistente.
- [x] 2.4 Agregar test de destroy fallido después del commit, verificando HTTP 502, registro para reconciliación manual y ausencia de fila inválida.
- [x] 2.5 Ajustar `setAsMain` para validar `UPDATE ... RETURNING` dentro de la transacción y hacer rollback si no devuelve la imagen objetivo, conservando el índice único existente.
- [x] 2.6 Agregar tests de setAsMain válido, objetivo inexistente y violación de unicidad, verificando que nunca se confirme un estado inesperado con todas las imágenes no principales.

## 3. Frontend del gestor de imágenes

- [x] 3.1 Hacer que el refetch posterior a una mutación propague su fallo y mostrar "La operación se realizó, pero no se pudo actualizar la vista" sin mostrar éxito normal de sincronización.
- [x] 3.2 Deshabilitar set-main y delete mientras la mutación equivalente esté pendiente y verificar que clicks duplicados no generen solicitudes adicionales.
- [x] 3.3 Ejecutar lint/build y realizar QA manual del gestor para confirmar mensajes, estado pendiente y comportamiento existente de upload, delete y principal. QA aprobada; el fallo controlado de refetch posterior a una mutación exitosa no pudo reproducirse manualmente y queda registrado como limitación.

## 4. Verificación y cierre

- [x] 4.1 Ejecutar `backend npm test` y verificar cobertura de fallos parciales sin llamadas reales a Cloudinary.
- [x] 4.2 Ejecutar `frontend npm run lint` y `frontend npm run build` y verificar que no se introduzcan dependencias ni infraestructura de testing nueva.
- [x] 4.3 Ejecutar regresión de endpoints públicos/admin, autorización, visibilidad y flujo completo de imágenes; verificar `git diff --check`.
- [x] 4.4 Actualizar `docs/sdd/SDD-PROGRESS.md` y `docs/sdd/MVP-V1-FINAL-SPEC.md` solo con evidencia de implementación y QA, verificando que no se declaren puntos sin respaldo.
- [x] 4.5 Vincular el change al work item Jira `SL-41` — "Cerrar consistencia de imágenes del MVP v1" — y registrar estado Done/Listo confirmado por el developer; verificar la trazabilidad antes del cierre.
