# Showroom Leather — Project Structure

## 1. Estructura recomendada

```text
Showroom-Leather-Node-React/
├── backend/
├── frontend/
├── docs/
└── README.md
```

## 2. Backend

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── seeds/
│   ├── scripts/
│   ├── app.js
│   └── server.js
├── tests/
├── .env
├── .env.example
└── package.json
```

## 3. Frontend

```text
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .env.example
└── package.json
```

## 4. Docs

```text
docs/
├── 01_Project_Overview.md
├── 02_Product_Roadmap.md
├── 03_Domain_Model.md
├── 04_Architecture.md
├── 05_Database_Schema.md
├── 06_Project_Structure.md
├── 07_API.md
├── 08_Use_Cases.md
└── 99_Setup.md
```

## 5. Convenciones

- un propósito claro por módulo;
- evitar lógica de negocio en routes;
- evitar acceso directo a DB desde controllers;
- centralizar configuración;
- reutilizar errores;
- mantener commits pequeños;
- cada cambio debe corresponder a un requirement/gap.
