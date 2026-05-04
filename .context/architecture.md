# Architecture

## Application Shape

Tech Sovereignty Radar is a static web application. It is authored with a Node.js toolchain, built into static assets, and served from a Docker container. The runtime must not require a Node.js server; Node is only for development, build, and tests.

## Baseline Stack

- Package manager: pnpm.
- Build tool: Vite (root `vite.config.ts`).
- Language: TypeScript for interactive behavior and data transforms.
- UI: vanilla HTML, CSS, SVG, and TypeScript unless a spec explicitly justifies a framework.
- Styling: plain CSS with custom properties; no Tailwind, Sass, or component library by default. Normative visual rules live in [`.context/design-system.md`](design-system.md); implementation is layered under `src/styles/` (see [Frontend layout](#frontend-layout)).
- Data: versioned static JSON files in the repository.
- Runtime image: nginx:alpine or equivalent minimal static server.
- Container port: 8080.
- Root **`Dockerfile`**: multi-stage build that runs `pnpm build` and copies only **`dist/`** into the runtime image (see [Build and runtime boundary](#build-and-runtime-boundary)).

## Frontend layout

### Multi-page static site (Vite)

The repository uses **two HTML entry points** at the repo root:

| File | Role |
| --- | --- |
| `index.html` | Product / marketing entry (e.g. homepage). |
| `design-reference.html` | Developer-facing **design-system review** surface (tokens and components). |

`vite.config.ts` registers both files in `build.rollupOptions.input`, so `pnpm build` emits **`index.html`** and **`design-reference.html`** (plus hashed JS/CSS assets) into **`dist/`**. This is a small **multi-page app (MPA)** — no SPA router required.

### Entry scripts

TypeScript entry points under **`src/`** import CSS and attach behaviour:

- **`src/main.ts`** — loaded by **`index.html`** (minimal bootstrap; page markup may live primarily in HTML).
- **`src/design-reference.ts`** — loaded by **`design-reference.html`** (reference sections, optional motion demos).

### Stylesheets (`src/styles/`)

CSS is split so tokens stay reusable and pages stay thin:

| Layer | Typical contents |
| --- | --- |
| `tokens.css` | `:root` custom properties aligned with the design system (colour, type, space, motion). |
| `base.css` | Global resets, `body`, typography defaults, font-feature settings (e.g. tabular numerals). |
| `components.css` | Buttons, inputs, tables, cards, chips — reusable primitives. |
| `layout.css` | Grid, sections, page chrome patterns. |
| `homepage.css` (or similar) | Product-only layout when required by a spec; must not fork token values already in `tokens.css`. |

**Entry HTML** should import the **smallest** set of modules needed: the design reference page pulls the full stack; the product entry may import a subset plus feature CSS.

## Development commands

From the repo root (after `corepack enable` and `pnpm install`):

- **`pnpm dev`** — Vite dev server (default **port 5173** per `vite.config.ts`).
- **`pnpm build`** — Production build to **`dist/`**.
- **`pnpm preview`** — Serves **`dist/`** locally for a production-like check.

## Build and runtime boundary

The build step produces a `dist/` directory containing HTML, CSS, JavaScript, fonts, images, and data files. The Docker image serves only the built static files. No source files, package caches, `node_modules`, secrets, or git metadata should be copied into the final runtime image.

## Data model direction

Radar entries are structured data, not hard-coded DOM. Each entry has a stable id, name, quadrant, ring, rationale, sovereignty factors, last-reviewed date, and release/version metadata. Position changes across releases should be representable as data so the app can show history and diffs.

## Testing expectations

Specs that touch interaction or data transformation should include lightweight automated checks. Prefer unit tests for data validation and Playwright smoke tests for core rendered flows: page loads, radar renders, filtering/search works, and entry detail content is reachable.
