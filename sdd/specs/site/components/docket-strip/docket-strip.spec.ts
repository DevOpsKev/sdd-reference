/**
 * Playwright test for docket-strip component.
 *
 * Spec: sdd/specs/site/components/docket-strip/spec.md
 *
 * Validates acceptance criteria:
 * - Open/closed state rendering
 * - Input field presence
 * - HTML escaping
 * - Positioning as first visible block
 *
 * NOTE: This test generates HTML inline rather than importing the TypeScript
 * source because we're at vite-baseline stage without a page that uses this
 * component yet. When pages start using docket-strip, update this to test
 * against those actual pages.
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate HTML for testing. This mirrors the logic in
 * src/templates/components/docket-strip.ts until we have
 * actual pages using the component.
 */
function docketStrip(data: {
  open: boolean;
  dktRef: string;
  dateLabel: string;
  unitLabel: string;
}): string {
  function escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const status = data.open
    ? `<span class="docket-strip__status docket-strip__status--open">
        <span class="docket-strip__pulse" aria-hidden="true"></span>
        UNIT OPEN — STAFF ON SITE
      </span>`
    : `<span class="docket-strip__status docket-strip__status--closed">
        UNIT CLOSED
      </span>`;

  return `<div class="docket-strip">
  <div class="docket-strip__side docket-strip__side--left">
    ${status}
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__ref">${escape(data.dktRef)}</span>
  </div>
  <div class="docket-strip__side docket-strip__side--right">
    <span class="docket-strip__date">${escape(data.dateLabel)}</span>
    <span class="docket-strip__sep" aria-hidden="true">·</span>
    <span class="docket-strip__unit">${escape(data.unitLabel)}</span>
  </div>
</div>`;
}

/**
 * Create a test page with the docket strip component and inlined CSS.
 * We inline the CSS because setContent doesn't load external stylesheets reliably.
 */
function createTestPage(stripHTML: string): string {
  // Read and inline the CSS bundle
  const distDir = join(process.cwd(), 'dist');
  const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8');
  const cssMatch = indexHtml.match(/href="(\/assets\/index-[^"]+\.css)"/);
  const cssPath = cssMatch ? join(distDir, cssMatch[1].slice(1)) : join(distDir, 'assets/index.css');

  let cssContent = '';
  try {
    cssContent = readFileSync(cssPath, 'utf-8');
  } catch (e) {
    console.warn('Could not read CSS bundle, using empty styles');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docket Strip Test</title>
  <style>${cssContent}</style>
</head>
<body>
${stripHTML}
<script>
  // Signal when fonts are ready for stable rendering
  document.fonts.ready.then(() => {
    document.body.dataset.fontsReady = 'true';
  });
</script>
</body>
</html>`;
}

test.describe('docket-strip component', () => {
  test('renders open state with pulse element and correct status text', async ({ page }) => {
    const html = docketStrip({
      open: true,
      dktRef: 'DKT-2026-W19-006',
      dateLabel: 'WED 06.05.2026 / 02:14',
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX'
    });

    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });

    // Wait for fonts to stabilize rendering per spec stability requirements
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    // Verify open status text
    const statusElement = page.locator('.docket-strip__status--open');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toContainText('UNIT OPEN — STAFF ON SITE');

    // Verify pulse element is present for open state
    // Note: pulse has aria-hidden="true" so we check presence, not visibility
    const pulseElement = page.locator('.docket-strip__pulse');
    await expect(pulseElement).toHaveCount(1);
    await expect(pulseElement).toHaveAttribute('aria-hidden', 'true');

    // Verify it renders visually (even though aria-hidden)
    const isDisplayed = await pulseElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    expect(isDisplayed).toBe(true);
  });

  test('renders closed state without pulse element and correct status text', async ({ page }) => {
    const html = docketStrip({
      open: false,
      dktRef: 'DKT-2026-W19-006',
      dateLabel: 'WED 06.05.2026 / 02:14',
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX'
    });

    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    // Verify closed status text
    const statusElement = page.locator('.docket-strip__status--closed');
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toContainText('UNIT CLOSED');

    // Verify pulse element is NOT present for closed state
    const pulseElement = page.locator('.docket-strip__pulse');
    await expect(pulseElement).toHaveCount(0);
  });

  test('renders all four input fields verbatim', async ({ page }) => {
    const testData = {
      open: true,
      dktRef: 'DKT-2026-W19-123',
      dateLabel: 'THU 07.05.2026 / 14:30',
      unitLabel: 'UNIT 42 · TEST STREET · CITY'
    };

    const html = docketStrip(testData);
    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    // Verify DKT reference
    const refElement = page.locator('.docket-strip__ref');
    await expect(refElement).toContainText(testData.dktRef);

    // Verify date label
    const dateElement = page.locator('.docket-strip__date');
    await expect(dateElement).toContainText(testData.dateLabel);

    // Verify unit label
    const unitElement = page.locator('.docket-strip__unit');
    await expect(unitElement).toContainText(testData.unitLabel);

    // Verify status (derived from open field)
    const statusElement = page.locator('.docket-strip__status');
    await expect(statusElement).toContainText('UNIT OPEN — STAFF ON SITE');
  });

  test('is the first visible block in document body', async ({ page }) => {
    const stripHTML = docketStrip({
      open: true,
      dktRef: 'DKT-2026-W19-006',
      dateLabel: 'WED 06.05.2026 / 02:14',
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX'
    });

    const pageHTML = createTestPage(stripHTML + '<div class="other-content">Other content</div>');
    await page.setContent(pageHTML, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    // Get all visible block elements in body
    const firstVisibleBlock = await page.evaluate(() => {
      const blocks = Array.from(document.body.children).filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && el instanceof HTMLElement;
      });
      return blocks[0]?.className || '';
    });

    expect(firstVisibleBlock).toContain('docket-strip');
  });

  test('escapes HTML injection in all input fields', async ({ page }) => {
    const maliciousData = {
      open: false,
      dktRef: '<script>alert("XSS-dkt")</script>',
      dateLabel: '<img src=x onerror="alert(\'XSS-date\')">',
      unitLabel: '<svg/onload=alert("XSS-unit")>'
    };

    const html = docketStrip(maliciousData);
    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });

    // Wait a moment to ensure no scripts execute
    await page.waitForTimeout(500);

    // Verify the malicious strings are escaped as text, not executed
    await expect(page.locator('.docket-strip__ref')).toContainText('<script>alert("XSS-dkt")</script>');
    await expect(page.locator('.docket-strip__date')).toContainText('<img src=x onerror="alert(\'XSS-date\')">');
    await expect(page.locator('.docket-strip__unit')).toContainText('<svg/onload=alert("XSS-unit")>');

    // Verify no actual script/img/svg elements were created
    await expect(page.locator('.docket-strip script')).toHaveCount(0);
    await expect(page.locator('.docket-strip img')).toHaveCount(0);
    await expect(page.locator('.docket-strip svg')).toHaveCount(0);

    // Verify no alert was triggered
    page.on('dialog', () => {
      throw new Error('Unexpected alert dialog - HTML injection was not escaped!');
    });
  });

  test('pulse animation element stability check', async ({ page }) => {
    const html = docketStrip({
      open: true,
      dktRef: 'DKT-2026-W19-006',
      dateLabel: 'WED 06.05.2026 / 02:14',
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX'
    });

    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    // Per spec: assert presence of __pulse element, not animation timing
    // Note: pulse has aria-hidden="true" so we check presence, not visibility
    const pulseElement = page.locator('.docket-strip__pulse');
    await expect(pulseElement).toHaveCount(1);

    // Verify it's a small circular element (6x6px per spec)
    const box = await pulseElement.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeCloseTo(6, 1);
    expect(box!.height).toBeCloseTo(6, 1);

    // Verify the pulse has the expected styling (green background)
    const bgColor = await pulseElement.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    // #3a8a4a in RGB is rgb(58, 138, 74)
    expect(bgColor).toBe('rgb(58, 138, 74)');
  });

  test('responsive layout stacks sides below 720px', async ({ page }) => {
    const html = docketStrip({
      open: true,
      dktRef: 'DKT-2026-W19-006',
      dateLabel: 'WED 06.05.2026 / 02:14',
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX'
    });

    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    const strip = page.locator('.docket-strip');
    const leftSide = page.locator('.docket-strip__side--left');
    const rightSide = page.locator('.docket-strip__side--right');

    // Test desktop layout (≥ 720px) - sides should be horizontal
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(100); // Let layout settle

    const desktopFlexDirection = await strip.evaluate((el) =>
      window.getComputedStyle(el).flexDirection
    );
    expect(desktopFlexDirection).toBe('row');

    // Test mobile layout (< 720px) - sides should stack vertically
    await page.setViewportSize({ width: 600, height: 800 });
    await page.waitForTimeout(100); // Let layout settle

    const mobileFlexDirection = await strip.evaluate((el) =>
      window.getComputedStyle(el).flexDirection
    );
    expect(mobileFlexDirection).toBe('column');

    // Verify left side is above right side in mobile layout
    const leftBox = await leftSide.boundingBox();
    const rightBox = await rightSide.boundingBox();
    expect(leftBox).toBeTruthy();
    expect(rightBox).toBeTruthy();
    expect(leftBox!.y).toBeLessThan(rightBox!.y);
  });

  test('uses correct separator characters', async ({ page }) => {
    const html = docketStrip({
      open: true,
      dktRef: 'DKT-2026-W19-006',
      dateLabel: 'WED 06.05.2026 / 02:14',
      unitLabel: 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX'
    });

    await page.setContent(createTestPage(html), { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.body.dataset.fontsReady === 'true', {
      timeout: 5000
    });

    // Verify em-dash (—) is used within the status text
    const statusElement = page.locator('.docket-strip__status--open');
    const statusText = await statusElement.textContent();
    expect(statusText).toContain('—'); // em-dash
    expect(statusText).toContain('UNIT OPEN — STAFF ON SITE');

    // Verify middle-dots (·) are used as separators between metadata items
    const separators = page.locator('.docket-strip__sep');
    await expect(separators).toHaveCount(2); // 1 on left side, 1 on right side

    const separatorText = await separators.first().textContent();
    expect(separatorText).toBe('·'); // middle-dot

    // Verify all separators have aria-hidden
    const allSeparators = await separators.all();
    for (const sep of allSeparators) {
      await expect(sep).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
