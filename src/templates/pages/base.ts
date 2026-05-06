/**
 * Base page — the layout shell.
 *
 * Authoritative source: sdd/specs/site/pages/base/base.ts
 * Target path:          src/templates/pages/base.ts
 *
 * Spec: sdd/specs/site/pages/base/spec.md
 *
 * Composes the docket strip and a main content slot into a full HTML
 * document. Font preload hrefs match `@font-face` filenames in
 * `src/styles/base.css` / global-css.
 */

import { docketStrip, type DocketStripData } from '../components/docket-strip';

export type { DocketStripData };

export interface BasePageData {
  /** Document title, used for <title>. */
  title: string;

  /** Docket strip data, passed verbatim to the docket-strip template. */
  docket: DocketStripData;

  /** Pre-rendered HTML for the page's main content slot. May be empty. */
  children: string;
}

/**
 * Escape interpolated text for use inside <title>. Same pattern as
 * docket-strip.ts until static-build consolidates into build/render.ts.
 */
function escapeTitle(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Literal `--paper` token; meta tags cannot use CSS custom properties. */
const THEME_COLOR_PAPER = '#ece6d4';

export function basePage(data: BasePageData): string {
  const titleSafe = escapeTitle(data.title);
  const docketHtml = docketStrip(data.docket);

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
      <main>${data.children}</main>
    </div>
  </body>
</html>`;
}
