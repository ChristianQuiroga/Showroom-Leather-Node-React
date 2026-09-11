# Showroom Leather — API

## 1. Catálogo público

### GET /api/products
Debe:
- ser público;
- devolver solo activos;
- devolver solo publicados;
- soportar búsqueda;
- soportar filtros;
- soportar paginación;
- incluir `main_image_url`.

### Query params
- search
- status: `available`, `reserved` o `sold`
- categoryId
- page
- limit

### Metadata esperada
- page
- limit
- total
- totalPages

---

## 2. Detalle

### GET /api/products/:id
Debe devolver información completa del producto.

---

## 3. Imágenes

### GET /api/products/:productId/images
Público.

### POST /api/products/:productId/images
Admin + JWT.

- multipart/form-data
- campo `image`
- JPG/JPEG/PNG/WebP
- máximo 5 MB

### PATCH /api/products/:productId/images/:imageId/main
Admin + JWT.

### DELETE /api/products/:productId/images/:imageId
Admin + JWT.

---

## 4. Productos — administración

### POST /api/products
Admin + JWT.

### PUT /api/products/:id
Admin + JWT.

Debe validar:
- price > 0
- stock >= 0
- material obligatorio
- categoría activa/existente
- reglas stock/status
- `status` solo admite `available`, `reserved` o `sold`
- `isPublished` controla la publicación independientemente del estado comercial

### Activación/desactivación
La implementación debe permitir:
- Activo → Inactivo
- Inactivo → Activo

---

## 5. Categorías

Operaciones esperadas:
- listar;
- crear;
- editar;
- desactivar;
- reactivar.

### PATCH /api/categories/:id/activate
Admin + JWT.

---

## 6. Auth

### Login
Credenciales válidas:
- éxito;
- JWT.

Credenciales inválidas:
- 401.

### Requests admin
Header:

```http
Authorization: Bearer <token>
```

### Errores esperados
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error
- 502 Bad Gateway cuando corresponda a proveedor externo

## 7. Error handling

Backend:
- `AppError`
- middleware centralizado

Frontend:
- error visible;
- no borrar datos en error;
- no quedar en loading infinito;
- no mostrar éxito ante rechazo del backend.
