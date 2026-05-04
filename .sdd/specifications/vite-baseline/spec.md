# Vite baseline — scaffold, single page, Docker

## Intent

Establish the baseline **static web application toolchain** for this repository: **pnpm**, **Vite**, **TypeScript** (strict), **vanilla HTML/CSS**, and a **multi-stage Docker image** that serves only the production build from **nginx** on port **8080**. Output must align with [`.context/architecture.md`](../../../.context/architecture.md).

This spec produces **scaffolding and a minimal placeholder page**, not product UI or the full design system.

## References

- [`.context/architecture.md`](../../../.context/architecture.md) — package manager, Vite, TS, vanilla UI, `dist/`, Docker/nginx/port 8080.

Ignore [`.context/design-system.md`](../../../.context/design-system.md) for breadth of work: use **light** CSS only (baseline layout/typography). A later spec will implement tokens and full visual rules.

## Requirements

### Toolchain

- **pnpm** — Respect `packageManager` in [`package.json`](../../../package.json); produce or update **`pnpm-lock.yaml`** so installs are reproducible (including in Docker).
- **Vite** — Vanilla project (no React, Vue, Svelte, Tailwind, Sass, or CSS preprocessor unless rolled into Vite’s default pipeline without adding Tailwind/Sass plugins).
- **TypeScript** — `strict` enabled.
- **Scripts** in root `package.json` at minimum:
  - `"dev"` → `vite` (development server).
  - `"build"` → `vite build` (output to `dist/`).
  - Optional: `"preview"` → `vite preview`.

Operators run **`pnpm install`**, **`pnpm dev`**, and **`pnpm build`**; pnpm runs the scripts above.

### Source layout (conceptual)

- Single HTML entry at repository root per Vite convention (e.g. `index.html`).
- One TypeScript entry (e.g. `src/main.ts`) that imports a **small** stylesheet (e.g. `src/style.css`).
- **`vite.config.ts`** at repo root as needed for paths/build options.

### CSS

- **Minimal**: readable defaults only (e.g. font stack, margin reset light-touch, body layout). No implementation of the full design-system token set.

### Docker

- **`Dockerfile` at repository root** — Multi-stage build acceptable and encouraged:
  - Build stage: install dependencies with pnpm, run `pnpm build`, produce `dist/`.
  - Runtime stage: **`nginx:alpine`** (or equivalent minimal static server) copies **only** the contents of `dist/` (and any minimal nginx config required). **No** `node_modules`, source tree, or package manager in the final image.
- Container listens on **8080**; `docker run -p 8080:8080 <image>` serves the app at `http://localhost:8080/`.
- Do not copy secrets, `.env` with keys, or git metadata into the image.

### Page content (placeholder)

- Single route `/`.
- The served HTML must include the exact string **`Vite baseline`** in the document (e.g. in `<title>` or visible text) so smoke checks are unambiguous and distinct from the `helloworld` spec’s phrasing.

## Acceptance criteria

- [ ] Root `package.json` includes `vite` and `typescript` (and any minimal typings, e.g. `@types/node` if required) as devDependencies, with scripts `dev` and `build` as above.
- [ ] `pnpm install` completes successfully; `pnpm-lock.yaml` is present and committed.
- [ ] `pnpm build` produces a `dist/` directory with `index.html` and referenced assets.
- [ ] `Dockerfile` at repo root builds and runs; `GET /` returns **200** and a body containing **`Vite baseline`**.
- [ ] Final runtime image serves static files only (no Node server at runtime).

## Out of scope

- Product features, radar data, JSON catalogues, multiple pages/routes beyond the single entry.
- Full [`.context/design-system.md`](../../../.context/design-system.md) implementation (tokens, components, motion catalogue).
- TLS, authentication, persistence, observability, Playwright/e2e (unless a follow-up spec adds them).
- UI frameworks and Tailwind/Sass/component libraries.

### Notes

- The [`helloworld`](../helloworld/spec.md) spec targets a **different** layout (`app/`, no Vite). Implementing **vite-baseline** establishes the **canonical** static-app toolchain for this product and **replaces** root-level Docker/static layout from other specs if both were applied to the same branch; resolve overlaps manually if needed.
