# Nav tabs

## Intent

Add the **nav tabs** row from `sdd/reference/vision.html` (`nav.tabs`: primary section links plus `.right-tabs` utilities) as **`src/templates/components/nav-tabs.ts`** + **`src/styles/components/nav-tabs.css`**. **Layout and call site** — where **`navTabs()`** is invoked — are defined in **`sdd/specs/site/pages/base/spec.md`**; the homepage passes **`NavTabsData`** via **`basePage`** per **`sdd/specs/site/pages/home/spec.md`**.

**Run third**, after **`docket-strip`** and **`masthead`**, and **before** **`sdd/specs/site/pages/base`**.

Do not read `sdd/context/` or other specs unless something here is unclear.

## Preconditions

- Docket strip and masthead component files exist; global tokens include `--ink`, `--ink-soft`, `--orange`, `--paper`.

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

## Composition

- **`src/templates/pages/base.ts`** calls **`navTabs(data.navTabs)`** per **`sdd/specs/site/pages/base/spec.md`**.
- **`src/templates/pages/home.ts`** supplies the **`navTabs`** object on **`basePage({ ... })`** per **`sdd/specs/site/pages/home/spec.md`**. **`home.ts` must not** import or invoke **`navTabs()`** — only pass data.

## Wiring (this spec)

- Add `@import "./components/nav-tabs.css";` to `src/styles/index.css` **after** the masthead import.

## Acceptance criteria

- [ ] `src/styles/components/nav-tabs.css` matches the CSS block byte-for-byte.
- [ ] `src/templates/components/nav-tabs.ts` matches the TypeScript block byte-for-byte.
- [ ] `src/templates/pages/base.ts` matches **`sdd/specs/site/pages/base/spec.md`** and **imports** `navTabs`.
- [ ] `src/templates/pages/home.ts` matches **`sdd/specs/site/pages/home/spec.md`** (includes **`navTabs: { ... }`** on **`basePage`**).
- [ ] `src/styles/index.css` imports `nav-tabs.css`.
- [ ] Emitted `/` HTML order inside `.page`: `.docket`, then `header.masthead`, then `nav.tabs`, then `<main>`.
- [ ] `pnpm build` succeeds; `pnpm preview` shows six primary tabs, two right tabs, and the first primary tab uses `.active` styling (orange fill).
- [ ] Extend **`e2e/home.spec.ts`**: assert `nav.tabs` exists; exactly one `nav.tabs > a.active`; primary labels include `Stockroom` and `Find Us`; `.right-tabs` contains **Search** (or full **Search ↗**) and **Bag (0)**; `header.masthead` is an **earlier sibling** than `nav.tabs` under `.page`.
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Hash routing or real URLs for tabs, SPA section switching, bag count logic, search UI, other pages or routes, `prefers-reduced-motion` overrides for tab transitions, font preload changes, i18n.
