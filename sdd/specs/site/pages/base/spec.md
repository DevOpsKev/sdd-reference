# Base page — layout shell

## Intent

Create `src/templates/pages/base.ts`: full HTML document with **docket above `<main>`** inside `.page`, and an optional **opaque `beforeMain`** fragment between docket and `<main>` (used by the homepage masthead spec — `base.ts` does not import masthead). **Run second**, after `sdd/specs/site/components/docket-strip/`.

`src/main.ts` stays a **CSS-only** entry (imports `./styles/index.css`); do not replace the DOM at runtime. The homepage HTML is produced at **build time** by `pages/home` + `build/generate-index.ts`.

## Authoritative TypeScript

Create `src/templates/pages/base.ts` with **exactly** this content:

```ts
import { docketStrip, type DocketStripData } from '../components/docket-strip';

export type { DocketStripData };

export interface BasePageData {
  title: string;
  docket: DocketStripData;
  /** Pre-main HTML fragment (e.g. homepage masthead). Not generated inside this file. */
  beforeMain?: string;
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
  const beforeMainHtml = data.beforeMain ?? '';

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
      ${beforeMainHtml}
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
- [ ] First child of `.page` in emitted HTML is the docket root (`.docket`).
- [ ] `pnpm build` succeeds once **home** spec wires `generate-index.ts`.
- [ ] `provenance.md` / `scenarios.md` per `AGENT_ROLE`.

## Out of scope

Homepage masthead component and copy (`sdd/specs/site/components/masthead/spec.md`). Nav, footer, meta tags beyond what’s in the template, client-side JS beyond `main.ts` importing CSS.
