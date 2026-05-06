# Base page — the layout shell

## Intent

Implement the **base page**: the document scaffolding every page on the site renders inside. It owns the `<!doctype>` declaration, the `<html>` and `<head>` blocks, font preloads, the stylesheet link, the `<body>` and centred page wrapper, the docket strip rendered at the top, and a generic slot for page-specific content rendered inside `<main>`.

This is the **first page spec** under `sdd/specs/site/pages/`. It deliberately stops short of including the masthead, the primary nav, and the footer — those land in subsequent component specs and amend base-page when they ship. Until then, base-page emits no placeholder elements for them; the page renders as docket strip, then page content, then nothing.

The base page is plumbing. Its structural decisions matter — slot composition, the data shape, font preload strategy — but its CSS is small enough that it lives inline with the existing global rules in `src/styles/base.css` rather than in a separate file. The template's TypeScript is the authoritative source for this spec; the CSS additions are described in prose for the implementing agent to write.

The implementing agent has room to make sensible decisions about the small CSS additions (selector specifics, vertical rhythm) provided the requirements below are met. The template's structure is locked.

## References

- [`sdd/context/architecture.md`](../../../../context/architecture.md) — authoritative on `src/templates/`, `src/styles/`, the build pipeline, and the validation triangle.
- [`sdd/context/design-system.md`](../../../../context/design-system.md) — token values, type system, accessibility constraints. The `.page` wrapper applies `--page-max-width` and `--gutter` from this document.
- [`sdd/specs/global-css/spec.md`](../../../global-css/spec.md) — token, reset, base, and font foundation this spec builds on. The CSS additions in this spec extend `src/styles/base.css`.
- [`sdd/specs/site/components/docket-strip/spec.md`](../components/docket-strip/spec.md) — the docket strip component this base page composes.
- [`sdd/reference/vision.html`](../../../../reference/vision.html) — visual reference. The page-level scaffolding (masthead, nav, footer) shown in the prototype is **out of scope** for this spec; only the document structure, the docket strip, and the centred page wrapper apply here.

## File mapping

The TypeScript template is the only authoritative source file in this spec directory. CSS additions are made directly to the existing `src/styles/base.css` per *Styling additions* below.

| Source (this directory)        | Target (application)                         |
| ------------------------------ | -------------------------------------------- |
| `base.ts`                      | `src/templates/pages/base.ts`                |

The implementing agent additionally:

- Creates `src/templates/pages/` if it does not exist.
- Adds the rules described in *Styling additions* to `src/styles/base.css`.
- Updates `src/main.ts` (or whichever entry point the project uses) to import and invoke the base page template, replacing the vite-baseline placeholder content. The exact wiring is the agent's call provided the result is a working build that renders the docket strip at the top of the page. Because `basePage()` returns a **full HTML document**, the entry point must apply it in a way Vite still bundles (e.g. replace `document.documentElement` / `document.body` innerHTML after load, or drive a minimal shell — document the chosen approach in `provenance.md`).

## Requirements

### Data shape

The base page is a TypeScript function accepting a typed input and returning an HTML string:

```ts
import { docketStrip, type DocketStripData } from '../components/docket-strip';

export interface BasePageData {
  /** Document title, used for <title>. */
  title: string;

  /** Docket strip data, passed verbatim to the docket-strip template. */
  docket: DocketStripData;

  /** Pre-rendered HTML for the page's main content slot. May be empty. */
  children: string;
}

export function basePage(data: BasePageData): string;
```

The function imports **only** `docketStrip` and the `DocketStripData` type from `../components/docket-strip`, then composes them. No other project modules. No global state.

### Document structure

The base page emits a complete HTML document. Order of elements matters:

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#ece6d4">  <!-- the --paper token value -->
    <title>{title}</title>
    <link rel="preload" as="font" type="font/woff2" href="/fonts/special-elite-v20-latin-regular.woff2" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="/fonts/jetbrains-mono-v24-latin-regular.woff2" crossorigin>
    <!-- The bundled stylesheet link is injected by Vite at build time. -->
  </head>
  <body>
    <div class="page">
      {docket strip}
      <main>{children}</main>
    </div>
  </body>
</html>
```

Notes:

- `lang="en"` is the document language. Hungarian appears only in proper nouns ("Soroksári út"); the document language is English.
- `<meta name="theme-color">` matches the design-system `--paper` value (`#ece6d4`). Hex is repeated as a literal because meta tags cannot reference CSS custom properties. If the token value changes in `design-system.md`, this spec needs updating in the same change.
- Font preloads cover only Special Elite (body, paints immediately) and JetBrains Mono 400 (docket strip, paints immediately). **Filenames must match** the self-hosted woff2 basenames used in `@font-face` rules in `src/styles/base.css` (see [`global-css/spec.md`](../../../global-css/spec.md)): `special-elite-v20-latin-regular.woff2` and `jetbrains-mono-v24-latin-regular.woff2`. Anton, Stardos Stencil, Permanent Marker, and the other JetBrains Mono weights load on demand without preload — they appear later in the page or on user interaction. `crossorigin` is required for self-hosted fonts loaded with `rel="preload"`.
- The bundled stylesheet `<link>` is **not** emitted by this template. Vite injects it during the build by transforming the document. The agent does not need to add it manually.
- `.page` is the centred wrapper. Width and gutter are governed by the design tokens; specific rules are added in *Styling additions*.
- `<main>` is the landmark element for the page's main content. The string passed in `children` is rendered inside it as raw HTML.

### HTML escaping

The `title` field is escaped as text content in `<title>`. The `children` field is **not** escaped — it is pre-rendered HTML produced by the page-specific template (eventually `pages/home/`, etc.). Each child template is responsible for its own escaping at the leaf nodes; that is the convention established by `docket-strip.ts` and ratified here.

The base page imports the same local `escape()` helper pattern as `docket-strip.ts` for the title field. When `static-build` ships, both helpers are consolidated into `build/render.ts`.

### Styling additions

The implementing agent adds the following rules to `src/styles/base.css`. Exact selector names and property ordering are the agent's call provided the requirements below are met.

**The `.page` wrapper.** Applied to a `<div>` directly inside `<body>` that contains all visible content. The wrapper:

- Has a maximum width of `var(--page-max-width)`.
- Is horizontally centred (`margin-left: auto; margin-right: auto;` or equivalent).
- Has horizontal padding of `var(--gutter)` on each side.
- Has no vertical margin.

**The `main` element.** Applied to the single `<main>` directly inside `.page`. The element:

- Has top padding sufficient to separate the docket strip's bottom border from the main content. Suggested value: `1.5rem`. The implementing agent may adjust if visual review against `vision.html` warrants.
- Has no horizontal padding (the `.page` wrapper handles that).

These rules are added after the existing rules in `base.css` and before the `prefers-reduced-motion` block. The token validator runs against `base.css` only for the `:root` block in `tokens.css` — no token changes are made by this spec.

### Accessibility

- The `<html lang>` attribute is set so screen readers select the right voice.
- `<main>` is the page's main landmark and contains all page content below the docket strip.
- Future specs (masthead, nav, footer) will add `<header>`, `<nav>`, and `<footer>` landmarks. This spec does not pre-empt their structure.
- Font preloads use `crossorigin` to prevent double-fetches.

### Out of scope (explicit)

- The masthead block (wordmark, tagline, address, stamps, primary nav). Delivered by `sdd/specs/site/components/masthead/spec.md` (forthcoming), which extends base-page to render it.
- The primary navigation (the tab row beneath the masthead). Delivered by `sdd/specs/site/components/nav/spec.md` (forthcoming).
- The page footer (barcode strip, colophon, copyright line). Delivered by `sdd/specs/site/components/footer/spec.md` (forthcoming).
- Open Graph, Twitter Card, and other social-share meta tags. Delivered by a future spec when the home page or per-page sharing requires them.
- Favicon, apple-touch-icon, manifest. Out of scope for the same reason — added when the project chooses to support them.
- Any client-side JavaScript or analytics. Forbidden by `architecture.md`.
- Server-side rendering, dynamic content, or per-request behaviour. Build-time only.

These are deliberate omissions, not deferred decisions. The base-page produced by this spec is the complete shell *at this stage of the project*. Subsequent specs extend it.

## Acceptance criteria

- [ ] `src/templates/pages/base.ts` exists and is byte-identical to the source in this directory.
- [ ] `src/styles/base.css` includes a `.page` wrapper rule applying `var(--page-max-width)`, centring, and `var(--gutter)` horizontal padding.
- [ ] `src/styles/base.css` includes a `main` rule applying suitable vertical separation from the docket strip.
- [ ] The application's TypeScript entry point invokes `basePage()` to render the page, replacing the `vite-baseline` placeholder. The result builds successfully via `pnpm build`.
- [ ] The built page (served via `pnpm preview`) emits the document structure described above: a single `<html lang="en">` with charset, viewport, theme-color, title, two font preloads, and the bundled stylesheet link injected by Vite. The body contains a `.page` wrapper, the docket strip rendered at top, and a `<main>` slot.
- [ ] Playwright spec **`e2e/base.spec.ts`** (repo convention; not necessarily beside `spec.md`) covers, at minimum:
  - The page renders with `<html lang="en">`.
  - The docket strip is the first visible block in the document body.
  - The `<main>` element is present and contains whatever is passed as `children`.
  - `<title>` matches the `title` field.
  - The two font preload links are present in `<head>` with `rel="preload"`, `as="font"`, `crossorigin`.
  - The `theme-color` meta tag matches the `--paper` token value.
  - HTML injection in `title` is escaped.
- [ ] [`provenance.md`](./provenance.md) exists after an agent run, per `architecture.md`. Provenance notes any deviation from the suggested CSS values (e.g. main padding) with rationale.

## Notes

- The base page is intentionally thin. Subsequent specs (masthead, nav, footer) extend it without rewriting it. Each extension adds one new block of HTML between the docket strip and `<main>`, or below `</main>`. The data shape grows by one field per extension; the existing fields and the `children` slot stay stable.
- The template's local `escape()` is the same temporary measure as in `docket-strip.ts`. The two helpers consolidate when `static-build` lands.
- The choice to inline page-shell CSS in `src/styles/base.css` rather than create a new file is deliberate. The `.page` wrapper and `main` rule are global layout concerns, not page-specific. A `src/styles/pages/` directory may exist in the future for genuinely page-specific styling; this spec does not create one.
- The `theme-color` meta tag duplicates the `--paper` token value as a literal hex. This is the only place outside `tokens.css` where a token value is repeated. If the value drifts, the token validator in `global-css` will not catch it — this spec relies on documentation and review. A future spec may add a build-time check.
- The `<main>` element does not have `id="main"` or any equivalent skip-link target. A skip-link is reasonable to add when the masthead and nav are present (otherwise there is nothing to skip past). Deferred to the masthead or nav spec.
- **`base.ts`** in this directory is the authoritative TypeScript; the implementing agent copies it to `src/templates/pages/base.ts` and keeps **byte identity**, same as other component/page specs.
