# Showroom Leather — Domain Model

## 1. Entidades principales

### Product
Representa un artículo del showroom.

Campos funcionales principales:
- id
- name
- code
- description
- categoryId
- material
- color
- size
- price
- stock
- status
- isFeatured
- isPublished
- isActive

### Category
Clasifica productos.

Campos principales:
- id
- name
- isActive

### ProductImage
Representa una imagen asociada a un producto.

Campos principales:
- id
- productId
- url
- publicId
- altText
- isMain
- displayOrder

### User
Representa usuarios administrativos.

Campos esperados:
- id
- email
- passwordHash
- role
- isActive

## 2. Relaciones

- Category 1 → N Product
- Product 1 → N ProductImage
- User administra recursos protegidos

## 3. Reglas de dominio

### Productos
- price > 0
- stock >= 0
- material obligatorio
- categoría existente y activa
- stock = 0 + available → sold
- stock > 0 + sold → conflicto 409

### Categorías
- name obligatorio
- máximo 100 caracteres
- sin duplicados
- categoría inactiva no debe utilizarse indebidamente

### Imágenes
- primera imagen puede convertirse en principal
- solo una imagen principal por producto
- máximo 5 MB
- JPG/JPEG/PNG/WebP

## 4. Estados

### Producto
`status` representa únicamente el estado comercial y admite:
- available
- reserved
- sold

Estas dimensiones son independientes del estado comercial:
- activo/inactivo mediante `isActive`
- publicado/no publicado mediante `isPublished`

`isPublished` es la única fuente de verdad para decidir la publicación pública. `unpublished` no es un estado comercial válido.

### Categoría
- Activa
- Inactiva

## 5. Transiciones relevantes

### Producto
Activo → Inactivo → Activo

### Categoría
Activa → Inactiva → Activa

## 6. Soft Delete

El MVP utiliza desactivación lógica para productos/categorías cuando corresponde.

Objetivo:
- preservar información;
- evitar borrados accidentales;
- permitir reactivación.
