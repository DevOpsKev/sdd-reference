import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { docketStrip, type DocketStripData } from '../src/templates/components/docket-strip';

test.describe('DocketStrip pure function', () => {
  const baseData: DocketStripData = {
    open: true,
    dktRef: 'DKT-2026-W19-001',
    dateLabel: 'WED 07.05.2026 / 14:30',
    unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX',
  };

  test('renders UNIT OPEN status when open=true', () => {
    const html = docketStrip(baseData);
    expect(html).toContain('UNIT OPEN — STAFF ON SITE');
    expect(html).toContain('class="light"');
  });

  test('renders UNIT CLOSED status when open=false', () => {
    const html = docketStrip({ ...baseData, open: false });
    expect(html).toContain('UNIT CLOSED');
    expect(html).not.toContain('class="light"');
  });

  test('wraps output in .docket div with .left and .right sections', () => {
    const html = docketStrip(baseData);
    expect(html).toMatch(/^<div class="docket">/);
    expect(html).toContain('<div class="left">');
    expect(html).toContain('<div class="right">');
    expect(html).toMatch(/<\/div>$/);
  });

  test('escapes HTML special characters in dktRef', () => {
    const html = docketStrip({ ...baseData, dktRef: '<script>alert("xss")</script>' });
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  test('escapes HTML special characters in dateLabel', () => {
    const html = docketStrip({ ...baseData, dateLabel: 'MON & <fun>' });
    expect(html).toContain('MON &amp; &lt;fun&gt;');
  });

  test('escapes HTML special characters in unitLabel', () => {
    const html = docketStrip({ ...baseData, unitLabel: "O'Brien's Unit" });
    expect(html).toContain('O&#39;Brien&#39;s Unit');
  });
});

test.describe('DocketStrip CSS', () => {
  test('docket CSS classes are present in built bundle', () => {
    const distIndex = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
    const cssMatch = distIndex.match(/href="([^"]*\.css)"/);
    expect(cssMatch).toBeTruthy();

    if (cssMatch && cssMatch[1]) {
      const cssPath = join(process.cwd(), 'dist', cssMatch[1].replace(/^\//, ''));
      const cssContent = readFileSync(cssPath, 'utf-8');

      expect(cssContent).toContain('.docket');
      expect(cssContent).toContain('.docket .left');
      expect(cssContent).toContain('.docket .right');
      expect(cssContent).toContain('.light');
      // Vite/postcss minifies ::before → :before
      expect(cssContent).toContain('.light:before');
      expect(cssContent).toContain('@keyframes blink');
      expect(cssContent).toContain('.docket .ref');
    }
  });
});

test.describe('DocketStrip spec compliance', () => {
  test('src/templates/components/docket-strip.ts exists and exports docketStrip', () => {
    expect(typeof docketStrip).toBe('function');
  });

  test('src/styles/index.css imports docket-strip.css', () => {
    const indexCss = readFileSync(
      join(process.cwd(), 'src', 'styles', 'index.css'),
      'utf-8'
    );
    expect(indexCss).toContain('@import "./components/docket-strip.css"');
  });

  test('dist HTML contains .page and main elements (base page shell)', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page.locator('.page')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('docket is mounted in the live page (base + home wiring)', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page.locator('.page .docket')).toBeVisible();
  });
});
