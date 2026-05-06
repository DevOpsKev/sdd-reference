# Vite baseline — scaffold, single page, Docker

## Intent

Establish the baseline **static web application toolchain** for this repository: **pnpm**, **Vite**, **TypeScript** (strict), **HTML with plain CSS** (no Tailwind, DaisyUI, or other CSS frameworks unless a later spec adds them), and a **multi-stage Docker image** that serves only the production build from **nginx** on port **8080**. Output must align with [`sdd/context/architecture.md`](../../context/architecture.md) when that file defines constraints.

This spec is a **minimal styling baseline**: hand-authored CSS for readable layout and typography on a placeholder page. It does **not** implement the full design system in `sdd/context/design-system.md`.

## References

- [`sdd/context/architecture.md`](../../context/architecture.md) — package manager, Vite, TS, `dist/`, Docker/nginx/port 8080.

Ignore [`sdd/context/design-system.md`](../../context/design-system.md) for breadth of work: keep **light** presentation only. A later spec will implement tokens and full visual rules.

## Requirements

### Toolchain

- **pnpm** — Respect `packageManager` in [`package.json`](../../../package.json); produce or update **`pnpm-lock.yaml`** so installs are reproducible (including in Docker).
- **Vite** — Vanilla **HTML + TypeScript** app (no React, Vue, Svelte, or other UI frameworks). Global styles are **plain CSS** imported from TypeScript (e.g. `src/main.ts` imports `src/style.css`). Do **not** add Tailwind CSS, DaisyUI, PostCSS-only pipelines for Tailwind, or similar CSS frameworks unless a follow-up spec requires them.
- **TypeScript** — `strict` enabled.
- **Scripts** in root `package.json` at minimum:
  - `"dev"` → `vite` (development server).
  - `"build"` → `vite build` (output to `dist/`).
  - Optional: `"preview"` → `vite preview`.

Operators run **`pnpm install`**, **`pnpm dev`**, and **`pnpm build`**; pnpm runs the scripts above.

### Source layout (conceptual)

- Single HTML entry at repository root per Vite convention (e.g. `index.html`).
- One TypeScript entry (e.g. `src/main.ts`) that imports the **global stylesheet** (e.g. `src/style.css`) containing normal CSS rules (no `@tailwind` / framework directives).
- **`vite.config.ts`** at repo root — standard Vite config for the vanilla app (path aliases optional).

### CSS / UI

- **Minimal**: hand-authored CSS for readable defaults (layout, typography, contrast). No implementation of the full design-system token set from `sdd/context/design-system.md`.
- The placeholder must show intentional styling: at least one **custom CSS class** (not inline-only) applied to visible content so it is obvious real CSS is in use (for example a `.hero`, `.card`, or `.tagline` rule).

### Docker

- **`Dockerfile` at repository root** — Multi-stage build acceptable and encouraged:
  - Build stage: install dependencies with pnpm, run `pnpm build`, produce `dist/`.
  - Runtime stage: **`nginx:alpine`** (or equivalent minimal static server) copies **only** the contents of `dist/` (and any minimal nginx config required). **No** `node_modules`, source tree, or package manager in the final image.
- Container listens on **8080**; `docker run -p 8080:8080 <image>` serves the app at `http://localhost:8080/`.
- Do not copy secrets, `.env` with keys, or git metadata into the image.

### Page content (placeholder)

- Single route `/`.
- The served HTML must include the exact string **`Vite baseline`** in the document (e.g. in `<title>` or visible text) so smoke checks are unambiguous.

## Acceptance criteria

- [ ] Root `package.json` includes `vite`, `typescript`, and scripts `dev` and `build` as above. **No** `tailwindcss`, **no** `daisyui`, **no** `postcss` or `autoprefixer` unless required for a non-Tailwind reason documented in provenance (default: omit them).
- [ ] `pnpm install` completes successfully; `pnpm-lock.yaml` is present and committed when the lockfile is used in this repo.
- [ ] `pnpm build` produces a `dist/` directory with `index.html` and referenced assets; built output includes CSS derived from the hand-authored stylesheet (not an empty or unstyled page).
- [ ] Placeholder uses at least one **custom CSS class** on visible content as described under **CSS / UI**.
- [ ] `Dockerfile` at repo root builds and runs; `GET /` returns **200** and a body containing **`Vite baseline`**.
- [ ] Final runtime image serves static files only (no Node server at runtime).
- [ ] `sdd/specs/vite-baseline/provenance.md` exists (created or overwritten per agent rules), documenting actions, validation, and artifacts from this run.

## Out of scope

- Product features, radar data, JSON catalogues, multiple pages/routes beyond the single entry.
- Full [`sdd/context/design-system.md`](../../context/design-system.md) implementation (tokens, components, motion catalogue).
- TLS, authentication, persistence, observability, Playwright/e2e (unless a follow-up spec adds them).
- UI frameworks (React, Vue, Svelte, etc.), **Tailwind / DaisyUI / utility CSS frameworks**, and **Sass/LESS** unless a later spec adds them.

### Notes

- **vite-baseline** establishes the **canonical** static-app toolchain for this product. If another spec later adds overlapping root-level Docker or static layout, resolve conflicts manually so one coherent setup remains.
