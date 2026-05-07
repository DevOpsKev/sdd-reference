# Masthead

## Intent

Add the **masthead** component (`src/templates/components/` + `src/styles/components/`) and show it **only on `/`**, between the docket and `<main>`, matching `sdd/reference/vision.html` (wordmark, stamps row, meta column). **`src/templates/pages/base.ts` must not import or call `masthead`** — only `src/templates/pages/home.ts` may import the component and pass HTML via an optional slot.

**Run fourth**, after `sdd/specs/site/components/docket-strip`, `sdd/specs/site/pages/base`, and `sdd/specs/site/pages/home`. **`src/templates/pages/base.ts`** must already follow **`sdd/specs/site/pages/base/spec.md`** (optional `beforeMain` between docket and `<main>`). This spec adds the masthead component, replaces **`src/templates/pages/home.ts`** with the block below, stylesheet import, and e2e.

Do not read `sdd/context/` or other specs unless something here is unclear.

## Preconditions

- `src/templates/components/docket-strip.ts`, `src/templates/pages/base.ts`, `src/templates/pages/home.ts`, and `src/styles/index.css` exist per the earlier site specs.
- Global tokens include `--ink`, `--ink-soft`, `--ink-faded`, `--orange`, `--red` (used by the CSS below).

## Authoritative CSS

Create `src/styles/components/masthead.css` with **exactly** this content:

```css
.masthead {
  padding: 3rem 0 2.5rem;
  border-bottom: 1px dashed var(--ink-faded);
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2.5rem;
  align-items: end;
}
@media (max-width: 720px) {
  .masthead {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 0 2rem;
  }
}

.wordmark-stamp {
  display: inline-block;
  padding: 0.7rem 1.2rem 0.5rem;
  border: 4px solid var(--ink);
  transform: rotate(-1.8deg);
  background: transparent;
  position: relative;
  font-family: 'Anton', sans-serif;
  font-size: clamp(2.5rem, 7vw, 5rem);
  line-height: 0.85;
  letter-spacing: 0.02em;
  color: var(--ink);
}
.wordmark-stamp::before {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--ink);
  opacity: 0.4;
  transform: translate(2px, 1.5px);
  pointer-events: none;
}
.wordmark-stamp::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 5% 95%, var(--ink) 0.5px, transparent 1.5px),
    radial-gradient(circle at 92% 8%, var(--ink) 0.5px, transparent 1.5px),
    radial-gradient(circle at 30% 8%, var(--ink) 0.4px, transparent 1px);
  opacity: 0.35;
  pointer-events: none;
}

.masthead-meta {
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.7;
}
@media (max-width: 720px) {
  .masthead-meta {
    text-align: left;
  }
}
.masthead-meta strong {
  font-weight: 700;
  font-size: 0.85rem;
}
.masthead-meta .tagline {
  font-family: 'Special Elite', monospace;
  font-size: 0.85rem;
  text-transform: none;
  letter-spacing: 0;
  color: var(--ink-soft);
  margin-top: 0.5rem;
  font-style: italic;
  max-width: 36ch;
  margin-left: auto;
}
@media (max-width: 720px) {
  .masthead-meta .tagline {
    margin-left: 0;
  }
}

.stamps-row {
  display: flex;
  gap: 1.25rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  align-items: center;
}
.stamp {
  display: inline-block;
  padding: 0.35em 0.75em;
  border: 2px solid var(--orange);
  color: var(--orange);
  font-family: 'Stardos Stencil', sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  transform: rotate(-3deg);
  background: transparent;
  line-height: 1;
}
.stamp.red {
  border-color: var(--red);
  color: var(--red);
  transform: rotate(2deg);
}
.stamp.ink {
  border-color: var(--ink);
  color: var(--ink);
  transform: rotate(-1deg);
}
.stamp.lg {
  font-size: 1.1rem;
  padding: 0.4em 0.9em;
}
.stamp.flat {
  transform: none;
}
```

## Authoritative TypeScript

Create `src/templates/components/masthead.ts` — no imports from elsewhere; escape every interpolated string with a local `escape()` for `& < > " '`:

```ts
export interface MastheadData {
  metaTitle: string;
  metaLine2: string;
  metaLine3: string;
  metaLine4: string;
  tagline: string;
  stampDefault: string;
  stampInk: string;
  stampRed: string;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function masthead(data: MastheadData): string {
  return `<header class="masthead">
  <div>
    <span class="wordmark-stamp">VINYL<br>TRAFFIC</span>
    <div class="stamps-row">
      <span class="stamp">${escape(data.stampDefault)}</span>
      <span class="stamp ink">${escape(data.stampInk)}</span>
      <span class="stamp red">${escape(data.stampRed)}</span>
    </div>
  </div>
  <div class="masthead-meta">
    <div><strong>${escape(data.metaTitle)}</strong></div>
    <div>${escape(data.metaLine2)}</div>
    <div>${escape(data.metaLine3)}</div>
    <div>${escape(data.metaLine4)}</div>
    <p class="tagline">${escape(data.tagline)}</p>
  </div>
</header>`;
}
```

## `base.ts`

Ensure **`src/templates/pages/base.ts`** matches **`sdd/specs/site/pages/base/spec.md`** (optional `beforeMain` between docket and `<main>`). **Do not** import or call `masthead` in this file.

## `home.ts` (only caller of `masthead`)

Replace **`src/templates/pages/home.ts`** with **exactly** this content (vision-default copy; `metaTitle` / `tagline` / stamps match `sdd/reference/vision.html`):

```ts
import { masthead } from '../components/masthead';
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
    beforeMain: masthead({
      metaTitle: 'STOCKROOM & DISPATCH',
      metaLine2: 'UNIT 14B · BAY 3',
      metaLine3: '22:00 — 05:00 · By appt.',
      metaLine4: '+36 1 ___ ____',
      tagline:
        "A small operation moving records out of an industrial unit off Soroksári út. We work nights. Crypto only. We don't have a shop — we have a stockroom.",
      stampDefault: 'FRAGILE · DO NOT BEND',
      stampInk: 'BTC · ETH · USDC · XMR',
      stampRed: 'NO RETURNS · NO REFUNDS',
    }),
    children: '',
  });
}
```

## Wiring (this spec)

- Add `@import "./components/masthead.css";` to `src/styles/index.css` **after** the docket-strip import.

## Acceptance criteria

- [ ] `src/styles/components/masthead.css` matches the CSS block byte-for-byte.
- [ ] `src/templates/components/masthead.ts` matches the TypeScript block byte-for-byte.
- [ ] `src/templates/pages/base.ts` matches **`sdd/specs/site/pages/base/spec.md`** and **does not** import `masthead`.
- [ ] `src/templates/pages/home.ts` matches its block byte-for-byte.
- [ ] `src/styles/index.css` imports `masthead.css`.
- [ ] Emitted `/` HTML: first child of `.page` is the docket root (`.docket`); next sibling is **`header.masthead`**; then `<main>`.
- [ ] `pnpm build` succeeds; `pnpm preview` shows wordmark **VINYL** / **TRAFFIC**, three stamps, meta lines, and tagline text as in `home.ts`.
- [ ] Extend **`e2e/home.spec.ts`**: assert `header.masthead` is visible, `.wordmark-stamp` contains both words, one `.stamp` per variant (default / `.ink` / `.red`), and `.masthead-meta .tagline` matches the tagline string (or a stable substring).
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Nav tabs, sections below the masthead, `paper-rise` or other motion from `vision.html`, tape decorations, other routes, font preload additions, changing docket or build helpers, social meta, i18n.
