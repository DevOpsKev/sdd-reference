# Vite baseline — scaffold, single page, Docker

## Intent

Establish the baseline **static web application toolchain** for this repository: **pnpm**, **Vite**, **TypeScript** (strict), **HTML with Tailwind CSS and DaisyUI**, and a **multi-stage Docker image** that serves only the production build from **nginx** on port **8080**. Output must align with [`.context/architecture.md`](../../../.context/architecture.md).

This spec is an **explicit styling baseline**: it adopts **Tailwind CSS** and **DaisyUI** so utility-first styling and accessible UI primitives are available from day one. It still produces **scaffolding and a minimal placeholder page**, not product UI or the full design system.

## References

- [`.context/architecture.md`](../../../.context/architecture.md) — package manager, Vite, TS, `dist/`, Docker/nginx/port 8080. Default context prefers plain CSS; **this spec overrides** that for styling by requiring Tailwind + DaisyUI (consistent with “unless a spec explicitly justifies…”).

Ignore [`.context/design-system.md`](../../../.context/design-system.md) for breadth of work: keep **light** presentation only (baseline layout/typography via utilities/components). A later spec will implement tokens and full visual rules.

## Requirements

### Toolchain

- **pnpm** — Respect `packageManager` in [`package.json`](../../../package.json); produce or update **`pnpm-lock.yaml`** so installs are reproducible (including in Docker).
- **Vite** — Vanilla **HTML + TypeScript** app (no React, Vue, Svelte, or other UI frameworks). **Tailwind CSS** must be wired through Vite using the approach recommended for the installed **Tailwind major version** (for example the official Vite plugin or PostCSS pipeline per current Tailwind docs).
- **Tailwind CSS** — Configured with **`content`** (or equivalent scanner paths) covering root HTML entry point(s), `src/**/*.{html,ts,js}`, and any other paths where class names appear, so production CSS is tree-shaken correctly.
- **DaisyUI** — Installed and registered as a **Tailwind plugin** per [DaisyUI’s installation docs](https://daisyui.com/) for your Tailwind/DaisyUI versions. Enable at least one **DaisyUI theme** (default or named) so components render with intended colours.
- **TypeScript** — `strict` enabled.
- **Scripts** in root `package.json` at minimum:
  - `"dev"` → `vite` (development server).
  - `"build"` → `vite build` (output to `dist/`).
  - Optional: `"preview"` → `vite preview`.

Operators run **`pnpm install`**, **`pnpm dev`**, and **`pnpm build`**; pnpm runs the scripts above.

### Source layout (conceptual)

- Single HTML entry at repository root per Vite convention (e.g. `index.html`).
- One TypeScript entry (e.g. `src/main.ts`) that imports the **global stylesheet** (e.g. `src/style.css`) where Tailwind/DaisyUI layers are pulled in per upstream patterns for your Tailwind version.
- **`vite.config.ts`** at repo root — must include Tailwind integration (and any path aliases if needed).

### CSS / UI

- **Minimal**: use Tailwind utilities and/or light DaisyUI markup for readable defaults (layout, typography). No implementation of the full design-system token set from `.context/design-system.md`.
- The placeholder must **exercise the stack**: the visible page should use **at least one DaisyUI component class or pattern** (for example a `btn`, `card`, or `navbar` snippet) so it is obvious Tailwind + DaisyUI are active — not only generic Tailwind spacing/colour classes.

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

- [ ] Root `package.json` includes `vite`, `typescript`, **`tailwindcss`**, **`daisyui`**, and any peer/dev packages required by the chosen Tailwind ↔ Vite integration (and minimal typings, e.g. `@types/node` if required), with scripts `dev` and `build` as above.
- [ ] Tailwind and DaisyUI are configured at the repo root in the manner appropriate for the installed versions (for example `tailwind.config` / `@config`, Vite plugin, and/or PostCSS files — follow upstream docs; filenames may vary by major version).
- [ ] `pnpm install` completes successfully; `pnpm-lock.yaml` is present and committed.
- [ ] `pnpm build` produces a `dist/` directory with `index.html` and referenced assets; built CSS includes evidence of DaisyUI (not an empty or unstyled bundle).
- [ ] Placeholder uses at least one **DaisyUI** class or component pattern as described under **CSS / UI**.
- [ ] `Dockerfile` at repo root builds and runs; `GET /` returns **200** and a body containing **`Vite baseline`**.
- [ ] Final runtime image serves static files only (no Node server at runtime).
- [ ] `.sdd/provenance/vite-baseline/provenance.md` exists (created or overwritten per agent rules), documenting actions, validation, and artifacts from this run.

## Out of scope

- Product features, radar data, JSON catalogues, multiple pages/routes beyond the single entry.
- Full [`.context/design-system.md`](../../../.context/design-system.md) implementation (tokens, components, motion catalogue).
- TLS, authentication, persistence, observability, Playwright/e2e (unless a follow-up spec adds them).
- UI frameworks (React, Vue, Svelte, etc.) and **Sass/LESS** unless a later spec adds them.

### Notes

- The [`helloworld`](../helloworld/spec.md) spec targets a **different** layout (`app/`, no Vite). Implementing **vite-baseline** establishes the **canonical** static-app toolchain for this product and **replaces** root-level Docker/static layout from other specs if both were applied to the same branch; resolve overlaps manually if needed.
