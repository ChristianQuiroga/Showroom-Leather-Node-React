## Context

La MVP v1 usa React/Vite, Express, PostgreSQL y Cloudinary. `App.jsx` conserva navegación y filtros; los servicios consumen API real. El Site 02 Artesanal sirvió como referencia visual, sin sustituir React. Este diseño documenta las decisiones observadas en la rama.

## Decisions

1. **Presentación separada de datos.** `App.css` concentra variables visuales; `ProductCard` se reutiliza en catálogo y gestión. Un rediseño puede cambiar estilos y componentes sin modificar servicios o persistencia, aunque una estructura nueva sí requiere trabajo React.
2. **Navegación local.** `App.jsx` conserva filtros, página y pantalla activa. `ProductManager` recibe su estado del padre para conservarlo al editar. El retorno público desplaza a `#coleccion`. No se incorporó un router.
3. **Favoritos sin cuenta.** Guardar identificadores en `localStorage`, volver a consultar las fichas al abrir Favoritos y comparar hasta tres productos; las prendas retiradas no se comparan como fichas vigentes.
4. **Admin discreto, permisos en la API.** `#admin` abre el login; `/api/auth/login` emite JWT y `/api/auth/me` valida sesión. El middleware cuenta fallos por email e IP en memoria durante quince minutos; bloquea con 429 y `Retry-After`.
5. **WhatsApp desde backend.** Consulta de producto mediante `product.whatsappUrl`; contacto general mediante `/api/contact`. El frontend no contiene el número.

## Límites

- Favoritos locales, sin sincronización entre dispositivos.
- El rate limit se reinicia con el proceso y no coordina varias instancias; un despliegue horizontal requiere almacenamiento compartido y revisión de IP confiable.
- Ocultar el acceso reduce ruido visual; `#admin` es descubrible y no reemplaza la autorización.
- No se implementan temas intercambiables, plataforma SaaS, pagos ni rutas compartibles por pantalla.
