import { test, expect } from '@playwright/test';

/**
 * Vite baseline + app shell smoke checks.
 *
 * The root page is rendered by `src/main.ts` using `basePage()` from
 * `sdd/specs/site/pages/base/` (docket strip + `<main>` slot). Title and
 * visible content expectations follow that shell — see `index.html` and
 * `src/main.ts` for the canonical title string.
 */

const PAGE_TITLE = 'Vinyl Traffic — Industrial Record Dispatch';

test.describe('Vite baseline', () => {
  test('serves root route with HTTP 200', async ({ page }) => {
    const response = await page.goto('http://localhost:4173/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('page title matches base shell', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page).toHaveTitle(PAGE_TITLE);
  });

  test('rendered HTML includes title string', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    const html = await page.content();
    expect(html).toContain(PAGE_TITLE);
  });

  test('base page shell renders docket strip and main content', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    await expect(page.locator('.docket-strip')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();

    const body = page.locator('body');
    const textContent = (await body.textContent()) ?? '';
    expect(textContent.length).toBeGreaterThan(0);
    expect(textContent).toMatch(/UNIT OPEN|UNIT CLOSED/);
  });

  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('http://localhost:4173/');

    // Wait a moment for any async errors
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });

  test('built assets are loaded correctly', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Bundled CSS remains linked after basePage() merges head (see main.ts)
    const cssLinks = await page.locator('link[rel="stylesheet"]').count();
    expect(cssLinks).toBeGreaterThan(0);

    // Entry script may no longer sit under <body> after innerHTML replace;
    // shell visibility implies the module ran.
    await expect(page.locator('.page')).toBeVisible();
  });
});
