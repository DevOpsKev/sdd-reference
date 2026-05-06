# Architecture

## Application Shape

Tech Sovereignty Radar is a static web application. It is authored with a Node.js toolchain, built into static assets, and served from a Docker container. The runtime must not require a Node.js server; Node is only for development, build, and tests.

## Baseline Stack

- Package manager: pnpm.
- Build tool: Vite (root `vite.config.ts`).
- Language: TypeScript for interactive behavior and data transforms.
- UI: semantic HTML, SVG, and TypeScript. No React, Vue, or Svelte unless a spec explicitly introduces a framework ([vite-baseline](../specs/vite-baseline/spec.md) is vanilla HTML + TS).
- Styling: **Tailwind CSS** and **DaisyUI** implement the visual system; **normative rules** (tokens, grid, motion, forbidden patterns) remain in [`design-system.md`](design-system.md). CSS custom properties for tokens are mapped into Tailwind’s theme / DaisyUI themes so utilities and components stay aligned — arbitrary palette or layout utilities without token grounding are out of bounds for product UI.
- Optional: additional hand-authored CSS in `src/styles/` for token exports or layers Tailwind does not cover; Sass/LESS only if a spec adds them.
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

### Stylesheets and Tailwind entry

Tailwind’s global entry (e.g. `src/style.css`) loads Tailwind, DaisyUI, and optionally `@import` of token files. **`src/styles/`** holds CSS that supports — but does not replace — design-system alignment:

| Layer | Typical contents |
| --- | --- |
| `tokens.css` (or equivalent) | `:root` custom properties for colours, type, space, motion; referenced from Tailwind theme / `@theme` so utilities (`bg-*`, `text-*`, spacing) mirror tokens. |
| `base.css` | Rare resets not covered by Tailwind preflight; global `font-feature-settings`, tabular numerals on numeric surfaces. |
| `components.css` | Overrides where DaisyUI or Tailwind defaults conflict with [design-system](design-system.md) components (radii, borders, motion). |
| `layout.css` | Grid / section patterns expressed as composable classes when utilities alone are too repetitive. |
| Feature CSS | Spec-driven additions (e.g. `homepage.css`); must not fork token values already defined for Tailwind. |

**Entry HTML** imports one TS entry that pulls the **Tailwind entry stylesheet**; add extra `src/styles/*.css` imports only when needed. The design reference page may load the full stack; the product entry stays minimal.

See **Implementation (Tailwind CSS & DaisyUI)** in [`design-system.md`](design-system.md) for token mapping and DaisyUI theming rules.

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
