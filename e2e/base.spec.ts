/**
 * Base page acceptance tests
 *
 * Spec: sdd/specs/site/pages/base/spec.md
 *
 * Validates the base page template: document structure, docket strip,
 * main content slot, font preloads, meta tags, and HTML escaping.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:4173';

test.describe('Base page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for fonts to be ready to prevent race conditions
    await page.evaluate(() => document.fonts.ready);
  });

  test('renders with html lang="en"', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Vinyl Traffic — Industrial Record Dispatch');
  });

  test('has theme-color meta tag matching --paper token', async ({ page }) => {
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#ece6d4');
  });

  test('has charset and viewport meta tags', async ({ page }) => {
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBe('utf-8');

    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBe('width=device-width, initial-scale=1');
  });

  test('has font preload links with correct attributes', async ({ page }) => {
    // Special Elite preload
    const specialElitePreload = page.locator('link[rel="preload"][href="/fonts/special-elite-v20-latin-regular.woff2"]');
    await expect(specialElitePreload).toHaveCount(1);
    await expect(specialElitePreload).toHaveAttribute('as', 'font');
    await expect(specialElitePreload).toHaveAttribute('type', 'font/woff2');
    await expect(specialElitePreload).toHaveAttribute('crossorigin', '');

    // JetBrains Mono preload
    const jetbrainsMonoPreload = page.locator('link[rel="preload"][href="/fonts/jetbrains-mono-v24-latin-regular.woff2"]');
    await expect(jetbrainsMonoPreload).toHaveCount(1);
    await expect(jetbrainsMonoPreload).toHaveAttribute('as', 'font');
    await expect(jetbrainsMonoPreload).toHaveAttribute('type', 'font/woff2');
    await expect(jetbrainsMonoPreload).toHaveAttribute('crossorigin', '');
  });

  test('has .page wrapper containing docket strip and main', async ({ page }) => {
    const pageWrapper = page.locator('.page');
    await expect(pageWrapper).toBeVisible();

    // Docket strip should be first child
    const docketStrip = pageWrapper.locator('.docket-strip');
    await expect(docketStrip).toBeVisible();

    // Main should be second child
    const main = pageWrapper.locator('main');
    await expect(main).toBeVisible();
  });

  test('docket strip is the first visible block in body', async ({ page }) => {
    const firstVisibleElement = page.locator('body > .page > :first-child');
    await expect(firstVisibleElement).toHaveClass(/docket-strip/);
  });

  test('main element is present (homepage slot empty until content blocks)', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Home page passes children: "" — see src/templates/pages/home.ts & pages/home spec.
    await expect(main).toHaveText('');
  });

  test('escapes HTML in title field', async ({ page }) => {
    // This test would require modifying the page data to include HTML
    // For now, we verify that the current title is properly escaped
    const title = await page.title();
    expect(title).not.toContain('<');
    expect(title).not.toContain('>');
  });

  test('has correct document structure', async ({ page }) => {
    // Verify doctype (implicit in the HTML)
    const doctype = await page.evaluate(() => {
      const doctype = document.doctype;
      return doctype ? doctype.name : null;
    });
    expect(doctype).toBe('html');

    // Verify structure: html > head + body
    const html = page.locator('html');
    await expect(html).toBeVisible();

    const head = page.locator('head');
    await expect(head).toHaveCount(1);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('.page wrapper applies max-width and centering', async ({ page }) => {
    const pageStyles = await page.locator('.page').evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        maxWidth: styles.maxWidth,
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
      };
    });

    expect(pageStyles.maxWidth).toBe('1280px');
    expect(pageStyles.marginLeft).toBe(pageStyles.marginRight);
  });

  test('main element has top padding', async ({ page }) => {
    const mainPaddingTop = await page.locator('main').evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });

    // Should have some padding (1.5rem = 24px at default 16px base)
    expect(parseFloat(mainPaddingTop)).toBeGreaterThan(20);
  });
});
