# Design baseline — design system via Tailwind & DaisyUI, motion in TS, design reference page

## Intent

Implement the project **visual system** from [`sdd/context/design-system.md`](../../context/design-system.md) using **Tailwind CSS** and **DaisyUI** as the primary styling layer, with **CSS custom properties** as the token source of truth and **TypeScript** only where **motion or interaction** cannot be satisfied cleanly with CSS alone. Follow the design system’s **Implementation (Tailwind CSS & DaisyUI)** section, **Motion**, **Accessibility**, and **Anti-patterns** rules.

Add a **dedicated** page **`design-reference.html`** at the project root: a **developer-only** overview of tokens and components for a **quick visual check** whenever design rules change. Keep **`index.html`** as the **minimal** app shell (e.g. product entry or vite-baseline placeholder) — **do not** put the full design inventory in `index.html`. A short link from `index.html` to `design-reference.html` is allowed and recommended.

## Prerequisites

Assume **[vite-baseline](../vite-baseline/spec.md)** has landed: Vite, strict TypeScript, **Tailwind CSS**, **DaisyUI**, root `index.html`, `pnpm` scripts, global stylesheet entry, and optional Docker serving **`dist/`**. This spec **extends** that app; do not replace the toolchain with React, Vue, Svelte, or another UI framework.

If `vite-baseline` outputs are missing, implement minimal missing pieces only as needed to satisfy this spec’s acceptance criteria (still Vite + vanilla HTML + TS per [`sdd/context/architecture.md`](../../context/architecture.md)).

## References

- [`sdd/context/design-system.md`](../../context/design-system.md) — **Normative** for tokens, typography, grid, components, motion, voice. **Must** implement **Implementation (Tailwind CSS & DaisyUI)** (token mapping, DaisyUI theming, grid spacing). Sample copy on the reference page may use short neutral placeholders; do not paraphrase the product spec.
- [`sdd/context/architecture.md`](../../context/architecture.md) — Tailwind + DaisyUI baseline, `src/styles/` layering, MPA, `dist/`.

## Requirements

### Vite (multi-page)

- Add **`design-reference.html`** as a **second** HTML entry at the **repository root** (sibling to `index.html`).
- Configure **Vite** so both `index.html` and `design-reference.html` are build inputs (Multi-Page App / MPA), e.g. `build.rollupOptions.input` including both files, so `pnpm build` emits both in **`dist/`** and `pnpm dev` serves both (e.g. `/design-reference.html`). Shared CSS/TS may be imported from each page’s script module as needed.

### Tokens, Tailwind, and DaisyUI

- **Custom properties** — Define colours, type scale, spacing, grid/radius/shadow, and **motion** tokens under **`src/styles/`** (or equivalent), aligned to the design system (no ad-hoc hex outside documented exceptions). Expose them to Tailwind via **`theme.extend`**, **`@theme`**, or the pattern described in the design system so utilities mirror `--accent`, `--surface`, `--ink`, `--type-*`, `--space-*`, `--motion-*`, etc.
- **DaisyUI** — Configure at least **one custom theme** derived from those tokens (`primary`, `base-100`, `base-content`, borders, radii) per **Implementation (Tailwind CSS & DaisyUI)**. Product and reference surfaces must **not** rely on stock DaisyUI “candy” themes as the default skin. Override component styles where DaisyUI defaults conflict with **Components**, **Border radius**, or **Motion** in the design system.
- **Google Fonts** — Load **Inter** and **JetBrains Mono** using the `<link>` pattern from the design system (or equivalent single bundle). The reference page must load the same system the app uses.
- **`font-feature-settings`** including **`tnum`** on appropriate roots per the doc.
- **Structure** — Keep predictable modules (e.g. `tokens.css`, `base.css`, `components.css`, `layout.css`) plus Tailwind entry; exact filenames are left to the implementer. Prefer **Tailwind utilities** for layout and spacing that respect the **4px baseline** and **12-column** intent; use **`src/styles/`** for token exports and overrides that are awkward as inline utilities.

### TypeScript (motion and interaction)

- **Prefer CSS** for transitions: use **`var(--motion-*)`** durations/easing; only **`opacity`**, **`transform`**, **`background-color`**, **`border-color`** as transition targets unless the design system explicitly allows otherwise.
- Use **TypeScript** where script adds clear value: e.g. **`prefers-reduced-motion`** coordination, or small demos that need **`requestAnimationFrame`** / attribute-driven state. Do **not** add scroll-jacking, parallax, elastic animations, or forbidden curves from the design system.

### `index.html`

- Remains a **small** entry (title, short copy, root mount if used). **No** full design-system gallery here.

### Design reference page (`design-reference.html`)

The document must be **semantic** (`skip` link, `main`, `section`, headings) and include **distinct labeled sections** so reviewers can scan top-to-bottom. Minimum content:

| Section | Must demonstrate |
|--------|-------------------|
| Document chrome | `<title>` includes **`Design baseline`**; skip-to-content link. |
| Theme / tooling | Short note or visual proof that **DaisyUI** is driven by the custom theme (e.g. primary button uses **`--accent`**, surfaces match **`--surface`** — not default purple/indigo Tailwind defaults). |
| Colour | Surfaces, ink steps, rules, **brand accent**; **ring** fill/edge as swatches (not as full-bleed decorative backgrounds). |
| Typography | Samples for each **type token** in the doc (display through mono variants as applicable). |
| Grid / layout | A short **asymmetric** layout example (e.g. label + content columns) per design-system **Layout**; not a long centered marketing column. Use Tailwind layout utilities aligned to spacing tokens. |
| Buttons | Primary, secondary, tertiary, disabled; focus style (may use DaisyUI `btn` variants **after** theming/overrides). |
| Inputs | Label, input, helper, error state. |
| Table | Compact table with **tabular numerals** in at least one column. |
| Card | Bordered card per **Cards** section (DaisyUI `card` allowed if appearance matches the doc). |
| Motion | At least one **CSS transition** using motion tokens; if JS is used, a small demo that **respects** `prefers-reduced-motion: reduce`. |
| Filter chips (optional) | If included, match **Filter chips** / ring rules. |

The reference page is allowed to be long. **Do not** add a SPA router; at most these two static HTML entry points plus shared assets.

### Provenance

Per agent rules, create or overwrite **`sdd/specs/design-baseline/provenance.md`**.

## Acceptance criteria

- [ ] `pnpm build` succeeds; `dist/` includes **`design-reference.html`** (and `index.html`) with no **console errors** on first load of the reference page in `pnpm dev`.
- [ ] **`design-reference.html`** (and its linked assets) implements the **section table** above; the string **`Design baseline`** appears in that page’s `<title>` or an `h1`.
- [ ] **`index.html`** stays minimal and does **not** duplicate the full section inventory (that lives only on **`design-reference.html`**).
- [ ] Tailwind and DaisyUI are **wired and themed** per [vite-baseline](../vite-baseline/spec.md) and **Implementation (Tailwind CSS & DaisyUI)** in [`sdd/context/design-system.md`](../../context/design-system.md) (tokens mapped; custom DaisyUI theme; no stock candy theme as product default).
- [ ] Design-system **forbidden** items (e.g. glassmorphism, gradient decoration, pill radius abuse, disallowed fonts, Tailwind/DaisyUI anti-patterns in the design system) are not used.
- [ ] **Motion** rules from the design system are followed; reduced-motion behaviour is **observable** on the reference page where transitions apply.
- [ ] `sdd/specs/design-baseline/provenance.md` exists and documents actions, validation, and artifacts for this run.

## Out of scope

- Real product **homepage** copy, **radar** canvas, data JSON, versioned release UI.
- **i18n**, **dark mode** (v1 design system does not support dark mode).
- New bundler or UI framework (React, Vue, Svelte); **end-to-end** tests (Playwright) unless a follow-up spec adds them.
- Full **content voice** sample pages (use short placeholder text; do not build marketing narrative).
- **Sass/LESS** unless a later spec adds them.

### Notes

- If this spec and [`sdd/context/design-system.md`](../../context/design-system.md) disagree, the **design system** wins; record the conflict in **provenance** and follow the design system.
- **`design-reference.html`** is for **engineering verification** against the design system; keep copy minimal and neutral. When design rules change, open this file in dev or production build to compare quickly.
