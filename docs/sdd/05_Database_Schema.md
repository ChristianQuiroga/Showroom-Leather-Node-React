# Showroom Leather — Database Schema

## 1. Objetivo

Documentar el modelo de persistencia esperado para el MVP v1.

> Este documento describe el esquema funcional requerido. Los nombres exactos de columnas deben verificarse contra la base actual antes de realizar migraciones.

## 2. Tabla products

Campos funcionales esperados:

- id
- name
- code
- description
- category_id
- material
- color
- size
- price
- stock
- status
- is_featured
- is_published
- is_active
- created_at
- updated_at

## 3. Tabla categories

Campos esperados:

- id
- name
- is_active
- created_at
- updated_at

## 4. Tabla product_images

Campos esperados:

- id
- product_id
- url
- public_id
- alt_text
- is_main
- display_order
- created_at

## 5. Tabla users

Campos esperados:

- id
- email
- password_hash
- role
- is_active
- created_at
- updated_at

## 6. Restricciones recomendadas

### products
- price > 0
- stock >= 0
- `status IN ('available', 'reserved', 'sold')`
- `is_published` es booleano y constituye la fuente de verdad de publicación
- FK category_id → categories.id

### categories
- name NOT NULL
- longitud máxima 100
- unique según criterio definido

### product_images
- FK product_id → products.id
- garantizar una sola principal por producto desde lógica/constraint cuando corresponda

### users
- email unique
- password_hash obligatorio

## 7. PostgreSQL

### Búsqueda
La búsqueda debe usar:
- `ILIKE`
- `unaccent`

Ejemplos esperados:
- `marron` encuentra `marrón`
- `clasica` encuentra `clásica`

## 8. Performance

Revisar índices para:
- `products.category_id`
- `products.status`
- `products.is_active`
- `products.is_published`
- búsquedas frecuentes

Evitar:
- N+1 para imagen principal;
- joins innecesarios en count.

La consulta de catálogo debería resolver `main_image_url` con JOIN o estrategia equivalente eficiente.
