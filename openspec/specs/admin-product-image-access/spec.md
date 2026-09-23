# admin-product-image-access Specification

## Purpose

Permitir que la administración consulte y gestione imágenes de productos activos no publicados, sin modificar la privacidad de las colecciones de imágenes públicas.

## Requirements

### Requirement: Lectura pública de imágenes limitada por visibilidad

La colección pública de imágenes SHALL permanecer disponible únicamente para productos con `is_active = true` e `is_published = true`. Un visitante MUST recibir `404` sin datos de imágenes para un producto inexistente, inactivo o activo no publicado.

#### Scenario: Producto activo y publicado consultado públicamente
- **WHEN** un visitante solicita las imágenes públicas de un producto activo y publicado
- **THEN** el sistema devuelve la colección de imágenes con el contrato público existente

#### Scenario: Producto activo y no publicado consultado públicamente
- **WHEN** un visitante solicita las imágenes públicas de un producto activo y no publicado
- **THEN** el sistema responde `404` y no devuelve datos de imágenes

#### Scenario: Producto inactivo consultado públicamente
- **WHEN** un visitante solicita las imágenes públicas de un producto inactivo
- **THEN** el sistema responde `404` y no devuelve datos de imágenes

### Requirement: Lectura administrativa de imágenes de productos activos

El sistema SHALL ofrecer una lectura administrativa protegida de imágenes para productos activos. Un administrador autenticado MUST poder obtener la colección tanto de productos publicados como de productos no publicados; `is_published` MUST NOT restringir esa lectura administrativa. La respuesta SHALL usar la colección y el orden actuales de imágenes.

#### Scenario: Administrador consulta producto activo y publicado
- **WHEN** un administrador autenticado solicita las imágenes administrativas de un producto activo y publicado
- **THEN** recibe la colección de imágenes del producto

#### Scenario: Administrador consulta producto activo y no publicado
- **WHEN** un administrador autenticado solicita las imágenes administrativas de un producto activo y no publicado
- **THEN** recibe la colección de imágenes aunque el endpoint público continúe respondiendo `404`

#### Scenario: Producto activo sin imágenes
- **WHEN** un administrador autenticado solicita las imágenes administrativas de un producto activo sin imágenes
- **THEN** recibe una colección vacía con el contrato de respuesta existente

### Requirement: Autorización y estado administrativo de imágenes

La lectura administrativa MUST requerir JWT válido y rol admin. Una solicitud sin JWT SHALL responder `401`; una solicitud autenticada sin rol admin SHALL responder `403`. Para un producto inexistente, SHALL responder `404`. Para un producto inactivo, SHALL responder `409` sin devolver imágenes, coherente con la regla vigente que impide gestionar imágenes de productos desactivados.

#### Scenario: Lectura administrativa sin JWT
- **WHEN** un cliente solicita la colección administrativa sin token
- **THEN** el sistema responde `401` y no devuelve imágenes

#### Scenario: Lectura administrativa con usuario no admin
- **WHEN** un usuario autenticado sin rol admin solicita la colección administrativa
- **THEN** el sistema responde `403` y no devuelve imágenes

#### Scenario: Lectura administrativa de producto inactivo
- **WHEN** un administrador autenticado solicita la colección administrativa de un producto inactivo
- **THEN** el sistema responde `409` y no devuelve imágenes, y la interfaz no ofrece Gestionar imágenes para ese producto

### Requirement: Integración con el gestor administrativo
El gestor administrativo MUST mantener las operaciones autorizadas de upload, eliminación y cambio de imagen principal, MUST impedir operaciones duplicadas mientras una mutación equivalente esté pendiente y MUST distinguir una mutación confirmada de un refetch posterior fallido.

#### Scenario: Mutación y refetch exitosos
- **WHEN** un administrador completa upload, eliminación o cambio de imagen principal y la recarga posterior de imágenes también es exitosa
- **THEN** el gestor MUST mostrar el estado actualizado y un mensaje normal de éxito

#### Scenario: Gestionar imágenes de producto no publicado
- **WHEN** un administrador abre Gestionar imágenes para un producto activo no publicado desde Gestionar productos
- **THEN** visualiza las imágenes existentes y puede continuar con las operaciones administrativas permitidas

#### Scenario: Mutación y refetch administrativo
- **WHEN** un administrador sube una imagen, marca una principal o elimina una imagen de un producto activo
- **THEN** las operaciones conservan su autorización y el gestor recarga la colección mediante la lectura administrativa

#### Scenario: Detalle público sin regresión
- **WHEN** un visitante abre ProductDetail de un producto activo y publicado
- **THEN** la galería continúa usando la lectura pública y conserva su comportamiento actual

#### Scenario: Mutación exitosa con refetch fallido
- **WHEN** la mutación se confirma pero la recarga posterior de imágenes falla
- **THEN** el gestor MUST NOT mostrar un éxito normal como si la vista estuviera sincronizada, MUST conservar la información visible disponible y MUST mostrar un mensaje explícito equivalente a "La operación se realizó, pero no se pudo actualizar la vista"

#### Scenario: Click duplicado durante set-main o delete
- **WHEN** una operación set-main o delete está pendiente
- **THEN** el control correspondiente MUST quedar deshabilitado hasta que la operación y su actualización de vista finalicen o fallen

### Requirement: Compensación del upload de imágenes
El servicio MUST conservar la compensación best-effort existente cuando un upload de Cloudinary fue exitoso y el INSERT de PostgreSQL falla. El servicio MUST informar el error original sin confirmar una imagen inexistente en PostgreSQL y MUST registrar el `public_id` y el error si el cleanup remoto falla.

#### Scenario: Upload de Cloudinary fallido
- **WHEN** Cloudinary rechaza el upload o devuelve un resultado inválido
- **THEN** el servicio MUST devolver un error de proveedor, MUST NOT insertar una fila de imagen y MUST NOT intentar cleanup de un asset no confirmado

#### Scenario: INSERT de PostgreSQL fallido y cleanup exitoso
- **WHEN** Cloudinary devuelve un `public_id` válido pero el INSERT de PostgreSQL falla y el destroy compensatorio finaliza correctamente
- **THEN** el servicio MUST propagar el error de persistencia, MUST dejar ninguna fila nueva para ese asset y MUST dejar el asset remoto eliminado

#### Scenario: INSERT de PostgreSQL fallido y cleanup fallido
- **WHEN** Cloudinary devuelve un `public_id` válido, el INSERT de PostgreSQL falla y el destroy compensatorio también falla
- **THEN** el servicio MUST propagar el error de persistencia, MUST registrar `public_id` y ambos errores para reconciliación manual y MUST informar que puede existir un asset huérfano

### Requirement: Eliminación consistente entre PostgreSQL y Cloudinary
La eliminación MUST confirmar primero la eliminación y cualquier reasignación de principal en PostgreSQL dentro de una transacción. Solo después del commit MUST intentar destruir el asset remoto. Una falla de PostgreSQL MUST impedir la llamada a Cloudinary; una falla posterior del destroy MUST no restaurar una fila inválida.

#### Scenario: Eliminación transaccional y destroy exitoso
- **WHEN** la fila de imagen se elimina o se reasigna correctamente en PostgreSQL y Cloudinary destruye el `public_id`
- **THEN** el endpoint MUST responder éxito y no MUST quedar una fila apuntando al asset eliminado

#### Scenario: Falla de PostgreSQL antes del commit
- **WHEN** la transacción de eliminación o reasignación falla
- **THEN** PostgreSQL MUST hacer rollback, el endpoint MUST devolver un error de persistencia y Cloudinary MUST NOT recibir una solicitud destroy

#### Scenario: Destroy de Cloudinary fallido después del commit
- **WHEN** PostgreSQL confirma la eliminación pero Cloudinary falla al destruir el `public_id`
- **THEN** el endpoint MUST devolver un error de proveedor equivalente a HTTP 502, MUST registrar claramente `public_id` y el error para reconciliación manual y MUST NOT restaurar una fila que apunte a un asset potencialmente inexistente

### Requirement: Atomicidad del cambio de imagen principal
El cambio de imagen principal MUST ejecutarse dentro de una transacción coherente. La operación MUST validar que la imagen objetivo sea actualizada mediante `UPDATE ... RETURNING`; si no devuelve la imagen objetivo, MUST hacer rollback y devolver un error sin confirmar un estado nuevo. El índice único existente de una principal por producto MUST conservarse.

#### Scenario: Cambio de principal válido
- **WHEN** la imagen objetivo existe y el UPDATE transaccional devuelve esa imagen
- **THEN** la transacción MUST confirmar exactamente una imagen principal para el producto

#### Scenario: Imagen objetivo inexistente o desaparecida durante la transacción
- **WHEN** el UPDATE de la imagen objetivo no devuelve ninguna fila
- **THEN** la transacción MUST hacer rollback, el endpoint MUST devolver un error de recurso no encontrado y MUST conservar el estado principal previo

#### Scenario: Violación de unicidad
- **WHEN** una actualización intentaría confirmar más de una imagen principal
- **THEN** PostgreSQL MUST rechazar la transacción mediante el índice único existente y el servicio MUST devolver un error sin dejar un estado parcialmente confirmado
