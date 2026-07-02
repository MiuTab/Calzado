# Calzado Sys

Sistema de gestión de inventario de calzado para bodega central. Permite llevar control de existencias, préstamos a locales externos y ventas, con un panel operativo, un módulo de inventario, un escáner y un panel gerencial.

## Módulos

- **Panel Operativo** — vista general de la operación diaria: préstamos, devoluciones y ventas.
- **Inventario** — alta y edición de zapatos (código, marca, modelo, talla, color, precios, categoría).
- **Escáner** — flujo optimizado para escanear códigos y registrar préstamos, devoluciones o ventas.
- **Panel Gerencial** — métricas y reportes (acceso restringido).

## Stack

- [React](https://react.dev/) 18 + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) como bundler
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Radix UI](https://www.radix-ui.com/) / [MUI](https://mui.com/) para componentes
- [pnpm workspaces](https://pnpm.io/workspaces)

## Requisitos

- Node.js 18+
- [pnpm](https://pnpm.io/)

## Instalación

```bash
pnpm install
```

## Desarrollo

```bash
pnpm dev
```

## Build de producción

```bash
pnpm build
```

## Estructura del proyecto

```
src/
├── main.tsx              # Punto de entrada
├── app/
│   ├── App.tsx            # Layout principal y estado de la app
│   ├── types.ts           # Tipos de dominio (Zapato, Prestamo, Venta, ...)
│   ├── components/        # Componentes reutilizables (incluye ui/ de shadcn)
│   ├── modules/            # Módulos de la aplicación (Inventario, Escáner, ...)
│   └── data/               # Datos mock e iniciales
└── styles/                 # Estilos globales, tema y tipografías
```
