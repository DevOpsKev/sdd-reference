/**
 * Home page acceptance tests
 *
 * Spec: sdd/specs/site/pages/home/spec.md
 *
 * Validates the homepage: docket strip with build-time data, empty main slot,
 * correct title, and the expected composition with pages/base.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for fonts to be ready to prevent race conditions
    await page.evaluate(() => document.fonts.ready);
  });

  test('/ returns 200', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Vinyl Traffic — Industrial Record Dispatch');
  });

  test('docket strip is rendered as first body block', async ({ page }) => {
    const docketStrip = page.locator('.docket-strip');
    await expect(docketStrip).toBeVisible();

    // Check it's the first visible element in .page
    const firstChild = page.locator('.page > *').first();
    await expect(firstChild).toHaveClass('docket-strip');
  });

  test('docket date label matches canonical format pattern', async ({ page }) => {
    const dateLabel = page.locator('.docket-strip__date');
    await expect(dateLabel).toBeVisible();

    const text = await dateLabel.textContent();
    // Pattern: DDD DD.MM.YYYY / HH:MM
    // Example: WED 06.05.2026 / 02:14
    expect(text).toMatch(/^[A-Z]{3} \d{2}\.\d{2}\.\d{4} \/ \d{2}:\d{2}$/);
  });

  test('docket DKT ref matches pattern DKT-YYYY-Www-001', async ({ page }) => {
    const dktRef = page.locator('.docket-strip__ref');
    await expect(dktRef).toBeVisible();

    const text = await dktRef.textContent();
    expect(text).toMatch(/^DKT-\d{4}-W\d{2}-001$/);
  });

  test('docket unit label is exactly correct', async ({ page }) => {
    const unitLabel = page.locator('.docket-strip__unit');
    await expect(unitLabel).toBeVisible();

    const text = await unitLabel.textContent();
    expect(text).toBe('UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX');
  });

  test('docket open/closed state matches build moment', async ({ page }) => {
    // The page is built at build time, so we check that the open/closed state
    // is consistent with the presence/absence of the __pulse element
    const status = page.locator('.docket-strip__status');
    await expect(status).toBeVisible();

    const pulseElement = page.locator('.docket-strip__pulse');
    const statusText = await status.textContent();

    const isOpen = statusText?.includes('UNIT OPEN');
    const hasPulse = (await pulseElement.count()) > 0;

    // If open, must have pulse; if closed, must not have pulse
    if (isOpen) {
      expect(hasPulse).toBe(true);
      expect(statusText).toContain('UNIT OPEN — STAFF ON SITE');
    } else {
      expect(hasPulse).toBe(false);
      expect(statusText).toContain('UNIT CLOSED');
    }
  });

  test('main element exists and is empty', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check that main is empty (no text content, no child elements with content)
    const text = await main.textContent();
    expect(text?.trim()).toBe('');
  });

  test('bundled stylesheet is linked', async ({ page }) => {
    // Check for stylesheet link with content-hashed filename
    const stylesheet = page.locator('link[rel="stylesheet"][href^="/assets/"]');
    await expect(stylesheet).toHaveCount(1);

    const href = await stylesheet.getAttribute('href');
    expect(href).toMatch(/^\/assets\/index-[a-zA-Z0-9_-]+\.css$/);
  });

  test('font preloads are present', async ({ page }) => {
    // Special Elite
    const specialElite = page.locator(
      'link[rel="preload"][href="/fonts/special-elite-v20-latin-regular.woff2"]'
    );
    await expect(specialElite).toHaveCount(1);

    // JetBrains Mono
    const jetbrainsMono = page.locator(
      'link[rel="preload"][href="/fonts/jetbrains-mono-v24-latin-regular.woff2"]'
    );
    await expect(jetbrainsMono).toHaveCount(1);
  });

  test('page wrapper has correct structure', async ({ page }) => {
    const pageWrapper = page.locator('.page');
    await expect(pageWrapper).toBeVisible();

    // Should contain docket strip and main
    const docketStrip = pageWrapper.locator('.docket-strip');
    const main = pageWrapper.locator('main');

    await expect(docketStrip).toBeVisible();
    await expect(main).toBeVisible();
  });
});
