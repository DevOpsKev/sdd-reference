# Home page — first composition

## Intent

Implement the **home page**: the route at `/` and the first concrete page produced by the project's build. It composes `pages/base/` with build-time-fresh docket data, an empty content slot, and the supporting helpers needed to make the data fresh on every build.

This is the **first homepage spec** under `sdd/specs/site/pages/` that composes **`pages/base/`** with **build-time** docket data and emits **`dist/index.html`** for `/`. ([`pages/base`](../base/spec.md) already established the shell; this spec owns the **home route's** data helpers and static HTML output.) Its purpose is narrow: prove the page wires end-to-end, generates a docket strip with current build-time data, and ships a deployable index. Content blocks — the dispatch sheet, the stockroom grid, the Under the Counter band, the Friday note, the Find Us section — are **deferred to their own component specs** and amend this spec when they ship.

The homepage is composition. Its template is small. Its substance is in three places: the data-shape it constructs for base-page, the build-time helpers it introduces (date formatter, DKT generator, unit-open computation), and the wiring that makes Vite produce `dist/index.html` from it.

The implementing agent has room to make sensible decisions about helper internals and Vite wiring. The data flow into base-page is locked.

## References

- [`sdd/context/architecture.md`](../../../../context/architecture.md) — authoritative on `src/templates/`, `src/styles/`, the build pipeline, and the validation triangle.
- [`sdd/context/product.md`](../../../../context/product.md) — the unit's identity, hours, and operational character. The unit-open computation derives from the published hours.
- [`sdd/context/glossary.md`](../../../../context/glossary.md) — *Docket strip*, *Tonight*, *Friday note* entries.
- [`sdd/specs/global-css/spec.md`](../../../global-css/spec.md) — token, reset, base, and font foundation.
- [`sdd/specs/site/components/docket-strip/spec.md`](../../components/docket-strip/spec.md) — the docket strip component this page populates.
- [`sdd/specs/site/pages/base/spec.md`](../base/spec.md) — the layout shell this page composes.
- [`sdd/reference/vision.html`](../../../../reference/vision.html) — visual reference for what the homepage will eventually look like. Most of the prototype's content is **out of scope** for this first version of the spec.

## File mapping

Normative definitions live in **this `spec.md`** (requirements below). The implementing agent **creates** the listed targets to satisfy them; CSS is not introduced by this spec. *(Optional later: humans may commit snapshots under this directory for drift review — not required for the first implementation.)*

| Deliverable                      | Target (application)                          |
| -------------------------------- | --------------------------------------------- |
| Homepage template                | `src/templates/pages/home.ts`                 |
| Date formatter                   | `build/lib/date-format.ts`                    |
| DKT generator                    | `build/lib/dkt-ref.ts`                        |
| Unit-open helper                 | `build/lib/unit-open.ts`                      |

The implementing agent additionally:

- Creates `build/lib/` if it does not exist.
- Wires the application's entry (currently `src/main.ts` from `vite-baseline`) to invoke the homepage template at build time and produce a static `dist/index.html`. The exact wiring approach — Vite plugin, a small build script run before `vite build`, post-build transform — is the agent's choice. Provenance documents the approach.

## Requirements

### The homepage template

The homepage is a TypeScript function accepting build context and returning a complete HTML document:

```ts
import { basePage } from './base';

export interface HomePageContext {
  /** The build's wall-clock moment, used to populate the docket strip. */
  buildDate: Date;
}

export function homePage(context: HomePageContext): string;
```

The function:

1. Computes `dateLabel` from `buildDate` using the project's canonical date format (see *Date formatter* below).
2. Computes `open` from `buildDate` (see *Unit-open computation* below).
3. Computes `dktRef` from `buildDate` (see *DKT generator* below).
4. Hard-codes `unitLabel` to `"UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX"` for now. (When the unit's identity ever varies — it will not — this becomes a content lookup.)
5. Constructs `DocketStripData` from the four fields above.
6. Constructs `BasePageData` with `title: "Vinyl Traffic — Industrial Record Dispatch"` (aligned with the root shell and smoke tests — see `index.html` / [`pages/base`](../base/spec.md)), the docket data, and `children: ""` (empty content slot, deliberately).
7. Returns `basePage(data)`.

The homepage template imports nothing other than `basePage` from `./base` and the three helpers from `build/lib/` (`formatDocketDate`, `isUnitOpen`, `generateDktRef`). It declares no CSS rules and emits no HTML beyond what `basePage()` produces.

### Date formatter

Lives at `build/lib/date-format.ts`. Implements the project's canonical date format declared in `docket-strip/spec.md`:

```
DDD DD.MM.YYYY / HH:MM
```

For example: `WED 06.05.2026 / 02:14`.

```ts
export function formatDocketDate(date: Date, timeZone?: string): string;
```

Behaviour:

- Day name three letters, uppercase. English (`MON`, `TUE`, `WED`, `THU`, `FRI`, `SAT`, `SUN`).
- Day, month, year zero-padded to two/four digits, separated by `.`.
- 24-hour time, hours and minutes zero-padded, separated by `:`.
- Slash separator with a single space on each side between date and time.
- `timeZone` parameter optional, defaults to `Europe/Budapest`. The unit's wall-clock is what the docket reflects. Builds happening in CI on UTC machines must format against Budapest local time.

The implementation uses `Intl.DateTimeFormat` with explicit options. No external dependencies.

### Unit-open computation

Lives at `build/lib/unit-open.ts`. Computes whether the unit is currently within its working hours.

```ts
export function isUnitOpen(date: Date, timeZone?: string): boolean;
```

Behaviour:

- Returns `true` when the local hour at `timeZone` is `>= 22` or `< 5` — i.e. between 22:00 and 04:59:59. The unit hands parcels to the morning courier at 09:00 and is considered closed by then.
- `timeZone` defaults to `Europe/Budapest`.
- Sundays are treated the same as any other day for this computation. The unit's published "Sun · we sleep" status is a content note in *Find Us*; the open boolean does not encode it. (If a future spec requires per-weekday open hours, it amends this helper.)

The implementation uses `Intl.DateTimeFormat` to extract the hour at the target timezone. No external dependencies.

### DKT generator

Lives at `build/lib/dkt-ref.ts`. Generates a docket reference code from the build date.

```ts
export function generateDktRef(date: Date, timeZone?: string): string;
```

Behaviour:

- Returns a string of the form `DKT-YYYY-Www-001` where:
  - `YYYY` is the four-digit year-of-week per ISO 8601 week date.
  - `ww` is the two-digit ISO 8601 week number.
  - `001` is a fixed suffix. A future spec may replace this with a true build counter; for now the suffix is always literal `001`.
- `timeZone` defaults to `Europe/Budapest`. Week boundaries are computed against the unit's local time.
- Example: `DKT-2026-W19-001` for a build on Wednesday 6 May 2026 (ISO week 19 of 2026).

The implementation computes ISO week and ISO year-of-week with date arithmetic; no external dependencies.

The fixed `-001` suffix is honest about the current implementation: the code looks like it should be a unique identifier per build, but isn't yet. When real uniqueness matters (e.g. for cross-referencing a Friday note's archive number or a dispatch sheet's manifest number), a follow-up spec replaces the suffix with a generator.

### Page composition

The homepage's `children` slot is **empty** in this version of the spec. `basePage()` renders the docket strip and an empty `<main>`. This is deliberate.

When subsequent component specs ship, the homepage spec is amended to include their blocks in `children`. Each amendment adds one block in a known position. The order, top-to-bottom, when all blocks have shipped:

1. Masthead (deferred to `components/masthead/`)
2. Primary nav (deferred to `components/nav/`)
3. Dispatch sheet (deferred to `components/dispatch-sheet/`)
4. Stockroom grid (deferred to `components/stockroom-grid/`)
5. Under the Counter band (deferred to `components/under-the-counter/`)
6. Friday note section (deferred to `components/friday-note-block/`)
7. Find Us section (deferred to `components/find-us/`)
8. Footer (deferred to `components/footer/`)

This list is informational. None of these specs are written yet; their names are not committed. The order is intent, and it matches `vision.html`.

### Build wiring

The homepage produces `dist/index.html` at build time. Three plausible approaches:

1. A Vite plugin that intercepts the build, calls `homePage({ buildDate: new Date() })`, and writes the result to `dist/index.html`.
2. A small TypeScript script invoked before `vite build` that calls the template and writes `dist/index.html`, then `vite build` post-processes the file (injecting the bundled stylesheet link, copying public assets).
3. Replacing the root `index.html` (currently a vite-baseline placeholder) with a generated file produced by a pre-build step.

The implementing agent picks the approach. The acceptance criteria are functional, not prescriptive about the mechanism. Provenance documents what was built.

The agent must ensure:

- `pnpm build` produces `dist/index.html` containing the docket strip with the build-time wall-clock data.
- The bundled stylesheet (`dist/assets/styles.<hash>.css`) is linked from the produced HTML.
- Font preloads in the `<head>` reference the same paths Vite produces in `dist/fonts/`.
- The build is deterministic *given a fixed build date*. Two builds at the same wall-clock moment produce byte-identical `index.html`. For reproducibility in CI or tests, the implementing agent may support an optional environment variable (e.g. ISO 8601 instant string) that fixes the moment passed to `homePage()`; document the variable name in `provenance.md`.

### Unit tests (helpers)

The three `build/lib/` helpers must have **automated unit tests**. Use **Node's built-in test runner** (`node:test`) and the repo's existing **`tsx`** runner — **no new test framework dependencies** unless unavoidable (justify in `provenance.md`).

- Place test files alongside helpers, e.g. `build/lib/date-format.test.ts`, `build/lib/unit-open.test.ts`, `build/lib/dkt-ref.test.ts`.
- Add a **`pnpm test:unit`** script that runs those tests (e.g. `node --import tsx --test build/lib/*.test.ts` or explicit per-file invocations if globbing is unreliable cross-platform).
- Wire **`pnpm check`** (or **`pnpm test`** — agent's choice, document in `provenance.md`) so CI runs unit tests as well as existing checks; at minimum, document how to run unit tests in [`README.md`](../../../../../README.md) or `provenance.md` if the default `pnpm test` stays Playwright-only.

### Acceptance criteria

- [ ] `src/templates/pages/home.ts` exists and implements *The homepage template* (imports, data flow, title string, empty `children`).
- [ ] `build/lib/date-format.ts`, `build/lib/unit-open.ts`, and `build/lib/dkt-ref.ts` exist and implement *Date formatter*, *Unit-open computation*, and *DKT generator* respectively.
- [ ] `pnpm build` produces `dist/index.html`. The file contains:
  - A `<title>` matching the homepage title.
  - The docket strip as the first visible block in the body, with current build-time date, current week's DKT ref, and the correct open/closed state for the build's wall-clock moment.
  - An empty `<main>` element following the docket strip.
  - The bundled stylesheet link injected by Vite.
  - The two font preload links from `pages/base/`.
- [ ] `pnpm preview` serves the built site at `:4173` (or whichever port Vite picks). Visiting `/` returns the homepage.
- [ ] `e2e/home.spec.ts` covers, at minimum:
  - `/` returns 200.
  - The docket strip is rendered as the first body block.
  - The docket's date label matches the project's canonical format pattern.
  - The docket's DKT ref matches the pattern `DKT-YYYY-Www-001`.
  - The docket's unit label is exactly `UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX`.
  - The docket's open/closed state matches what `isUnitOpen()` would return for the build moment captured in the page (assert via the presence/absence of the `__pulse` element).
- [ ] `pnpm test:unit` exits **0**. Tests cover at minimum:
  - `formatDocketDate` produces the canonical format for several known inputs (e.g. midnight, noon, end-of-day, with timezone differences between UTC and Budapest).
  - `isUnitOpen` returns `true` at 23:00 Budapest, `false` at 12:00 Budapest, `true` at 04:30 Budapest, `false` at 09:00 Budapest.
  - `generateDktRef` produces correct ISO week numbers across year boundaries (e.g. 1 January 2027 falls in ISO week 53 of 2026 or week 1 of 2027 depending on the day).
- [ ] [`provenance.md`](./provenance.md) exists after an agent run, per `architecture.md`. Provenance documents:
  - The chosen build wiring approach (Vite plugin, pre-build script, or other).
  - Any deviation from the helper signatures or behaviours described above.

## Out of scope

- Any of the eight content blocks listed under *Page composition*. Each is a separate component spec (or page-spec amendment) when ready.
- Open Graph and Twitter Card meta tags. The homepage will eventually have a sharing surface; this spec does not pre-empt the format.
- Favicon. Out of scope until the project chooses to support one.
- A real DKT counter. The fixed `-001` suffix is intentional; a follow-up spec replaces it.
- Per-weekday open-hours logic. Sundays read as "open" if the hour matches; the published "Sun · we sleep" copy is a future Find Us content concern, not a docket-strip concern.
- Internationalisation of the date format. The unit ships internationally; the date format is fixed to English-three-letter day names and Budapest local time.

## Notes

- After this spec ships, **`/`** is a **static** homepage built from `homePage()` into `dist/index.html` (replacing the prior client-only `main.ts` shell pattern). The milestone is a deployable site — docket strip correct at the top of an otherwise empty `<main>`, served from the existing Docker/nginx setup. [`pages/base`](../base/spec.md) already proved the shell; this spec proves **build-time composition** for the index route.
- The fixed `-001` DKT suffix is a deliberate piece of dishonesty — the code *looks* unique but isn't. It's documented as such in this spec and in the helper's source comments. When a future spec adds real uniqueness, the change is contained: helper signature unchanged, suffix replaced with a counter.
- The three helpers in `build/lib/` are scoped to this spec but reusable. Future specs (`pages/about/`, `pages/find-us/`, etc.) will likely use `formatDocketDate` and `isUnitOpen`. The helpers do not depend on the homepage; they're project utilities that this spec happens to introduce.
- The build wiring is intentionally underspecified. Vite has multiple workable approaches; picking the wrong one prematurely costs more than letting the implementing agent evaluate the codebase and pick. Provenance captures the choice for future agents who need to amend the wiring (e.g. when more pages need building).
- This spec deliberately does not introduce the `static-build` pipeline architecture.md describes. The corpus-driven build is genuinely larger than this spec — content loading, schema validation, multi-page output. For one page on top of vite-baseline, the simplest viable wiring is sufficient. `static-build` lands when there's enough content to justify it.
