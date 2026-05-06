# Docket strip — the page-top status strip

## Intent

Implement the **docket strip**: the thin status bar across the very top of every page on the site. It carries the unit's open/closed state, the build's DKT reference code, the build date and time, and the unit's location. It sits **above** the masthead and is the first thing on every page; it appears on every layout the site renders.

This is the **first component spec** under `sdd/specs/site/components/`. It sets the convention for subsequent component specs: a dumb, typed template function plus a scoped CSS file, both authoritative in the spec directory and transported byte-identically to the application tree.

The component takes typed input and returns an HTML string. It does not compute dates, generate DKT codes, or read the unit's hours — its caller (eventually `pages/base/`) supplies the data. The component renders. Nothing else.

CSS and TypeScript sources in **this spec directory** are the **authoritative originals**. The implementing agent's job is to **copy** them to the target paths under `src/`, register the component CSS in `src/styles/index.css`, and produce a Playwright test that exercises the open/closed states. **Do not edit the authoritative source files in this directory during implementation** except when a human is changing the spec itself.

## References

- [`sdd/context/architecture.md`](../../../../context/architecture.md) — authoritative on `src/templates/`, `src/styles/`, the build pipeline, and the validation triangle.
- [`sdd/context/design-system.md`](../../../../context/design-system.md) — token values, type system, motion, accessibility constraints.
- [`sdd/context/glossary.md`](../../../../context/glossary.md) — *Docket strip* entry.
- [`sdd/specs/global-css/spec.md`](../../../global-css/spec.md) — token, reset, base, and font foundation this component depends on.
- [`sdd/reference/vision.html`](../../../../reference/vision.html) — visual reference. The `.docket` block at the top of the prototype is the target rendering.

## File mapping

Authoritative sources live in **this directory**. The implementing agent copies each file to the application path and verifies **byte identity** between source and destination.

| Source (this directory)        | Target (application)                                     |
| ------------------------------ | -------------------------------------------------------- |
| `docket-strip.ts`              | `src/templates/components/docket-strip.ts`               |
| `docket-strip.css`             | `src/styles/components/docket-strip.css`                 |

The implementing agent additionally:

- Appends `@import "./components/docket-strip.css";` to `src/styles/index.css` after the existing `base.css` import.
- Creates `src/templates/components/` if it does not exist.
- Creates `src/styles/components/` if it does not exist.

## Requirements

### Data shape

The component is a TypeScript function that accepts a typed input and returns an HTML string:

```ts
export interface DocketStripData {
  /** True when the unit is currently within its 22:00–05:00 working hours. */
  open: boolean;

  /** DKT reference code, e.g. "DKT-2026-W19-006". Always shown verbatim. */
  dktRef: string;

  /** Pre-formatted date label, e.g. "WED 06.05.2026 / 02:14". The component does not format. */
  dateLabel: string;

  /** Unit location label, e.g. "UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX". Always shown verbatim. */
  unitLabel: string;
}

export function docketStrip(data: DocketStripData): string;
```

The component does **not** import any other module from the project. It depends on no global state and no environment.

### Date format (project convention)

Date strings supplied to `dateLabel` follow the project's canonical date format:

```
DDD DD.MM.YYYY / HH:MM
```

For example: `WED 06.05.2026 / 02:14`. Day name three letters, uppercase. Day, month, year separated by `.`. Time in 24-hour format. The slash and surrounding spaces are literal.

This format is the project-wide convention for date-time display anywhere structured (the docket strip, dispatch sheets, manifest entries). The actual date formatter is **out of scope for this spec** — it will be implemented by `pages/base/` or a shared build helper at `build/lib/date-format.ts`. This spec only declares the format the docket strip expects to receive.

### Rendering

The docket strip renders as a single horizontal row with two sides:

- **Left side:** the open/closed status (with optional pulsing dot when open), followed by a separator, followed by the DKT ref code.
- **Right side:** the date label, followed by a separator, followed by the unit label.

Status text varies by state:

- `open: true` → `● UNIT OPEN — STAFF ON SITE`  (the dot is rendered as a separate element with the pulse animation; see CSS)
- `open: false` → `UNIT CLOSED` (no dot rendered)

Separators between adjacent items on the same side are rendered as middle-dots (`·`) with surrounding whitespace, except the "UNIT OPEN — STAFF ON SITE" string itself, which uses an em-dash (`—`) as its internal separator. This is intentional — the em-dash binds the open/staff phrase as a single semantic statement; the middle-dot separates discrete metadata items.

The component emits semantic HTML using `<div>` elements with BEM-ish class names. No ARIA roles are required — the strip is informational metadata, not an interactive region. Text content is left as text (not aria-labels) so screen readers pick it up directly.

### HTML output

The component emits exactly this structure (whitespace insignificant):

```html
<div class="docket-strip">
  <div class="docket-strip__side docket-strip__side--left">
    <span class="docket-strip__status docket-strip__status--open">
      <span class="docket-strip__pulse" aria-hidden="true"></span>
      UNIT OPEN — STAFF ON SITE
    </span>
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__ref">DKT-2026-W19-006</span>
  </div>
  <div class="docket-strip__side docket-strip__side--right">
    <span class="docket-strip__date">WED 06.05.2026 / 02:14</span>
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__unit">UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX</span>
  </div>
</div>
```

When `open: false`:

```html
<div class="docket-strip">
  <div class="docket-strip__side docket-strip__side--left">
    <span class="docket-strip__status docket-strip__status--closed">
      UNIT CLOSED
    </span>
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__ref">DKT-2026-W19-006</span>
  </div>
  <div class="docket-strip__side docket-strip__side--right">
    <span class="docket-strip__date">WED 06.05.2026 / 02:14</span>
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__unit">UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX</span>
  </div>
</div>
```

The only structural difference between states is the modifier class on `__status` (`--open` vs `--closed`) and the presence/absence of the `__pulse` element.

### HTML escaping

All four input fields are interpolated as text content, escaped against HTML injection. The component imports an `escape()` helper from `build/render.ts` (which `sdd/specs/static-build/spec.md` will deliver). Until `static-build` lands, the implementing agent provides a local `escape()` function in `docket-strip.ts` that escapes `&`, `<`, `>`, `"`, `'`. The local function is replaced by the imported one when `static-build` lands.

### Styling

The CSS lives at `src/styles/components/docket-strip.css` (transported from this spec directory). It uses tokens declared in `src/styles/tokens.css` and assumes the base typography and font-faces declared in `src/styles/base.css`.

Layout:

- Full-width horizontal flex container with `space-between` justification.
- Horizontal padding equal to `var(--gutter)`.
- Vertical padding `0.5rem` top and bottom.
- 1px solid `var(--ink)` bottom border, marking the docket strip as a primary section boundary per design-system.
- On viewports below 720px, the two sides stack vertically with a small gap; left side first, right side second.

Type:

- `font-family: 'JetBrains Mono', ui-monospace, monospace;` — the docket strip is monospace metadata.
- `font-size: var(--type-mono-sm);`
- `letter-spacing: 0.1em;`
- `text-transform: uppercase;`
- `color: var(--ink-soft);` — secondary text colour, the docket is metadata not content.
- Line-height `1` for tight monospace rhythm.

Pulse:

- The `.docket-strip__pulse` element is a 6×6px green circle, vertically centred against the status text, separated from the text by `0.5em` of margin-right.
- Background colour `#3a8a4a` (a calm forest green — not the design-system tokens because this is a one-off indicator colour). Document this in `provenance.md` if a token is added later.
- A 2.4-second ease-in-out pulse animation cycles its opacity between `1.0` and `0.4`. The animation respects `prefers-reduced-motion: reduce` (the global rule in `base.css` already disables it; nothing more needed in this CSS).

Side-specific:

- Left and right sides are display flex with a small `gap` of `0.75em` between their children.
- Children that should stay on a single line use `white-space: nowrap` so the unit label and DKT ref don't break mid-string.

The CSS file declares no rules outside the `.docket-strip` namespace. No global selectors, no token declarations.

### Accessibility

- The pulsing dot is purely decorative; it duplicates information already in the text. It is rendered with `aria-hidden="true"` so screen readers do not announce it.
- The middle-dot separators are similarly `aria-hidden="true"`.
- Text is set in `var(--ink-soft)` against the page's `var(--paper)` background. This combination meets WCAG AA at body sizes per `design-system.md` *Accessibility*.
- Reduced motion is handled by the global rule in `base.css`; the pulse animation halts under `prefers-reduced-motion: reduce` without any per-component CSS.

### Responsive behaviour

| Width    | Behaviour                                                  |
| -------- | ---------------------------------------------------------- |
| ≥ 720px  | Single horizontal row, sides justified left and right.     |
| < 720px  | Sides stack vertically; left side first, right side below. |

Below 720px, the right side's unit label is the most likely to overflow on narrow screens. The label uses `white-space: nowrap` and the strip uses `overflow-x: hidden` so any overflow truncates rather than breaking the layout. (A future spec may add an ellipsis or alternative label format for narrower viewports; this spec accepts truncation.)

## Acceptance criteria

- [ ] `src/templates/components/docket-strip.ts` exists and is byte-identical to the source in this directory.
- [ ] `src/styles/components/docket-strip.css` exists and is byte-identical to the source in this directory.
- [ ] `src/styles/index.css` ends with the line `@import "./components/docket-strip.css";` after its existing imports.
- [ ] `pnpm build` produces a `dist/` directory whose CSS bundle includes rules for the `.docket-strip` selector.
- [ ] `pnpm test` includes a Playwright spec at [`docket-strip.spec.ts`](./docket-strip.spec.ts) covering at minimum:
  - Renders with `open: true` → status text contains `UNIT OPEN — STAFF ON SITE` and a pulse element is present.
  - Renders with `open: false` → status text contains `UNIT CLOSED` and no pulse element is present.
  - All four input fields (`dktRef`, `dateLabel`, `unitLabel` plus `open`-derived status) appear verbatim in the rendered output.
  - The strip is the first visible block in the document body.
  - HTML injection in any input field (`<script>alert(1)</script>` etc.) is escaped, not executed.
- [ ] Playwright tests for the pulse animation use stability techniques per `global-css/spec.md` (await `document.fonts.ready`; assert presence of the `__pulse` element rather than animation timing).
- [ ] [`provenance.md`](./provenance.md) exists after an agent run, per `architecture.md`.

## Out of scope

- Date formatting. The component accepts a pre-formatted string. The formatter lives elsewhere (eventually `build/lib/date-format.ts` or `pages/base/`).
- DKT code generation. The component accepts the code verbatim. The generator lives wherever the data layer for the page does.
- Computing the unit's open/closed state. The component accepts the boolean. The computation lives at the data-supplying layer.
- Layout decisions about what *contains* the docket strip. That is the work of `pages/base/spec.md`.
- Visual variants (different docket-strip styles per page). There is one docket strip; it is identical on every page that uses it.
- A no-JavaScript fallback for the pulse animation. The pulse is CSS-only and works without scripts.

## Notes

- The component template's local `escape()` function is a temporary measure pending `static-build`. This spec should not be marked complete without flagging the temporary helper in `provenance.md`. When `static-build` ships, a follow-up spec may consolidate the helper into the shared module.
- The pulse colour (`#3a8a4a`) is intentionally not a design-system token. It is the only piece of green on the site, scoped to one decorative indicator. If a second use-case for this green emerges, the value graduates to a token in `design-system.md` and the docket strip migrates to it.
- The separator typography (em-dash for the open-staff phrase, middle-dot between metadata items) is a small piece of editorial discipline. Future component specs that emit similar metadata strips should follow the same convention.
- The component is the first piece of UI an agent implements in this project that produces *visible output* on the live site. Its acceptance criteria — particularly the Playwright test — set the precedent for how subsequent component specs are validated.
