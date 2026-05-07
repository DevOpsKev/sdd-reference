import { test, expect } from '@playwright/test';

/**
 * Toolchain smoke: preview serves built `index.html` (from `homePage` + generate-index).
 */

const PAGE_TITLE = 'Vinyl Traffic — Industrial Record Dispatch';

test.describe('Vite baseline', () => {
  test('serves root route with HTTP 200', async ({ page }) => {
    const response = await page.goto('http://localhost:4173/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('document title matches shipped home shell', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page).toHaveTitle(PAGE_TITLE);
  });

  test('rendered HTML includes stable product string', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    const html = await page.content();
    expect(html).toContain('Vinyl Traffic');
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

    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });

  test('built CSS is linked from the preview page', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const cssLinks = await page.locator('link[rel="stylesheet"]').count();
    expect(cssLinks).toBeGreaterThan(0);
  });
});
