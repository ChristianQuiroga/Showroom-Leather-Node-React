# Showroom Leather — Product Roadmap

## Objetivo

Organizar el cierre del MVP v1 en fases pequeñas, verificables y con bajo riesgo de retrabajo.

## Fase 1 — Auditoría y estabilización
**Estimación:** 4–6 h

### Objetivo
Confirmar el estado real de cada requisito antes de modificar código.

### Tareas
- revisar catálogo público;
- revisar auth;
- revisar productos;
- revisar categorías;
- revisar imágenes;
- revisar filtros y paginación;
- revisar PostgreSQL;
- revisar Cloudinary;
- ejecutar tests actuales;
- identificar gaps reales.

### Entregable
Checklist Current State vs Expected State.

---

## Fase 2 — Cierre del catálogo público
**Estimación:** 8–12 h

### Tareas
- implementar Limpiar filtros;
- resetear page a 1;
- hacer refetch;
- cerrar galería pública;
- validar imagen principal/secundarias;
- placeholder;
- revisar detalle de producto;
- revisar filtros + paginación;
- definir limit final;
- validar WhatsApp.

### Entregable
Catálogo público completo y usable sin login.

---

## Fase 3 — Administración completa
**Estimación:** 8–12 h

### Tareas
- listar productos inactivos;
- mostrar estado;
- reactivar;
- Activo → Inactivo;
- Inactivo → Activo;
- refetch posterior;
- revisar crear/editar productos;
- revisar categorías;
- reactivación de categorías;
- revisar imágenes;
- verificar consistencia UI/PostgreSQL/Cloudinary.

### Entregable
Administración completa sin intervención manual en base de datos.

---

## Fase 4 — Auth y seguridad
**Estimación:** 5–8 h

### Tareas
- login/logout;
- expiración JWT;
- 401/403;
- rol admin;
- rutas protegidas;
- bcrypt;
- revisar `.env`;
- revisar `.env.example`;
- secretos fuera del repo;
- CORS limitado;
- no stack trace en producción.

### Decisión MVP
Mantener `localStorage` si:
- JWT expira;
- queda documentado;
- logout elimina token correctamente.

### Entregable
Autenticación básica segura y consistente.

---

## Fase 5 — Refactor controlado
**Estimación:** 6–10 h

### Frontend
- revisar tamaño/responsabilidad de `App.jsx`;
- centralizar `API_URL`;
- centralizar auth;
- eliminar formatters duplicados;
- loading/error reutilizable;
- reducir componentes repetidos.

### Backend
- revisar naming;
- validaciones duplicadas;
- contratos service/repository;
- errores;
- SQL;
- índices;
- responsabilidades.

### Regla
No refactorizar solo por estética.

### Entregable
Código más mantenible sin alterar el alcance.

---

## Fase 6 — Testing y regression
**Estimación:** 8–12 h

### Automatizado
Agregar/priorizar:
- categorías;
- imágenes;
- productos inactivos;
- reactivación;
- búsqueda sin acentos;
- reglas stock/status.

### Manual
- smoke test;
- regression test;
- auth;
- catálogo;
- administración;
- Cloudinary;
- WhatsApp;
- responsive.

### Entregable
MVP validado contra los acceptance criteria.

---

## Fase 7 — Cierre y entrega
**Estimación:** 4–6 h

### Tareas
- revisar Definition of Done;
- README;
- `.env.example`;
- instrucciones de ejecución;
- revisar GitHub;
- actualizar Jira;
- registrar deuda técnica;
- separar MVP v2;
- smoke final.

### Entregable
MVP v1 listo para cierre.

---

## Estimación total

| Fase | Estimación |
|---|---:|
| Auditoría y estabilización | 4–6 h |
| Catálogo público | 8–12 h |
| Administración | 8–12 h |
| Auth y seguridad | 5–8 h |
| Refactor mínimo | 6–10 h |
| Testing y regression | 8–12 h |
| Cierre MVP | 4–6 h |
| **Total** | **43–66 h** |

Referencia operativa sugerida: **~55 horas**.
