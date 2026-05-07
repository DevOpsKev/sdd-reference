# Docket strip

## Intent

Create the docket component under `src/` and register its stylesheet. **Run first** in the site chain: **`docket-strip`** → **`masthead`** (component) → **`nav-tabs`** (component) → **`pages/base`** → **`pages/home`**.

Do not read `sdd/context/` or other specs unless something here is unclear.

## Authoritative CSS

Create `src/styles/components/docket-strip.css` with **exactly** this content (uses `var(--ink)` and `var(--ink-faded)` from existing global CSS):

```css
.docket {
  border-bottom: 2px solid var(--ink);
  padding: 1rem 0 0.85rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.docket .left { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
.docket .right { display: flex; gap: 1.5rem; align-items: center; flex-wrap: wrap; }
.light {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ink);
}
.light::before {
  content: '';
  width: 8px; height: 8px;
  background: #2a8a3a;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(42, 138, 58, 0.6);
  animation: blink 3s ease-in-out infinite;
}
@keyframes blink {
  0%, 90%, 100% { opacity: 1; }
  95% { opacity: 0.4; }
}
.docket .ref { color: var(--ink-faded); }
```

## Authoritative TypeScript

Create `src/templates/components/docket-strip.ts` — no imports from elsewhere; escape `dktRef`, `dateLabel`, `unitLabel` with a local `escape()` for `& < > " '`:

```ts
export interface DocketStripData {
  open: boolean;
  dktRef: string;
  dateLabel: string;
  unitLabel: string;
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function docketStrip(data: DocketStripData): string {
  const leftStatus = data.open
    ? '<span class="light">UNIT OPEN — STAFF ON SITE</span>'
    : '<span>UNIT CLOSED</span>';

  return `<div class="docket">
  <div class="left">
    ${leftStatus}
    <span class="ref">${escape(data.dktRef)}</span>
  </div>
  <div class="right">
    <span>${escape(data.dateLabel)}</span>
    <span class="ref">${escape(data.unitLabel)}</span>
  </div>
</div>`;
}
```

## Wiring (this spec only)

- Add `@import "./components/docket-strip.css";` to `src/styles/index.css` after `base.css`.
- Create `src/templates/components/` if missing.

## Acceptance criteria

- [ ] `src/templates/components/docket-strip.ts` and `src/styles/components/docket-strip.css` match the blocks above byte-for-byte.
- [ ] `src/styles/index.css` imports the component stylesheet.
- [ ] `pnpm build` succeeds after **`pages/base`** and **`pages/home`** specs are applied (this spec alone may not leave a full page).
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Date strings, DKT values, open/closed boolean — supplied by callers of **`basePage`** (e.g. **`homePage`** in **`pages/home`**).
