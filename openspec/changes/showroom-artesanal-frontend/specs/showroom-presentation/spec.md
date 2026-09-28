## ADDED Requirements

### Requirement: Catálogo artesanal con datos vigentes

La interfaz SHALL mostrar productos activos y publicados de la API, con foto o placeholder, búsqueda, filtros combinables, limpieza y paginación de seis elementos. Cambiar filtros SHALL volver a la primera página. SHALL mostrar estados vacío y error.

#### Scenario: Abrir y volver
- **WHEN** el visitante filtra y selecciona la foto o Ver detalle
- **THEN** ve la ficha real y al volver conserva filtros y página en la colección

### Requirement: Detalle y consulta

El detalle SHALL mostrar datos y galería reales. Un error de galería SHALL informarse sin ocultar datos válidos. La consulta SHALL usar solo `product.whatsappUrl` si existe. El pie SHALL ofrecer enlace de `/api/contact` cuando esté disponible, con icono de WhatsApp.

#### Scenario: Consultar una prenda
- **WHEN** el producto incluye `whatsappUrl` y el visitante pulsa Consultar por WhatsApp
- **THEN** se abre el enlace generado en el backend

### Requirement: Favoritos y comparación local

El visitante SHALL poder agregar y quitar favoritos desde tarjeta y detalle y comparar dos o tres prendas. Los identificadores SHALL permanecer en el navegador mediante almacenamiento local; las fichas SHALL volver a consultarse al abrir favoritos. SHALL avisarse si alguna ya no está disponible.

#### Scenario: Comparar favoritos
- **WHEN** el visitante selecciona dos o tres favoritos para comparar
- **THEN** ve sus atributos vigentes en una tabla

### Requirement: Panel administrativo independiente

La vista pública SHALL omitir el botón Administrar. `#admin` SHALL abrir el login sin conceder permisos. Tras login válido SHALL abrir Gestionar productos, sin portada pública, con Nuevo producto, Gestionar productos, Gestionar categorías y Cerrar sesión. La sección activa SHALL distinguirse; las mutaciones SHALL seguir protegidas por JWT y rol.

#### Scenario: Entrada y navegación
- **WHEN** el administrador inicia sesión y cambia de sección
- **THEN** ve el título y sección activa y puede volver a Gestionar productos sin pasar por el hero

### Requirement: Límite de fallos de login

`POST /api/auth/login` SHALL contar fallos por email normalizado e IP en quince minutos; con cinco fallos por cuenta o treinta por IP SHALL responder 429 con `Retry-After`. Un login exitoso SHALL limpiar los fallos de la cuenta. Los contadores SHALL residir en el proceso del servidor.

#### Scenario: Bloqueo temporal
- **WHEN** se supera un límite durante la ventana
- **THEN** el servidor rechaza el login e indica los segundos restantes

### Requirement: Presentación adaptable

La interfaz SHALL usar variables visuales compartidas separadas de servicios API y SHALL permitir uso por teclado y pantallas pequeñas.

#### Scenario: Cambio visual
- **WHEN** se modifican variables de color y tipografía
- **THEN** cambia la apariencia sin editar lógica de consulta o permisos
