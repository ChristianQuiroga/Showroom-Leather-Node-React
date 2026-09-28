## Preparación y trazabilidad

- [x] Preservar el trabajo local y trabajar en `feature/showroom-artesanal-ui`, separada de `main`.
- [x] Integrar Artesanal en React sin sustituir los servicios.
- [ ] Identificar el work item Jira; no hay clave confirmada.
- [ ] Revisar y aprobar formalmente esta especificación reconstruida. La implementación precedió su incorporación; no se registra aprobación retroactiva.

## Público

- [x] Portada, cabecera, pie y variables visuales.
- [x] Filtros, búsqueda, seis productos por página y estados error/vacío conectados a la API.
- [x] Foto y enlace para detalle, galería y consulta por WhatsApp.
- [x] Favoritos locales y comparación de dos o tres prendas.
- [x] Contacto general mediante `/api/contact`.

## Administración

- [x] Acceso por `#admin`, sin botón público; panel separado con gestión inicial y sección activa.
- [x] Mantener gestión, JWT y permisos.
- [x] Limitar intentos fallidos por cuenta e IP con 429 y `Retry-After`.

## Verificación y cierre

- [x] Lint y build frontend; prueba focalizada de rate limit; QA manual informada por el developer para filtros, WhatsApp, navegación, presentación y tarjetas.
- [ ] Suite completa backend en entorno con `DATABASE_URL` y QA manual integral de esta rama, incluidos favoritos/comparación y gestión.
- [ ] Revisar diff y contrato; registrar Jira solo cuando se identifique.
- [ ] Archivar OpenSpec y sincronizar specs únicamente tras revisión y cierre.
