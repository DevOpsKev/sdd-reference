# Vite baseline — scaffold, empty page, Docker

## Intent

Establish the baseline **static web application toolchain** for this repository: **pnpm**, **Vite**, **TypeScript** (strict), **HTML with plain CSS**, and a **multi-stage Docker image** that serves only the production build from **nginx** on port **8080**. Output must align with [`sdd/context/architecture.md`](../../context/architecture.md), which is the authoritative source for project-wide architectural constraints.

The application itself is an **empty page**: no placeholder copy, hero, cards, or decorative UI—only the minimal HTML shell needed for Vite’s entry (and an optional `<title>` for smoke checks). This spec does **not** implement the full design system in [`sdd/context/design-system.md`](../../context/design-system.md); that comes in later feature specs.

This is the project's first feature specification. It establishes the toolchain that subsequent specs evolve. As [`architecture.md`](../../context/architecture.md) describes under *Implementation status*, the corpus-driven build pipeline replaces this baseline's single-page Vite app via a later spec; until that spec lands, the baseline is the live implementation.

## References

- [`sdd/context/architecture.md`](../../context/architecture.md) — authoritative on package manager, Vite, TypeScript, `dist/`, the Docker image, port 8080, and all permanent framework prohibitions. This spec defers to architecture.md on every constraint listed there.
- [`sdd/context/design-system.md`](../../context/design-system.md) — out of scope; no design-system styling work in this baseline.

## Requirements

### Toolchain

- **pnpm** — Respect `packageManager` in [`package.json`](../../../package.json); produce or update **`pnpm-lock.yaml`** so installs are reproducible (including in Docker).
- **Vite** — Vanilla **HTML + TypeScript** app. No client-side UI framework. Global styles are **plain CSS** imported from TypeScript (e.g. `src/main.ts` imports `src/style.css`). The list of prohibited frameworks and preprocessors is given by `architecture.md` under *Styles*, *Islands*, and *Non-goals*; this spec adds nothing to that list and removes nothing from it.
- **TypeScript** — `strict` enabled.
- **Scripts** in root `package.json` at minimum:
  - `"dev"` → `vite` (development server).
  - `"build"` → `vite build` (output to `dist/`).
  - `"preview"` → `vite preview` (serve the built `dist/` for inspection).

Operators run **`pnpm install`**, **`pnpm dev`**, **`pnpm build`**, and **`pnpm preview`**; pnpm runs the scripts above.

### Source layout (conceptual)

- Single HTML entry at repository root per Vite convention (e.g. `index.html`).
- One TypeScript entry (e.g. `src/main.ts`) that imports the **global stylesheet** (e.g. `src/style.css`). The stylesheet may be empty. No framework directives, preprocessor syntax, or PostCSS-as-build-step configuration.
- **`vite.config.ts`** at repo root — standard Vite config for the vanilla app (path aliases optional).

### CSS / UI

- **Plain CSS only.** No CSS framework or preprocessor. The complete prohibition list lives in [`architecture.md`](../../context/architecture.md) under *Styles*; agents should read that section before adding any styling dependency.
- **Empty page**: the document **body** must contain **no** visible text nodes or block content beyond what the toolchain requires (no headings, paragraphs, or decorative markup for users). A `<title>` in `<head>` is allowed so smoke checks can find a stable string.
- No requirement for custom CSS classes, hero/card/tagline patterns, or “intentional” visual styling beyond an empty (or default) canvas.

### Docker

- **`Dockerfile` at repository root** — Multi-stage build:
  - Build stage: install dependencies with pnpm, run `pnpm build`, produce `dist/`.
  - Runtime stage: **`nginx:alpine`** (or equivalent minimal static server) copies **only** the contents of `dist/` (and any minimal nginx config required). **No** `node_modules`, source tree, or package manager in the final image.
- **`nginx.conf` at repository root** — Configures nginx to listen on **8080** (not the default 80, so the container can run unprivileged).
- Container exposes **8080**; `docker run -p 8080:8080 <image>` serves the app at `http://localhost:8080/`.
- Do not copy secrets, `.env` files, or git metadata into the image.

### Page content

- Single route `/`.
- The served HTML must include the exact string **`Vite baseline`** in the document (e.g. in `<title>`) so smoke checks are unambiguous. The visible page remains empty.

## Acceptance criteria

- [ ] Root `package.json` includes `vite`, `typescript`, and scripts `dev`, `build`, and `preview` as above.
- [ ] No CSS framework dependency is added (Tailwind CSS, DaisyUI, Bootstrap, Bulma, Foundation, or similar). No CSS preprocessor dependency is added (Sass, LESS, Stylus). No client-side JavaScript framework dependency is added (React, Vue, Svelte, Lit, Solid, Preact, Alpine, Petite Vue, Stimulus, HTMX, or similar).
- [ ] PostCSS and autoprefixer are not added as direct dependencies. They may exist transitively through Vite's defaults; they are not configured by this project.
- [ ] `pnpm install` completes successfully; `pnpm-lock.yaml` is present and committed.
- [ ] `pnpm build` produces a `dist/` directory with `index.html` and referenced assets.
- [ ] The built page’s **body** is empty of user-visible content (no placeholder copy or decorative UI); smoke checks may still assert the string **`Vite baseline`** appears in the HTML source (e.g. `<title>`).
- [ ] `Dockerfile` at repo root builds successfully. The resulting image, run as `docker run -p 8080:8080 <image>`, returns **HTTP 200** to `GET /` with a body containing the string **`Vite baseline`** (e.g. in the HTML source).
- [ ] Final runtime image serves static files only (no Node runtime, no `node_modules`, no source).
- [ ] [`sdd/specs/vite-baseline/provenance.md`](./provenance.md) exists, documenting actions taken, validation performed, artifacts produced, and any deviations from this spec, per the *Provenance* section of [`architecture.md`](../../context/architecture.md).

## Out of scope

- Product features, the content corpus under `sdd/content/`, multiple pages or routes beyond the single entry, and the corpus-driven build pipeline described in [`architecture.md`](../../context/architecture.md) (*The build pipeline* onward). Those are **target** capabilities, not in scope for vite-baseline.
- Full implementation of [`sdd/context/design-system.md`](../../context/design-system.md): tokens, components, motion catalogue, sleeves, idioms.
- TLS, authentication, persistence, observability, Playwright end-to-end tests against feature behaviour.
- Any framework, preprocessor, or styling tool outside the plain-CSS / vanilla-TypeScript / Vite stack. The list of permanent prohibitions in [`architecture.md`](../../context/architecture.md) is exhaustive and is not modified by this spec or any subsequent spec.

## Notes

- **vite-baseline** establishes the **canonical** static-app toolchain for this product. It is the project's first implementation step. The corpus-driven build and multi-page `dist/` layout in [`architecture.md`](../../context/architecture.md) land in a **later** feature spec under `sdd/specs/` (see *Implementation status*); when that work ships it will replace some structural choices made here (single root `index.html`, `pnpm build` invoking `vite build` directly). The baseline's *toolchain* (pnpm, Vite, TypeScript, plain CSS, Docker/nginx) persists; *application shape* evolves.
- Where this spec and [`architecture.md`](../../context/architecture.md) appear to disagree, architecture.md is authoritative. Please raise the discrepancy in `provenance.md` and update both documents to be congruent rather than implementing toward an inconsistent reading.
