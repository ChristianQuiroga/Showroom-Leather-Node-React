# Contexto de la interfaz — showroom artesanal

Estado observado en `feature/showroom-artesanal-ui` en septiembre de 2026. `main` conserva la MVP v1 previa mientras el PR esté abierto.

## Estructura y navegación

React 19 y Vite inician en `frontend/src/main.jsx`. `App.jsx` organiza las pantallas por estado React, sin React Router. El hash `#admin` abre el login si no hay sesión; el formulario llama a `POST /api/auth/login`. El hash no autentica ni concede permisos. Tras un login válido, el panel abre **Gestionar productos**. JWT y rol se comprueban en el backend.

`App.jsx` conserva búsqueda, estado, categoría y página del catálogo. Guarda por separado filtros y página de `ProductManager` para preservarlos al editar o administrar imágenes. Detalle, favoritos, login y pantallas administrativas se renderizan condicionalmente. No hay URL compartible para cada pantalla; el historial del navegador no representa todas esas transiciones. El regreso desde detalle o favoritos desplaza a `#coleccion`.

## Recorrido público

- `App.jsx`: cabecera, portada con `frontend/public/assets/hero-artesanal.jpeg`, catálogo y pie. La portada se denomina **hero** o **sección de presentación**; no aparece en el panel.
- `productService.js`: productos reales de la API; filtros combinables, limpieza, estados de error/vacío y paginación de seis productos.
- `ProductCard.jsx`: datos y foto o placeholder. Tanto la foto como **Ver detalle** abren la ficha. La estrella permite agregar o quitar favoritos; en administración la tarjeta presenta acciones y estados adicionales.
- `ProductDetail.jsx`: datos y galería, miniaturas, error de galería independiente, favorito y consulta mediante `product.whatsappUrl` provisto por el backend.
- `FavoritesView.jsx`: identificadores en `localStorage` (`showroom-leather:favorites:v1`); vuelve a consultar fichas y permite comparar dos o tres prendas. No hay cuenta de visitante ni sincronización entre dispositivos.
- `contactService.js`: obtiene `/api/contact` para el enlace general del pie. El número y mensaje se forman en el backend. `WhatsAppIcon.jsx` se reutiliza en detalle y pie.

## Administración

El botón **Administrar** no se muestra al público. Con sesión válida aparece un encabezado separado con **Nuevo producto**, **Gestionar productos**, **Gestionar categorías** y **Cerrar sesión**. La sección activa recibe otro estilo y `aria-current`. La pantalla inicial es **Gestionar productos**, sin hero público.

- `pages/Login.jsx`: email, contraseña, errores y estado de envío.
- `pages/ProductManager.jsx`: filtros independientes, seis productos por página, edición, imágenes, activación y desactivación.
- `pages/ProductForm.jsx`, `CategoryManager.jsx` y `ProductImageManager.jsx`: formularios y operaciones existentes.
- `authService.js` y `App.jsx`: token en `localStorage`, validación con `/api/auth/me`, logout y limpieza ante 401/403.
- `backend/src/middlewares/loginRateLimit.middleware.js`: cinco fallos por cuenta o treinta por IP en quince minutos provocan 429 y `Retry-After`. Los contadores en memoria no se comparten entre instancias ni sobreviven reinicios.

## Presentación y límites

`frontend/src/App.css` contiene variables de color, tipografía y superficies en `:root` y estilos públicos y administrativos. `index.css` contiene reglas globales. Cambiar colores y fuentes se concentra en variables; cambiar estructura requiere modificar componentes React. Los servicios siguen separados de los estilos. Replicar para otro cliente exige adaptar identidad, contenido, contacto y datos: esta rama no implementa multicliente.

La rama registra lint y build del frontend y una prueba focalizada del límite de login. El developer confirmó manualmente filtros, WhatsApp, navegación, seis tarjetas y presentación. La suite completa del backend requiere `DATABASE_URL`; no se declara QA de despliegue. Ver `docs/sdd/SDD-PROGRESS.md`.
