# Global CSS — tokens, reset, base, validator

## Intent

Establish the project's **global CSS foundation**. This spec implements three CSS files (`tokens.css`, `reset.css`, `base.css`) plus the entry point that imports them (`index.css`), self-hosts the project's **webfonts**, and introduces a **build-time validator** that keeps [`sdd/context/design-system.md`](../../context/design-system.md) and **`src/styles/tokens.css`** synchronised.

This is the **first styling spec**. It does **not** implement components, page-level layout, or idioms from the design system beyond what is genuinely global (custom properties, body defaults, font loading, base typography). Component CSS — stamps, tape, sharpie annotations, status indicators, the docket strip's structural rules, etc. — is the work of subsequent specs.

CSS sources in **this spec directory** are the **authoritative originals**. The implementing agent's job is to **copy** them to the target paths under `src/`, wire the build to use them, and implement the validator. **Do not edit the authoritative CSS files under this directory during implementation** except when a human is changing the spec itself. If a token value changes, update **`sdd/context/design-system.md`** (in the relevant `Token` table) and the files here **together**; then re-run implementation so `src/styles/tokens.css` stays byte-identical to the spec copy.

## References

- [`sdd/context/architecture.md`](../../context/architecture.md) — authoritative on the `src/styles/` layout, `src/public/` static assets, the build pipeline, and the validation triangle.
- [`sdd/context/design-system.md`](../../context/design-system.md) — canonical declaration of tokens, type, motion, idioms, and forbidden patterns.

## File mapping

Authoritative sources live in **this directory**. The implementing agent copies each file to the application path and verifies **byte identity** between source and destination.

| Source (this directory)           | Target (application)                    |
| --------------------------------- | --------------------------------------- |
| `tokens.css`                      | `src/styles/tokens.css`                 |
| `reset.css`                       | `src/styles/reset.css`                  |
| `base.css`                        | `src/styles/base.css`                   |
| `index.css`                       | `src/styles/index.css`                  |
| `fonts/special-elite-v20-latin-regular.woff2`   | `src/public/fonts/special-elite-v20-latin-regular.woff2`   |
| `fonts/anton-v27-latin-regular.woff2`           | `src/public/fonts/anton-v27-latin-regular.woff2`           |
| `fonts/stardos-stencil-v15-latin-regular.woff2` | `src/public/fonts/stardos-stencil-v15-latin-regular.woff2` |
| `fonts/stardos-stencil-v15-latin-700.woff2`     | `src/public/fonts/stardos-stencil-v15-latin-700.woff2`     |
| `fonts/permanent-marker-v16-latin-regular.woff2`| `src/public/fonts/permanent-marker-v16-latin-regular.woff2`|
| `fonts/jetbrains-mono-v24-latin-regular.woff2`  | `src/public/fonts/jetbrains-mono-v24-latin-regular.woff2`  |
| `fonts/jetbrains-mono-v24-latin-500.woff2`      | `src/public/fonts/jetbrains-mono-v24-latin-500.woff2`      |
| `fonts/jetbrains-mono-v24-latin-700.woff2`      | `src/public/fonts/jetbrains-mono-v24-latin-700.woff2`      |

## Requirements

### tokens.css

- Implements every custom property declared in **`design-system.md`** in a Markdown table whose **first column header is exactly `Token`** (trimmed), across **Paper, ink, accent**, **Type** (the **type scale** table only — not the *Voice / Family* table, whose first column is **`Voice`**), **Spacing and rhythm** (including **`--gutter`** and **`--page-max-width`**), and **Motion**.
- Custom property **names** match the design-system document **exactly** (e.g. `--paper`, `--ink`, `--type-section`, `--gutter`).
- Where the design-system declares **`clamp()`** (type scale, gutter), `tokens.css` carries the **same** `clamp()` strings.
- **`--dur-rise`** is **`650ms`** in both the design-system table and `tokens.css`; the validator performs a **normal string equality** check after the same whitespace normalisation as other tokens (no special-case logic).
- `tokens.css` contains **nothing other than** the `:root { ... }` block of custom properties and brief comments. **No** non-`:root` selectors, **no** `@font-face`, **no** resets, **no** `@media` in this file.

### reset.css

- A **minimal modern reset**: `box-sizing: border-box` on `*, *::before, *::after`; sensible default margin/padding removal; `body { min-height: 100vh; line-height: 1.5; -webkit-font-smoothing: antialiased; }`.
- **Lists:** Remove default list styling on **`ul[role="list"], ol[role="list"]`**. Do not strip semantics from lists that omit `role="list"` unless the design-system later says otherwise.
- **Replaced content:** `img, picture, video, canvas, svg { display: block; max-width: 100%; }`.
- **Form controls:** `input, button, textarea, select { font: inherit; }`.
- **`prefers-reduced-motion`:** Honour per the snippet in **design-system.md** *Motion* if not fully handled in `base.css` (at least one of the two files must implement the documented reduction).

The reset does **not** introduce opinionated typography — that is **`base.css`**.

### base.css

- **`@font-face`** for each family in the file mapping table, **`font-display: swap`**, **`url('/fonts/<exact-filename>.woff2')`** paths that **match the file mapping table basename exactly** (Vite serves `src/public/` from the site root once `publicDir` is set — see **Build wiring**). If you rename files under **`fonts/`**, update **`base.css`** and this table in the same change.
- **Body:** `background: var(--paper)`, `color: var(--ink)`, `font-family: 'Special Elite', Courier, monospace`, `font-size: 1rem`, `line-height: 1.55` (or values that match design-system body guidance if they differ slightly — document any deviation in `provenance.md`).
- **Paper grain and coffee-ring** per design-system *Paper, ink, accent*: implemented with **inline SVG data URIs** only (no extra network requests).
- **Headings `h1–h4`:** `font-family: 'Anton', sans-serif`, `font-weight: 400`, `letter-spacing: 0.04em`, `text-transform: uppercase`, `line-height: 0.95` (per spec intent; per-page overrides live in component CSS later).
- **Links:** Inherit colour; **2px solid `var(--ink)`** underline on **focus** with **2px** offset; no underline by default. Hover deferred to component CSS.
- **`.mono` utility:** `font-family: 'JetBrains Mono', ui-monospace, monospace` only — no other utilities in this spec.
- **`prefers-reduced-motion: reduce`:** Under the media query, set **`*, *::before, *::after`** to **`animation-duration: 0.01ms !important`** and **`transition-duration: 0.01ms !important`** (or equivalent documented in design-system).

`base.css` does **not** define page layouts, container widths, or component-specific styling beyond the above.

### index.css

Exactly:

```css
@import "./tokens.css";
@import "./reset.css";
@import "./base.css";
```

Order is **significant**. Later specs append **`@import`** lines **after** `base.css`.

### Webfonts

Five families, **woff2 only**, subsetted to **Latin and Latin Extended** where the family supports it (Hungarian diacritics in body copy such as “Soroksári út”). Font binaries live under **`fonts/`** here and are copied to **`src/public/fonts/`**. The implementing agent **does not generate** woff2 files; humans commit binaries under **`fonts/`** before implementation.

**Sourcing (humans):** Use [google-webfonts-helper](https://gwfh.mranftl.dev/): search each family, select the weights in the mapping table, choose **Latin** + **Latin Extended** where available, **Modern browsers** (woff2 only), download, then **rename** outputs to the **exact filenames** in the file mapping table above (gwfh’s default download names differ; the repo standard is the table basename). Optional local notes may live in **`README.md`** in this directory; **`spec.md` + authoritative `base.css`** define **`url()`** paths and copy targets.

**Committed names in this repo:** Filenames follow the **`-vNN-latin-…`** pattern (example: `special-elite-v20-latin-regular.woff2`). **`base.css`** in this directory must stay in lockstep with those names.

### Build wiring

- **`src/main.ts`** imports **`./styles/index.css`** (replacing or extending the vite-baseline `style.css` import as needed).
- **`vite.config.ts`** sets **`publicDir: 'src/public'`** so static assets match [`architecture.md`](../../context/architecture.md) (`src/public/` → copied under `dist/` with paths preserved, e.g. **`dist/fonts/*.woff2`**).
- Vite injects the bundled CSS link; root **`index.html`** need not change for CSS alone.
- **`pnpm build`** runs the **token validator first**, then `vite build` (validator failure fails the build).
- This spec does **not** require unrelated Dockerfile changes beyond whatever minimal edits are needed if the build output layout changes.

### Token validator (`build/validate-tokens.ts`)

Plain **TypeScript** using Node **`fs`** (and string parsing only — **no** YAML libraries, JSON Schema, CSS AST packages, or new npm dependencies for the validator itself).

**Inputs:**

1. Parse **`sdd/context/design-system.md`**: every Markdown table whose **first header cell**, trimmed, is **`Token`**. For each data row, read token name (first column) and value (second column). Ignore separator rows. Tables whose first column is not **`Token`** (e.g. **`Voice`**, **`Rule type`**, **`State`**) are ignored.
2. Parse **`src/styles/tokens.css`**: every **`--name: value;`** inside the top-level **`:root { ... }`** block. Strip **`/* … */`** comments before parsing.

**Rules:**

- **Missing in CSS:** Any token from (1) not present in (2) → **error**.
- **Extra in CSS:** Any custom property in (2) not present in (1) → **error**.
- **Value mismatch:** After **whitespace normalisation** and optional **semicolon** stripping on the CSS side, each shared name must have **equal** string values to the markdown cell (same rules for **`--dur-rise`** as for every other token).

Exit **0** on success, **non-zero** on any error.

**Normalisation (minimum):** trim leading/trailing whitespace on names and values; collapse runs of whitespace inside values where unambiguous; ignore `/* … */` comments in CSS.

**Negative / regression tests (must not mutate tracked `tokens.css`):**

- Add **`sdd/specs/global-css/validator-fixtures/`** with small **`*.md`** + **`*.css`** pairs that intentionally **fail** validation (missing token, extra token, wrong value) and at least one **passing** pair shaped like the real token set.
- Add **`pnpm test:validator`** that runs a **Node** driver (the same **`tsx`** / **`node`** approach the repo uses elsewhere for TS one-shots, or a small compiled script) that invokes the validator against each fixture and asserts expected exit codes.
- Document fixture layout in **`sdd/specs/global-css/validator-fixtures/README.md`**.

If adding **`tsx`** (or similar) is unavoidable for **`pnpm validate:tokens`**, **`pnpm test:validator`**, and **`lint`**, add it as a **devDependency** and document it in **`provenance.md`**; the **validator module itself** stays dependency-light ( **`fs` + string parsing only** ) per the constraints above.

## Implementation handoff (for the implementing agent)

Authoritative **CSS** and **fonts** already live under **`sdd/specs/global-css/`** (including **`fonts/*.woff2`** with the names in the file mapping table). The agent’s job is **transport + wiring + tooling + tests**, not redesign of those assets.

1. **Byte-identical copy** — Copy the four **`*.css`** files to **`src/styles/`** and the eight **`fonts/*.woff2`** to **`src/public/fonts/`**. Verify byte identity (e.g. `cmp` or checksum) against the spec directory sources.
2. **Entry** — Set **`src/main.ts`** to **`import './styles/index.css'`**. Remove **`src/style.css`** if nothing else imports it (vite-baseline previously used it).
3. **Vite** — Set **`publicDir: 'src/public'`** in **`vite.config.ts`** so static assets land under **`dist/fonts/`** with the same relative paths.
4. **Token validator** — Add **`build/validate-tokens.ts`** implementing the **Token validator** section (default inputs: **`sdd/context/design-system.md`** and **`src/styles/tokens.css`**). Environment overrides **`VALIDATE_TOKENS_MARKDOWN`** and **`VALIDATE_TOKENS_CSS`** are optional for fixtures.
5. **`package.json`** — Add **`pnpm validate:tokens`** (runs the validator), chain **`pnpm lint`** → **`eslint . && pnpm validate:tokens`**, and **`pnpm build`** → **`pnpm validate:tokens && vite build`**. Add **`pnpm test:validator`** per **Token validator** § fixtures.
6. **TypeScript / ESLint** — Ensure **`tsconfig.json`** **`include`** covers **`build/`** (or the directory holding **`validate-tokens.ts`**) so **`tsc --noEmit`** and ESLint project mode work. **`.gitignore`:** the repository must **track** the root **`build/`** directory that holds **`validate-tokens.ts`** — do **not** list a blanket **`build/`** ignore at repo root (that pattern is a common mistake and hides the validator from git).
7. **Fixtures** — Create **`sdd/specs/global-css/validator-fixtures/`** with **`README.md`** plus pass/fail **`design-system.md`** + **`tokens.css`** pairs as specified in **Token validator** §.
8. **Playwright** — Add or extend **`e2e/`** tests per **Acceptance criteria** ( **`document.fonts.ready`**, **`@font-face`** in built CSS, **`:root`** custom properties). Respect vite-baseline: **no visible body content** required for smoke checks.
9. **`provenance.md`** — Create or overwrite in this spec directory on **dev** completion; **QA** adds **`scenarios.md`** and appends **provenance** per **`AGENTS.md`**.

## Acceptance criteria

- [ ] The four CSS files exist at **`src/styles/`** and are **byte-identical** to the sources in this directory.
- [ ] The eight **woff2** files exist under **`src/public/fonts/`** and are **byte-identical** to **`fonts/`** here.
- [ ] **`src/main.ts`** imports **`./styles/index.css`**.
- [ ] **`vite.config.ts`** sets **`publicDir: 'src/public'`** (or equivalent behaviour documented in `provenance.md` if Vite’s API changes).
- [ ] **`pnpm build`** produces **`dist/`** with a **content-hashed** CSS bundle under **`dist/assets/`** containing rules from tokens, reset, and base.
- [ ] **`pnpm build`** leaves font files under **`dist/fonts/`** (or the same relative paths as under `src/public/fonts/` after Vite copy).
- [ ] In a browser against **`pnpm preview`**, **`:root`** exposes expected custom properties and the **body** uses the paper background and **Special Elite** for body text; **headings** use **Anton** (see Playwright bullets below).
- [ ] **`build/validate-tokens.ts`** exists and is run from **`pnpm lint`** and at the start of **`pnpm build`**.
- [ ] **`pnpm lint`** exits **0** on the committed **`design-system.md`** and **`src/styles/tokens.css`** produced from this spec.
- [ ] **`pnpm test:validator`** exits **0** and covers **at least one failing fixture** (expects validator error) and **at least one passing fixture**.
- [ ] Root **`package.json`** defines **`"test": "pnpm test:e2e"`** so **`pnpm test`** runs the same Playwright suite as **`pnpm test:e2e`** (including **`pretest:e2e`**).
- [ ] **Playwright** tests avoid flaky font assertions: await **`document.fonts.ready`** before reading **`getComputedStyle`**, assert **`fontFamily`** **includes** **`Special Elite`**, and/or assert the **built CSS** under **`dist/assets/*.css`** contains an **`@font-face`** for **Special Elite**; assert **`:root`** custom properties (e.g. **`getPropertyValue('--paper')`**) match the design-system hex values.
- [ ] [`provenance.md`](./provenance.md) exists after an agent run, per **`architecture.md`**.

## Out of scope

- Component CSS, page grids, homepage, dispatch sheet, Under the Counter band, docket strip structure, etc.
- Corpus-driven **`static-build`** pipeline; this spec targets the **vite-baseline** shape (root **`index.html`**, **`src/main.ts`**). When **`static-build`** lands, wiring may move; global CSS files remain the same.
- **`components.css`** and **`pages.css`** from architecture — added by later specs.
- **Redesigning** the product visual system; this spec **implements** the current design-system, not a green-field look.

## Notes

- The **validator** is the highest-leverage artifact: it makes the design system **enforceable**. Restricting ingestion to tables whose first header is **`Token`** keeps accidental tables (rules, status colours) out of the token map.
- **`font-display: swap`** keeps first paint readable in fallbacks; Special Elite arrives when ready.
- Prefer **deterministic** validator tests via **fixtures** under **`validator-fixtures/`** over temporarily breaking real **`tokens.css`** in CI.
- **`README.md`** (if present) is a **non-normative** convenience for font download steps; **`spec.md`**, the file mapping table, and **`base.css`** **`url('/fonts/…')`** entries are authoritative for names and paths.
