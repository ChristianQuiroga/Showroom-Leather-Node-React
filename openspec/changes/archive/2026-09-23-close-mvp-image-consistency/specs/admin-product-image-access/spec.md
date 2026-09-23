## MODIFIED Requirements

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

## ADDED Requirements

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
