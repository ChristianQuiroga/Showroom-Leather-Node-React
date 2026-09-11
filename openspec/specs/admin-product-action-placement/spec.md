# admin-product-action-placement Specification

## Purpose
Separar la visualización del showroom de los accesos administrativos por producto, centralizando estos últimos en Gestionar productos y preservando la navegación existente.

## Requirements

### Requirement: Catálogo dedicado a visualización
El catálogo principal MUST omitir Editar, Gestionar imágenes, Activar y Desactivar en sus tarjetas, tanto sin sesión como con sesión admin activa. SHALL conservar los datos del producto, imagen o placeholder, filtros, paginación y acceso al detalle público.

#### Scenario: Catálogo con sesión administrativa
- **WHEN** un administrador con sesión activa visualiza el catálogo principal
- **THEN** ninguna tarjeta ofrece acciones administrativas por producto y seleccionar una tarjeta abre su detalle público

#### Scenario: Catálogo sin sesión
- **WHEN** un visitante navega el catálogo sin autenticación
- **THEN** visualiza las tarjetas sin acciones administrativas y puede filtrar, paginar y abrir el detalle como antes

#### Scenario: Regreso desde detalle
- **WHEN** un usuario abre un detalle desde un catálogo filtrado y paginado y luego vuelve
- **THEN** conserva la página y los filtros del catálogo sin que aparezcan acciones administrativas en las tarjetas

#### Scenario: Catálogo vacío
- **WHEN** los filtros no devuelven productos
- **THEN** se mantiene el mensaje de catálogo vacío y los controles de filtros existentes, sin accesos administrativos por producto

### Requirement: Accesos administrativos globales conservados
La interfaz SHALL mantener Nuevo producto, Gestionar productos, Gestionar categorías y Cerrar sesión para una sesión admin validada, con sus destinos actuales. MUST conservar la restricción existente que oculta esos accesos sin sesión administrativa válida.

#### Scenario: Administración desde el catálogo
- **WHEN** un administrador accede al catálogo con sesión válida
- **THEN** dispone de los cuatro accesos globales y cada uno abre su flujo existente o cierra la sesión según corresponda

#### Scenario: Sesión cerrada o invalidada
- **WHEN** el administrador cierra sesión o la sesión se invalida mediante los mecanismos existentes
- **THEN** dejan de estar disponibles los accesos administrativos y el catálogo conserva su comportamiento público

### Requirement: Acciones por producto centralizadas en gestión
La interfaz SHALL ofrecer los accesos Editar, Gestionar imágenes y Activar/Desactivar únicamente desde Gestionar productos, conservando la disponibilidad actual según el estado activo del producto y la separación entre estado comercial y publicación.

#### Scenario: Producto activo
- **WHEN** el administrador visualiza un producto activo en Gestionar productos
- **THEN** dispone de Editar, Gestionar imágenes y Desactivar, junto con los indicadores comerciales y de publicación separados

#### Scenario: Producto inactivo
- **WHEN** el administrador visualiza un producto inactivo en Gestionar productos
- **THEN** dispone únicamente de Activar como acción por producto y no se muestran Editar, Gestionar imágenes ni Desactivar

#### Scenario: Edición de producto no publicado
- **WHEN** el administrador selecciona Editar para un producto activo no publicado desde Gestionar productos
- **THEN** el formulario conserva la precarga administrativa y permite editar sin depender de un acceso desde el catálogo público

### Requirement: Continuidad de navegación administrativa
La interfaz SHALL conservar el regreso a Gestionar productos desde edición e imágenes, sus filtros y paginación, y la actualización del catálogo al volver desde gestión después de una modificación. SHALL preservar el manejo existente de errores de las operaciones.

#### Scenario: Regreso desde edición o imágenes
- **WHEN** el administrador abre Editar o Gestionar imágenes desde una página filtrada de Gestionar productos y pulsa Volver
- **THEN** regresa a la gestión con los mismos filtros y página, sujeta a la corrección existente cuando la página queda fuera de rango

#### Scenario: Mutación y regreso al showroom
- **WHEN** el administrador modifica un producto o su imagen principal, o activa/desactiva un producto, y vuelve desde gestión al catálogo
- **THEN** el catálogo refleja la información y visibilidad actuales sin F5 y mantiene las tarjetas sin acciones administrativas

#### Scenario: Error administrativo
- **WHEN** una operación administrativa devuelve un error de validación o conflicto
- **THEN** se conserva el error visible y la sesión conforme al comportamiento existente; las respuestas de autorización siguen usando el cierre de sesión actual
