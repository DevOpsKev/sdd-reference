# Home page — `/` with build-time docket

## Intent

Wire **`/`** so `pnpm build` emits HTML with a **live docket**, **masthead**, and **nav tabs**, with an **empty `<main>`**, by calling **`basePage`** with all required fields (see **`sdd/specs/site/pages/base/spec.md`**). **Run fifth**, after **`sdd/specs/site/components/docket-strip`**, **`sdd/specs/site/components/masthead`**, **`sdd/specs/site/components/nav-tabs`**, and **`sdd/specs/site/pages/base`**.

## Preconditions

- `src/templates/pages/base.ts` composes docket, masthead, and nav per **`sdd/specs/site/pages/base/spec.md`**.
- `src/templates/components/docket-strip.ts` + CSS import exist.
- Masthead and nav-tabs components and stylesheet imports exist per their specs.

## Files to create or update

| Target | Purpose |
| ------ | ------- |
| `build/lib/date-format.ts` | `formatDocketDate(date, timeZone?)` |
| `build/lib/unit-open.ts` | `isUnitOpen(date, timeZone?)` |
| `build/lib/dkt-ref.ts` | `generateDktRef(date, timeZone?)` |
| `src/templates/pages/home.ts` | `homePage({ buildDate })` → `basePage(...)` with docket + masthead + `navTabs` data |
| `build/generate-index.ts` | Writes repo-root `index.html` before Vite |
| `package.json` | `"prebuild": "tsx build/generate-index.ts"` before `vite build` |
| `e2e/home.spec.ts` | Smoke tests for `/` + docket, masthead, nav |

Default timezone for all helpers: **`Europe/Budapest`**.

### Helpers (implement — no external deps)

**`formatDocketDate`** — output `DDD DD.MM.YYYY / HH:MM` (English weekday `MON`…`SUN`, 24h, dots between date parts). Use `Intl` as needed.

**`isUnitOpen`** — `true` iff local hour at timezone is **`>= 22` or `< 5`**.

**`generateDktRef`** — string `DKT-YYYY-Www-001` where `YYYY` / `Www` are **ISO 8601 week-year / week number** in that timezone; suffix always **`001`**.

### Homepage template

Create `src/templates/pages/home.ts`:

```ts
import { basePage } from './base';
import { formatDocketDate } from '../../../build/lib/date-format';
import { isUnitOpen } from '../../../build/lib/unit-open';
import { generateDktRef } from '../../../build/lib/dkt-ref';

export interface HomePageContext {
  buildDate: Date;
}

export function homePage(context: HomePageContext): string {
  const { buildDate } = context;
  const tz = 'Europe/Budapest';

  return basePage({
    title: 'Vinyl Traffic — Industrial Record Dispatch',
    docket: {
      open: isUnitOpen(buildDate, tz),
      dktRef: generateDktRef(buildDate, tz),
      dateLabel: formatDocketDate(buildDate, tz),
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX',
    },
    masthead: {
      metaTitle: 'STOCKROOM & DISPATCH',
      metaLine2: 'UNIT 14B · BAY 3',
      metaLine3: '22:00 — 05:00 · By appt.',
      metaLine4: '+36 1 ___ ____',
      tagline:
        "A small operation moving records out of an industrial unit off Soroksári út. We work nights. Crypto only. We don't have a shop — we have a stockroom.",
      stampDefault: 'FRAGILE · DO NOT BEND',
      stampInk: 'BTC · ETH · USDC · XMR',
      stampRed: 'NO RETURNS · NO REFUNDS',
    },
    navTabs: {
      primary: [
        { href: '#', label: 'Stockroom' },
        { href: '#', label: 'Outgoing' },
        { href: '#', label: 'New In' },
        { href: '#', label: 'Counter' },
        { href: '#', label: 'Index' },
        { href: '#', label: 'Find Us' },
      ],
      activePrimaryIndex: 0,
      right: [
        { href: '#', label: 'Search ↗' },
        { href: '#', label: 'Bag (0)' },
      ],
    },
    children: '',
  });
}
```

From `src/templates/pages/home.ts`, imports to `build/lib/` use **`../../../build/lib/...`** (three levels up to repo root).

### Generate index

Create `build/generate-index.ts`:

```ts
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { homePage } from '../src/templates/pages/home';

function getBuildDate(): Date {
  const envDate = process.env.BUILD_DATE;
  if (envDate) {
    const parsed = new Date(envDate);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid BUILD_DATE: ${envDate}`);
    }
    return parsed;
  }
  return new Date();
}

function main(): void {
  const buildDate = getBuildDate();
  let html = homePage({ buildDate });
  html = html.replace(
    '</body>',
    '  <script type="module" src="/src/main.ts"></script>\n  </body>'
  );
  writeFileSync(resolve(process.cwd(), 'index.html'), html, 'utf-8');
}

main();
```

### package.json

Set scripts so **generate-index runs before Vite**, e.g.:

```json
"prebuild": "tsx build/generate-index.ts",
"build": "pnpm validate:tokens && vite build"
```

(Keep existing `validate:tokens` / other steps as needed.)

### Playwright

Add or replace **`e2e/home.spec.ts`** with tests that hit **`pnpm preview`** root URL (port **4173**): HTTP 200, document title `Vinyl Traffic — Industrial Record Dispatch`, **`.docket`** visible and **first element child of `.page`** is the docket block, date text matches `/^[A-Z]{3} \d{2}\.\d{2}\.\d{4} \/ \d{2}:\d{2}$/`, DKT matches `/^DKT-\d{4}-W\d{2}-001$/`, unit label exact string above, open vs closed via **presence / absence of `.light`**. Also assert **`header.masthead`**, **`nav.tabs`**, and **`.page` child order** per **`sdd/specs/site/pages/base/spec.md`** and the **masthead** / **nav-tabs** component specs (wordmark, stamps, tagline, active tab, right utilities).

## Acceptance criteria

- [ ] Helpers + `home.ts` + `generate-index.ts` exist; imports resolve; **`prebuild`** runs before **`vite build`**.
- [ ] `home.ts` matches the TypeScript block byte-for-byte.
- [ ] `pnpm build` then `pnpm preview`: `/` shows docket, masthead, nav, and empty `<main>``.
- [ ] Optional env **`BUILD_DATE`** (ISO string) fixes the instant for reproducible builds.
- [ ] `e2e/home.spec.ts` covers the bullets above; `pnpm test:e2e` passes.
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Other routes, main content inside `<main>`, real DKT counters (suffix stays `001`), social meta, i18n.
