# Base page — layout shell

## Intent

Create `src/templates/pages/base.ts`: full HTML document whose **`.page`** region renders, in order: **docket** (`docketStrip`), **masthead** (`masthead`), **nav tabs** (`navTabs`), then **`<main>`** — all composed inside this file (no `beforeMain` slot). Callers pass structured data for each region.

**Run fourth**, after `sdd/specs/site/components/docket-strip/`, `sdd/specs/site/components/masthead/`, and `sdd/specs/site/components/nav-tabs/` (so the imported component modules and stylesheets exist). **Run before** `sdd/specs/site/pages/home/`.

`src/main.ts` stays a **CSS-only** entry (imports `./styles/index.css`); do not replace the DOM at runtime. The homepage HTML is produced at **build time** by `pages/home` + `build/generate-index.ts`.

## Authoritative TypeScript

Create `src/templates/pages/base.ts` with **exactly** this content:

```ts
import { docketStrip, type DocketStripData } from '../components/docket-strip';
import { masthead, type MastheadData } from '../components/masthead';
import { navTabs, type NavTabsData } from '../components/nav-tabs';

export type { DocketStripData, MastheadData, NavTabsData };

export interface BasePageData {
  title: string;
  docket: DocketStripData;
  masthead: MastheadData;
  navTabs: NavTabsData;
  children: string;
}

function escapeTitle(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const THEME_COLOR_PAPER = '#ece6d4';

export function basePage(data: BasePageData): string {
  const titleSafe = escapeTitle(data.title);
  const docketHtml = docketStrip(data.docket);
  const mastheadHtml = masthead(data.masthead);
  const navTabsHtml = navTabs(data.navTabs);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="${THEME_COLOR_PAPER}">
    <title>${titleSafe}</title>
    <link rel="preload" as="font" type="font/woff2" href="/fonts/special-elite-v20-latin-regular.woff2" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="/fonts/jetbrains-mono-v24-latin-regular.woff2" crossorigin>
  </head>
  <body>
    <div class="page">
      ${docketHtml}
      ${mastheadHtml}
      ${navTabsHtml}
      <main>${data.children}</main>
    </div>
  </body>
</html>`;
}
```

## Layout CSS

Ensure `src/styles/base.css` contains **exactly** these rules (add or replace if needed), placed **before** the `prefers-reduced-motion` block:

```css
/* ── Page layout (base page) ─────────────────────────────────── */

.page {
  max-width: var(--page-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--gutter);
  padding-right: var(--gutter);
}

main {
  padding-top: 1.5rem;
}
```

## Acceptance criteria

- [ ] `src/templates/pages/base.ts` matches the TypeScript block byte-for-byte.
- [ ] `src/styles/base.css` includes the `.page` and `main` rules above.
- [ ] Direct children of `.page` in emitted HTML are, in order: `.docket`, `header.masthead`, `nav.tabs`, `<main>`.
- [ ] `pnpm build` succeeds once **`pages/home`** wires `generate-index.ts` and supplies `masthead` / `navTabs` data per **`sdd/specs/site/pages/home/spec.md`**.
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Per-component copy and CSS (see component specs under `sdd/specs/site/components/`). Footer, extra meta tags beyond what’s in the template, client-side JS beyond `main.ts` importing CSS.
