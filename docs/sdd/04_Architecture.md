# Showroom Leather — Architecture

## 1. Arquitectura general

El sistema se divide en:

- Frontend React
- Backend Node.js + Express
- PostgreSQL
- Cloudinary
- WhatsApp como canal externo de consulta

## 2. Backend

Capas actuales:

```text
routes/
controllers/
services/
repositories/
middlewares/
config/
utils/
seeds/
scripts/
```

### Responsabilidades

**Route**
- endpoint;
- middlewares;
- entrada HTTP.

**Controller**
- adapta request/response;
- delega lógica.

**Service**
- reglas de negocio;
- coordinación.

**Repository**
- acceso a PostgreSQL;
- queries.

**Middleware**
- autenticación;
- autorización;
- errores;
- uploads.

## 3. Frontend

Estructura prevista:

```text
components/
pages/
services/
hooks/
utils/
assets/
```

## 4. Riesgo actual

El estado principal se encuentra demasiado concentrado en `App.jsx`.

### Refactor mínimo sugerido
- extraer navegación cuando sea necesario;
- centralizar auth;
- centralizar `API_URL`;
- reutilizar loading/error;
- reutilizar formatters.

## 5. Contratos

Contratos relevantes:

- Frontend ↔ API REST
- API ↔ PostgreSQL
- API ↔ Cloudinary
- API → WhatsApp URL

## 6. Principios

- controller liviano;
- business rules en service;
- persistencia en repository;
- errores centralizados;
- auth como middleware;
- no duplicar reglas entre frontend y backend cuando el backend debe ser fuente de verdad.

## 7. Decisiones para MVP v1

Mantener:
- JavaScript;
- React;
- Express;
- PostgreSQL;
- Cloudinary.

No incorporar en esta fase:
- TypeScript;
- Redux;
- Next.js;
- arquitectura frontend compleja.

La prioridad es cerrar correctamente el MVP.
