# Integración continua

## Purpose

Proveer verificaciones automáticas y reproducibles de backend y frontend en GitHub Actions, aisladas de credenciales, datos y servicios reales del producto.

## Requirements

### Requirement: Disparadores y resultados independientes

GitHub Actions SHALL ejecutar CI ante push a main y pull_request hacia main. Backend y frontend MUST aparecer como jobs separados e independientes.

#### Scenario: Push a main
- **WHEN** se publica un commit en main
- **THEN** se dispara CI con jobs backend y frontend diferenciados

#### Scenario: PR hacia main
- **WHEN** se abre, reabre o actualiza un pull request cuya rama base es main
- **THEN** se dispara CI para esa propuesta con ambos jobs

### Requirement: Backend desde un entorno limpio

El job backend MUST usar Node 24.x LTS y npm ci con el lockfile existente. SHALL preparar PostgreSQL 18 efímero vacío mediante la imagen `postgres:18`, con health check y DATABASE_URL exclusiva de CI, habilitar unaccent, aplicar las migraciones, ejecutar el seed y luego npm test. El job MUST NOT depender de un .env real ni de datos preexistentes.

#### Scenario: Primera ejecución sin datos previos
- **WHEN** backend se ejecuta en un runner limpio
- **THEN** PostgreSQL está saludable y se crean extensión, esquema y datos de prueba antes de ejecutar los tests
- **AND** los tests pueden autenticar al admin de prueba y disponer de una categoría activa

#### Scenario: Versión PostgreSQL alineada con el entorno local
- **WHEN** se configura el servicio efímero de PostgreSQL para CI
- **THEN** se utiliza la imagen `postgres:18`, correspondiente a la versión mayor del servidor local 18.3 verificado
- **AND** se permiten actualizaciones menores dentro de la línea 18 sin usar latest ni otra versión mayor

### Requirement: Verificación frontend

El job frontend MUST usar Node 24.x LTS, instalar con npm ci y ejecutar npm run lint y npm run build, sin necesitar PostgreSQL ni secretos backend.

#### Scenario: Frontend en runner limpio
- **WHEN** se ejecuta el job frontend sin dependencias previamente instaladas
- **THEN** la instalación reproducible permite completar lint y build con resultado satisfactorio

### Requirement: Aislamiento y permisos mínimos

CI MUST usar únicamente valores ficticios de prueba para variables obligatorias de aplicación, sin .env reales, secretos reales de Cloudinary ni llamadas reales al proveedor. Los tests SHALL conservar las simulaciones existentes. Actions MUST usar permisos mínimos contents: read, no imprimir secretos, no usar pull_request_target y no realizar deploy.

#### Scenario: Ejecución sin secretos configurados
- **WHEN** un push o PR ejecuta CI sin secretos reales de aplicación disponibles
- **THEN** las variables ficticias permiten inicializar los tests y no se solicita ningún secreto real
- **AND** upload utiliza su simulación existente y no se realizan solicitudes reales a Cloudinary

#### Scenario: Límites de seguridad
- **WHEN** se inspeccionan workflow y logs de una ejecución
- **THEN** no hay deploy, pull_request_target, credenciales reales ni impresión de secretos, y el token de Actions solo tiene los permisos mínimos declarados

### Requirement: Propagación de fallos

Todo fallo de un control obligatorio MUST producir CI fallido. El workflow MUST NOT ocultar errores de npm ci, PostgreSQL/health check, unaccent, migraciones, seed, npm test, lint o build mediante tolerancia de errores.

#### Scenario: Fallo backend
- **WHEN** falla una instalación, preparación de base o prueba backend
- **THEN** backend y el resultado global de CI no son exitosos
- **AND** frontend puede completar su job independiente

#### Scenario: Fallo frontend
- **WHEN** falla npm ci, lint o build frontend
- **THEN** frontend y el resultado global de CI no son exitosos
- **AND** backend puede completar su job independiente
