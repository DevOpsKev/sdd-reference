# Design baseline — design system in CSS, motion in TS, review page

## Intent

Implement the project **visual system** from [`.context/design-system.md`](../../../.context/design-system.md) as **plain CSS** (custom properties, layout, components) and **TypeScript** only where **motion or interaction** cannot be satisfied cleanly with CSS alone, while respecting the design system’s **Motion**, **Accessibility**, and **Anti-patterns** rules.

Update **`index.html`** into a single **developer review page**: structured sections that exercise **representative** patterns so a developer can visually verify tokens, typography, components, and motion in one place. This is **not** the product homepage or radar UI.

## Prerequisites

Assume **[vite-baseline](../vite-baseline/spec.md)** (or equivalent) has already landed: Vite, strict TypeScript, root `index.html`, `pnpm` scripts, and optional Docker serving **`dist/`**. This spec **extends** that app; do not replace the toolchain with a framework.

If `vite-baseline` outputs are missing, implement minimal missing pieces only as needed to satisfy this spec’s acceptance criteria (still vanilla Vite + TS per [`.context/architecture.md`](../../../.context/architecture.md)).

## References

- [`.context/design-system.md`](../../../.context/design-system.md) — **Normative** for tokens, typography, grid, components, motion, voice (sample copy on the review page may use short neutral placeholders; do not paraphrase the product spec).
- [`.context/architecture.md`](../../../.context/architecture.md) — Vite, vanilla HTML/CSS/TS, `dist/`, no new UI framework.

## Requirements

### CSS

- **Custom properties** for colours, type scale, spacing, grid/radius/shadow, and **motion** tokens, aligned to the design system (no ad-hoc hex outside documented exceptions).
- **Google Fonts** — Load **Inter** and **JetBrains Mono** using the `<link>` pattern from the design system (or equivalent single bundle).
- **`font-feature-settings`** including **`tnum`** on appropriate roots per the doc.
- Organise styles into predictable modules (e.g. under `src/styles/`): at minimum separate **tokens** from **base** from **component/layout** helpers; exact filenames are left to the implementer.
- No Tailwind, Sass, or component frameworks unless already approved elsewhere.

### TypeScript (motion and interaction)

- **Prefer CSS** for transitions: use **`var(--motion-*)`** durations/easing; only **`opacity`**, **`transform`**, **`background-color`**, **`border-color`** as transition targets unless the design system explicitly allows otherwise.
- Use **TypeScript** where script adds clear value: e.g. **`prefers-reduced-motion`** coordination, focus traps not needed for this page, or small demos that need **`requestAnimationFrame`** / attribute-driven state. Do **not** add scroll-jacking, parallax, elastic animations, or forbidden curves from the design system.

### Review page (`index.html`)

The document must be **semantic** (`skip` link, `main`, `section`, headings) and include **distinct labeled sections** so reviewers can scan top-to-bottom. Minimum content:

| Section | Must demonstrate |
|--------|-------------------|
| Document chrome | `<title>` includes **`Design baseline`**; skip-to-content link. |
| Colour | Surfaces, ink steps, rules, **brand accent**; **ring** fill/edge as swatches (not as full-bleed decorative backgrounds). |
| Typography | Samples for each **type token** in the doc (display through mono variants as applicable). |
| Grid / layout | A short **asymmetric** layout example (e.g. label + content columns) per design-system **Layout**; not a long centered marketing column. |
| Buttons | Primary, secondary, tertiary, disabled; focus style. |
| Inputs | Label, input, helper, error state. |
| Table | Compact table with **tabular numerals** in at least one column. |
| Card | Bordered card per **Cards** section. |
| Motion | At least one **CSS transition** using motion tokens; if JS is used, a small demo that **respects** `prefers-reduced-motion: reduce`. |
| Filter chips (optional) | If included, match **Filter chips** / ring rules. |

The page is allowed to be long; **do not** add additional routes or SPAs.

### Provenance

Per agent rules, create or overwrite **`.sdd/provenance/design-baseline/provenance.md`**.

## Acceptance criteria

- [ ] `pnpm build` succeeds; `pnpm dev` shows the review page with no **console errors** on load.
- [ ] `index.html` (and any linked assets) implements the **section table** above; the string **`Design baseline`** appears in `<title>` or an `h1`.
- [ ] Design-system **forbidden** items (e.g. glassmorphism, gradient decoration, pill radius abuse, disallowed fonts) are not used.
- [ ] **Motion** rules from the design system are followed; reduced-motion behaviour is **observable** (transitions damped or disabled where required).
- [ ] `.sdd/provenance/design-baseline/provenance.md` exists and documents actions, validation, and artifacts for this run.

## Out of scope

- Real product **homepage** copy, **radar** canvas, data JSON, versioned release UI.
- **i18n**, **dark mode** (v1 design system does not support dark mode).
- New bundler or framework; **end-to-end** tests (Playwright) unless a follow-up spec adds them.
- Full **content voice** sample pages (use short placeholder text; do not build marketing narrative).

### Notes

- If this spec and [`.context/design-system.md`](../../../.context/design-system.md) disagree, the **design system** wins; record the conflict in **provenance** and follow the design system.
- The review page is for **engineering verification**; keep copy minimal and neutral.
