# Nav tabs

## Intent

Add the **nav tabs** row from `sdd/reference/vision.html` (`nav.tabs`: primary section links plus `.right-tabs` utilities) as a **template + stylesheet** component. Render it **only on `/`**, **after** `header.masthead` and **before** `<main>`, matching vision markup and styling. **`src/templates/pages/base.ts` must not import or call `navTabs`** — only `src/templates/pages/home.ts` may compose it (e.g. concatenate with `masthead(...)` inside `beforeMain`).

**Run fifth**, after `sdd/specs/site/components/docket-strip`, `sdd/specs/site/pages/base`, `sdd/specs/site/pages/home`, and `sdd/specs/site/components/masthead`. Preconditions: masthead + `beforeMain` wiring exist; global tokens include `--ink`, `--ink-soft`, `--orange`, `--paper`.

Do not read `sdd/context/` or other specs unless something here is unclear.

## Authoritative CSS

Create `src/styles/components/nav-tabs.css` with **exactly** this content:

```css
nav.tabs {
  display: flex;
  gap: 0;
  margin-top: 1.5rem;
  margin-bottom: 0;
  overflow-x: auto;
  border-bottom: 2px solid var(--ink);
}
nav.tabs a {
  font-family: 'Anton', sans-serif;
  font-size: 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
  padding: 0.7rem 1.1rem 0.5rem;
  border: 2px solid var(--ink);
  border-bottom: none;
  margin-right: -2px;
  margin-bottom: -2px;
  background: var(--paper);
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
nav.tabs a:hover { background: var(--ink); color: var(--paper); }
nav.tabs a.active {
  background: var(--orange);
  color: var(--paper);
  border-color: var(--ink);
  z-index: 2;
  position: relative;
}
nav.tabs .right-tabs { margin-left: auto; display: flex; }
nav.tabs .right-tabs a {
  font-family: 'Special Elite', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: none;
  border: none;
  color: var(--ink-soft);
  padding: 0.7rem 0.6rem;
}
nav.tabs .right-tabs a:hover { background: transparent; color: var(--orange); }
```

## Authoritative TypeScript

Create `src/templates/components/nav-tabs.ts` — no imports from elsewhere; escape text and attribute values with local helpers safe for `& < > " '` in double-quoted attributes and text nodes:

```ts
export interface NavTabLink {
  href: string;
  label: string;
}

export interface NavTabsData {
  /** Left column tabs (Anton, bordered). */
  primary: NavTabLink[];
  /** Zero-based index into `primary` for the tab that receives `class="active"`. */
  activePrimaryIndex: number;
  /** Right-aligned utility links (Special Elite, minimal chrome). */
  right: NavTabLink[];
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: string): string {
  return escapeText(value);
}

export function navTabs(data: NavTabsData): string {
  const primaryHtml = data.primary
    .map((tab, index) => {
      const active = index === data.activePrimaryIndex ? ' class="active"' : '';
      return `<a href="${escapeAttr(tab.href)}"${active}>${escapeText(tab.label)}</a>`;
    })
    .join('\n    ');

  const rightHtml = data.right
    .map((tab) => `<a href="${escapeAttr(tab.href)}">${escapeText(tab.label)}</a>`)
    .join('\n      ');

  return `<nav class="tabs">
    ${primaryHtml}
    <div class="right-tabs">
      ${rightHtml}
    </div>
  </nav>`;
}
```

## `base.ts`

**Do not** import or call `navTabs` in `src/templates/pages/base.ts`. Navigation stays a homepage concern composed via `beforeMain` only.

## `home.ts` (only caller alongside `masthead`)

Replace **`src/templates/pages/home.ts`** with **exactly** this content (vision-default labels and `href="#"` placeholders; first primary tab active):

```ts
import { masthead } from '../components/masthead';
import { navTabs } from '../components/nav-tabs';
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

  const beforeMain =
    masthead({
      metaTitle: 'STOCKROOM & DISPATCH',
      metaLine2: 'UNIT 14B · BAY 3',
      metaLine3: '22:00 — 05:00 · By appt.',
      metaLine4: '+36 1 ___ ____',
      tagline:
        "A small operation moving records out of an industrial unit off Soroksári út. We work nights. Crypto only. We don't have a shop — we have a stockroom.",
      stampDefault: 'FRAGILE · DO NOT BEND',
      stampInk: 'BTC · ETH · USDC · XMR',
      stampRed: 'NO RETURNS · NO REFUNDS',
    }) +
    navTabs({
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
    });

  return basePage({
    title: 'Vinyl Traffic — Industrial Record Dispatch',
    docket: {
      open: isUnitOpen(buildDate, tz),
      dktRef: generateDktRef(buildDate, tz),
      dateLabel: formatDocketDate(buildDate, tz),
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX',
    },
    beforeMain,
    children: '',
  });
}
```

## Wiring (this spec)

- Add `@import "./components/nav-tabs.css";` to `src/styles/index.css` **after** the masthead import.

## Acceptance criteria

- [ ] `src/styles/components/nav-tabs.css` matches the CSS block byte-for-byte.
- [ ] `src/templates/components/nav-tabs.ts` matches the TypeScript block byte-for-byte.
- [ ] `src/templates/pages/base.ts` **does not** import `navTabs`.
- [ ] `src/templates/pages/home.ts` matches its block byte-for-byte.
- [ ] `src/styles/index.css` imports `nav-tabs.css`.
- [ ] Emitted `/` HTML order inside `.page`: `.docket`, then `header.masthead`, then `nav.tabs`, then `<main>`.
- [ ] `pnpm build` succeeds; `pnpm preview` shows six primary tabs, two right tabs, and the first primary tab uses `.active` styling (orange fill).
- [ ] Extend **`e2e/home.spec.ts`**: assert `nav.tabs` exists; exactly one `nav.tabs > a.active`; primary labels include `Stockroom` and `Find Us`; `.right-tabs` contains **Search** (or full **Search ↗**) and **Bag (0)**; `header.masthead` is an **earlier sibling** than `nav.tabs` under `.page`.
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Hash routing or real URLs for tabs, SPA section switching, bag count logic, search UI, other pages or routes, changing the masthead or docket specs, `prefers-reduced-motion` overrides for tab transitions, font preload changes, i18n.
