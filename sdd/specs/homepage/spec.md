# Homepage — Tech Sovereignty Radar

## Intent

Implement the **marketing homepage** for Tech Sovereignty Radar as a **long-scrolling, editorial** static page: masthead, asymmetric hero, thesis pull-quote, methodology section, rings and quadrants, illustrative sample radar, closing thesis, final CTA with subscribe placeholder, and footer. **Visual language** matches [sdd/context/design-system.md](../../context/design-system.md) and reuses the **design baseline** implementation (existing `src/styles/` tokens and components). **All user-visible copy** is defined in [copy.yaml](copy.yaml) and must be used **verbatim**.

The page should feel like the cover of a serious quarterly publication: confident, quiet, text-led; **not** a typical SaaS launch page.

## Prerequisites

- **[Design baseline](../design-baseline/spec.md)** is implemented: Tailwind + DaisyUI (themed per design system), `src/styles/` (tokens, overrides, layout as needed), **`design-reference.html`**, and Vite **multi-page** config with `index.html` as an entry.
- This spec **replaces** the **contents** of **`index.html`** with the full homepage. **Do not** remove **`design-reference.html`** or its build input; keep the design reference available.
- If this spec and the design system disagree, the **design system** wins; record in **provenance** if you had to choose.

## References

- [copy.yaml](copy.yaml) — **Authoritative** strings for the page; do not paraphrase.
- [radar-sample.svg](radar-sample.svg) — **Canonical** sample radar diagram; use this file’s geometry (inline or copied into build output) unless adjusting only for responsiveness—**do not** invent different dot positions.
- [sdd/context/design-system.md](../../context/design-system.md) — Typography, grid, colour discipline, anti-patterns.
- [sdd/context/product.md](../../context/product.md) — Rings, quadrants, product alignment (cross-check with copy).

## Requirements

### Toolchain and files

- **Vite** vanilla + TypeScript; extend **`index.html`** only for this homepage entry (same script/style pipeline as the rest of the app).
- Add **`src/styles/homepage.css`** (or similarly named) for homepage-specific layout; **import** existing token/component layers first—**avoid duplicating** CSS variables already defined in **`tokens.css`**.
- Ship [**radar-sample.svg**](radar-sample.svg): either **inline** in `index.html` or **`import`** via Vite into the bundle; the rendered radar must be **centred**, **max-width 600px**, and visually match the sibling SVG (four grey rings, axes, twelve coloured dots with ring semantics, quadrant labels, ring labels).

### Layout — section order (DOM)

Implement sections **top to bottom** in this exact order:

1. **Masthead** — Thin band; wordmark left (**copy.yaml** `masthead.wordmark`). Navigation links right (**tracked uppercase**, `--type-micro`-equivalent styling): labels and `href` from **copy.yaml**. **1px rule** (`--rule-strong` or `--rule`) full width below masthead. No logo mark, no shadow, **no** tinted navbar background.
2. **Hero** — **Asymmetric**: primary content occupies roughly **columns 1–8** on `lg`; **columns 9–12** are mostly empty except **one** top-aligned **mono** metadata block (**copy.yaml** `hero.hero_metadata.lines`). Left block: eyebrow, display title, value proposition paragraph, primary button + secondary text link (`href` from copy). Primary button: **accent** fill / inverse text, **square corners** (`--radius-1`), **no shadow**—single confident CTA (design-system primary button).
3. **Thesis** — Full-width **heavy horizontal rule** (`--rule-strong`). One **pull-quote** (`copy.yaml` `thesis.pull_quote`) at large heading scale; **attribution** line in mono micro-type (`thesis.attribution`). Narrow vertical footprint (~200px intent—not pixel-perfect).
4. **Why different** — Two-column: **~60%** main column (`why_different.body_paragraphs`), **~30%** side panel (`why_different.factors_panel`) with numbered factors—**no icons**, numbers + title + gloss only; muted ink for gloss.
5. **Rings** — Eyebrow, heading, **four-column** grid (`lg`), two (`md`), one (`sm`). Each card: **small coloured square** (ring fill from design system) **top-left**, ring **name**, **description**. **Whitespace** separates cards; **no** card borders/fills for separation. **Ring hues are the only decorative colour** in this section.
6. **Quadrants** — Same grid rhythm as rings. **No** coloured squares. Each card: **mono label** (`label_mono`), **full name**, **description**.
7. **Preview / radar** — Eyebrow, heading, framing paragraph (`preview.body`), then radar (**radar-sample.svg**). **Caption** exactly **`preview.figure_caption`** from copy.
8. **Closing thesis** — Single centred pull-quote line (`closing_thesis.pull_quote`).
9. **Final CTA** — Eyebrow (`final_cta.eyebrow`), heading (`final_cta.heading`), primary button, subscribe row (`final_cta.subscribe_note`) with **non-functional** email input ( **`disabled`** submit or `method="get"` + `#` with README note); **no backend**—see Out of scope.
10. **Footer** — **1px rule** above. Three columns on `lg`: `footer.left`, `footer.centre`, `footer.right` (mono micro-type). Secondary link row: `footer.links`.

### Editorial and colour discipline

- **Ink on paper:** mostly **`--surface`** / **`--ink`**; **ring colours** appear **only** as: (a) small squares in the rings section, (b) radar dots in **radar-sample.svg**, (c) optional **subtle** accent on hero metadata only if it stays restrained—**no** extra rainbow accents elsewhere.
- **Primary actions:** **`--accent`** / **`--accent-hover`** navy primary button (design system); links default to ink/accent per doc—not rainbow hover styles.
- **Type:** **Inter** + **JetBrains Mono** only; **tabular figures** where numbers align.

### Vertical rhythm

- At least **`--space-9`** (96px) vertical spacing **between major sections** (more around radar and pull-quotes).

### Accessibility

- Skip-to-content link as required by design system.
- Headings in logical order; ring/quadrant meaning **not conveyed by colour alone** (names + text present).

### Provenance

Create or overwrite **`sdd/specs/homepage/provenance.md`**.

## Acceptance criteria

- [ ] **`index.html`** implements all **ten** sections **in order** with semantic landmarks (`header`, `main`, `footer`, `section`, headings).
- [ ] All prose, labels, buttons, captions, and footer strings match **[copy.yaml](copy.yaml)** exactly (including punctuation and apostrophe style).
- [ ] Styles **reuse** design baseline tokens/components; homepage-specific rules live in dedicated CSS module(s), **no** duplicated token hex unless unavoidable (document in provenance).
- [ ] **radar-sample.svg** appears centred, **max-width 600px**, semantically equivalent geometry to the sibling file (twelve dots, four rings, axes, labels).
- [ ] **Masthead** has wordmark left, nav right, **1px** rule below; nav uses **uppercase micro** styling.
- [ ] **Hero** is asymmetric with empty right band except mono metadata block; primary button matches **square**, **no shadow**, accent styling.
- [ ] **Ring colour discipline** respected (ring hues only where allowed above).
- [ ] Subscribe area is **non-functional** from a backend perspective (no API calls).
- [ ] `pnpm build` succeeds; no **console errors** on load.
- [ ] `sdd/specs/homepage/provenance.md` exists for this run.

## Out of scope

- Backend, authentication, real mailing-list signup, RSS generation.
- **Dark mode**, **i18n**.
- Replacing or deleting **`design-reference.html`**.
- Interactive radar filtering, real **JSON** data or **v1** editorial placements.
- Playwright/e2e unless a later spec adds them.
