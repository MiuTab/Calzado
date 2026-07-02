# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install   # install dependencies
pnpm dev       # start Vite dev server
pnpm build     # production build (vite build)
```

There is no lint, test, or typecheck script configured in `package.json` — do not assume one exists.

## Architecture

This is a Figma Make-generated React + TypeScript + Vite app (`@figma/my-make-file`) for managing shoe warehouse inventory ("Calzado Sys" — Spanish UI/domain terms throughout the code, e.g. `zapatos`, `prestamos`, `ventas`).

- **No backend / no persistence.** All application data lives in a single in-memory `AppState` object (`src/app/types.ts`), seeded from `src/app/data/mockData.ts` and held in `useState` in [App.tsx](src/app/App.tsx). Reloading the page resets all data. Any real persistence layer would need to be added.
- **Single state object, lifted to `App.tsx`.** `AppState` = `{ zapatos, localesExternos, prestamos, ventas }`. All mutations (`addZapato`, `prestarZapato`, `devolverZapato`, `venderZapato`, `addLocalExterno`, `updateLocalExterno`) are defined as `useCallback`s in `App.tsx` and passed down as props to modules — there is no context/store library.
- **Domain model** (`src/app/types.ts`): a `Zapato` (shoe) moves through `estado`: `en_bodega` → `prestado` (loaned to a `LocalExterno`, creating a `Prestamo`) → `vendido` (creating a `Venta`). A `Prestamo` can end in `devuelto` (returned to warehouse) or `vendido` (sold while on loan). Sales track `vendidoPor`: `local_original` (warehouse) vs `local_externo` (external shop).
- **Modules** (`src/app/modules/`) are the four top-level views switched by `AppView` (`operativo | inventario | escaner | gerencial`), routed via local state in `App.tsx`, not a router: `OperationalPanel`, `InventoryModule`, `ScannerModule`, `ManagementPanel`. Each module receives the full `state` plus only the mutation callbacks it needs.
- **UI components** (`src/app/components/ui/`) are shadcn/Radix-based primitives; do not hand-roll equivalents. `src/app/components/figma/ImageWithFallback.tsx` is a Figma Make-specific helper — do not remove.
- **Styling**: Tailwind v4 via `@tailwindcss/vite`, plus hand-written inline `style={{...}}` objects for layout-heavy components like `App.tsx`'s `Sidebar`/`MobileTopBar`. Global styles/theme/fonts live in `src/styles/`.
- **Vite config** ([vite.config.ts](vite.config.ts)): includes a custom `figma-asset-resolver` plugin resolving `figma:asset/*` imports to `src/assets/`, and a `@` alias to `src/`. The comments there explicitly warn not to remove the React/Tailwind plugins or add `.css`/`.tsx`/`.ts` to `assetsInclude` — respect those constraints.
- **Package manager**: pnpm only (`pnpm-workspace.yaml` pins a single-package workspace with a `minimumReleaseAge` supply-chain guard). Don't introduce npm/yarn lockfiles.
