import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';
import { docketStrip, type DocketStripData } from '../src/templates/components/docket-strip';

const baseData: DocketStripData = {
  open: true,
  dktRef: 'DKT-2026-W01-001',
  dateLabel: 'MON 01.01.2026 / 12:00',
  unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX',
};

test.describe('Docket strip (unit)', () => {
  test('open state includes .light status', () => {
    const html = docketStrip(baseData);
    expect(html).toContain('UNIT OPEN — STAFF ON SITE');
    expect(html).toContain('class="light"');
  });

  test('closed state omits .light', () => {
    const html = docketStrip({ ...baseData, open: false });
    expect(html).toContain('UNIT CLOSED');
    expect(html).not.toContain('class="light"');
  });

  test('wraps output in .docket div with .left and .right sections', () => {
    const html = docketStrip(baseData);
    expect(html).toMatch(/^<div class="docket">/);
    expect(html).toContain('<div class="left">');
    expect(html).toContain('<div class="right">');
  });

  test('escapes dktRef for HTML', () => {
    const html = docketStrip({ ...baseData, dktRef: '<script>alert("xss")</script>' });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  test('escapes dateLabel and unitLabel', () => {
    const html = docketStrip({ ...baseData, dateLabel: 'MON & <fun>' });
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;fun&gt;');

    const html2 = docketStrip({ ...baseData, unitLabel: "O'Brien's Unit" });
    expect(html2).toContain('&#39;');
  });

  test('docket CSS classes are present in built bundle', async () => {
    const distPath = join(process.cwd(), 'dist');
    const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf-8');
    const cssMatch = indexHtml.match(/href="([^"]*\.css)"/);
    expect(cssMatch).toBeTruthy();
    if (cssMatch?.[1]) {
      const cssPath = join(distPath, cssMatch[1].replace(/^\//, ''));
      const cssContent = readFileSync(cssPath, 'utf-8');
      expect(cssContent).toContain('.docket');
      expect(cssContent).toContain('.docket .left');
      expect(cssContent).toContain('.docket .right');
      expect(cssContent).toContain('.docket .ref');
    }
  });

  test('docketStrip is exported from component module', () => {
    expect(typeof docketStrip).toBe('function');
  });

  test('src/styles/index.css imports docket-strip.css', () => {
    const indexCss = readFileSync(join(process.cwd(), 'src/styles/index.css'), 'utf-8');
    expect(indexCss).toContain('@import "./components/docket-strip.css"');
  });
});

test.describe('Docket strip (preview)', () => {
  test('.page contains live docket', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page.locator('.page .docket')).toBeVisible();
  });
});
