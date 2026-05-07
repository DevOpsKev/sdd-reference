import { test, expect } from '@playwright/test';

/**
 * Vite baseline + root shell smoke checks.
 *
 * Root markup comes from repo `index.html`; Vite bundles CSS via `src/main.ts`.
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

  test('base page shell renders docket then main inside .page', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.page')).toBeVisible();
    await expect(page.locator('.docket')).toBeVisible();
    await expect(page.locator('.page > .docket')).toHaveCount(1);
    await expect(page.locator('.page > main')).toHaveCount(1);
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

    // Bundled CSS linked by Vite from index.html entry
    const cssLinks = await page.locator('link[rel="stylesheet"]').count();
    expect(cssLinks).toBeGreaterThan(0);

    // Shell visibility implies the dev server served index.html.
    await expect(page.locator('.page')).toBeVisible();
  });
});
