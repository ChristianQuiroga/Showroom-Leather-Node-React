# Showroom Leather — Project Overview

**Proyecto:** Showroom-Leather-Node-React  
**Versión objetivo:** MVP v1  
**Enfoque:** Spec-Driven Development (SDD)

## 1. Objetivo

Cerrar y estabilizar el MVP v1 de un showroom público de productos de cuero, con administración protegida para gestionar productos, categorías e imágenes.

El sistema no es un e-commerce completo. El objetivo del MVP es permitir:

- navegar un catálogo público;
- consultar el detalle de productos;
- contactar por WhatsApp;
- administrar productos, categorías e imágenes;
- mantener consistencia entre frontend, PostgreSQL y Cloudinary;
- cerrar el desarrollo con criterios verificables.

## 2. Estado general

El proyecto se encuentra en fase avanzada. La mayor parte de la arquitectura y de las funcionalidades principales ya existe.

Los principales gaps abiertos son:

1. Limpiar filtros.
2. Galería pública.
3. Productos inactivos y reactivación.
4. Validación responsive/mobile real.
5. Revisión de persistencia JWT.

## 3. Stack

### Backend
- Node.js
- Express
- JavaScript
- PostgreSQL
- JWT
- Jest
- Supertest

### Frontend
- React
- JavaScript
- Vite

### Servicios
- Cloudinary
- WhatsApp

### Gestión
- Git/GitHub
- Jira
- SDD

## 4. Alcance del MVP

### Público
- catálogo de productos activos/publicados;
- imagen principal o placeholder;
- búsqueda;
- filtros;
- paginación;
- detalle;
- galería;
- WhatsApp;
- responsive.

### Administración
- login/logout;
- JWT;
- productos;
- categorías;
- imágenes;
- desactivación/reactivación;
- feedback de errores.

## 5. Fuera de alcance

- carrito;
- checkout;
- pagos;
- órdenes;
- múltiples vendedores;
- múltiples proveedores de imágenes;
- refresh tokens;
- roles complejos;
- PWA;
- app móvil;
- push notifications;
- internacionalización;
- SEO avanzado.

## 6. Criterio de éxito

El MVP se considera terminado cuando:

- no existen errores críticos;
- el catálogo público funciona;
- la administración funciona;
- la seguridad básica está verificada;
- backend tests están verdes;
- smoke test y regression test pasan;
- README y Jira reflejan el estado final.
