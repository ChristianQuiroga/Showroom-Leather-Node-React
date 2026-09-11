# Showroom Leather — Use Cases

## UC-01 — Navegar catálogo

**Actor:** Usuario público

### Flujo
1. Ingresa al showroom.
2. Visualiza productos activos/publicados.
3. Observa imagen principal o placeholder.
4. Navega sin autenticación.

### Acceptance
- no aparecen funciones admin;
- responsive;
- cards completas.

Con sesión admin activa, las tarjetas tampoco ofrecen Editar ni Gestionar imágenes. Se mantienen los accesos globales Nuevo producto, Gestionar productos, Gestionar categorías y Cerrar sesión.

---

## UC-02 — Buscar y filtrar

**Actor:** Usuario público

### Flujo
1. Escribe texto.
2. Selecciona estado y/o categoría.
3. El sistema combina filtros.
4. Page vuelve a 1.
5. Puede limpiar todos los filtros.

### Acceptance
- tolera mayúsculas/minúsculas;
- tolera acentos;
- hace refetch correctamente.

---

## UC-03 — Ver detalle

**Actor:** Usuario público

### Flujo
1. Selecciona un producto.
2. Visualiza datos completos.
3. Navega la galería.
4. Puede volver al listado.

---

## UC-04 — Consultar por WhatsApp

**Actor:** Usuario público

### Flujo
1. Pulsa WhatsApp.
2. El backend proporciona la URL.
3. El mensaje incluye nombre, código y precio.
4. Se abre WhatsApp Web/app.

---

## UC-05 — Login admin

**Actor:** Administrador

### Flujo
1. Ingresa email/password.
2. Backend valida.
3. Recibe JWT.
4. Accede a operaciones protegidas.

### Errores
- inválidas → 401
- token inválido/expirado → 401
- no-admin → 403

---

## UC-06 — Crear producto

**Actor:** Administrador

### Acceptance
- validaciones frontend/backend;
- error visible;
- formulario no se limpia en error;
- se limpia en éxito;
- persiste en PostgreSQL;
- catálogo se sincroniza.

---

## UC-07 — Editar producto

**Actor:** Administrador

**Acceso:** Editar desde Gestionar productos para un producto activo, publicado o no publicado.

### Acceptance
- precarga de datos;
- Guardar deshabilitado sin cambios;
- campos cambiados identificables;
- actualización protegida;
- refetch;
- no requiere F5.

---

## UC-08 — Desactivar/reactivar producto

**Actor:** Administrador

**Acceso:** Gestionar productos; los activos ofrecen Desactivar y los inactivos únicamente Activar como acción por producto.

### Flujo
1. Lista productos activos/inactivos.
2. Cambia estado.
3. Backend persiste.
4. UI hace refetch.

### Acceptance
- el público no ve inactivos;
- admin sí los gestiona.

---

## UC-09 — Gestionar categorías

**Actor:** Administrador

Puede:
- crear;
- editar;
- desactivar;
- reactivar.

### Reglas
- nombre obligatorio;
- máximo 100;
- no duplicados;
- estado repetido → 409.

---

## UC-10 — Gestionar imágenes

**Actor:** Administrador

**Acceso:** Gestionar imágenes desde Gestionar productos para un producto activo; este acceso no aparece en las tarjetas del catálogo.

Puede:
- subir;
- seleccionar principal;
- eliminar.

### Acceptance
- solo una principal;
- primera imagen principal;
- Cloudinary sincronizado;
- card actualiza imagen principal;
- error no genera divergencia.

---

## UC-11 — Cerrar sesión

**Actor:** Administrador

### Flujo
1. Pulsa logout.
2. Token se elimina.
3. Operaciones protegidas dejan de estar disponibles.
