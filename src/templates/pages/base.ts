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
