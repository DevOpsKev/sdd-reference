import { test, expect } from '@playwright/test';

/**
 * Vite baseline spec verification
 * Tests acceptance criteria from sdd/specs/vite-baseline/spec.md
 */

test.describe('Vite baseline', () => {
  test('serves root route with HTTP 200', async ({ page }) => {
    const response = await page.goto('http://localhost:4173/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('page contains "Vite baseline" in title', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page).toHaveTitle('Vite baseline');
  });

  test('page title contains "Vite baseline" string in HTML source', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    const html = await page.content();
    expect(html).toContain('Vite baseline');
  });

  test('page body is empty of user-visible content', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Get the body element
    const body = page.locator('body');

    // Get text content (should be empty)
    const textContent = await body.textContent();
    expect(textContent?.trim()).toBe('');

    // Verify no content elements (p, h1-h6, article, section, etc.)
    const contentElements = await body.locator('p, h1, h2, h3, h4, h5, h6, article, section, main, aside, nav').count();
    expect(contentElements).toBe(0);
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

    // Check that CSS is loaded (look for link tag)
    const cssLinks = await page.locator('link[rel="stylesheet"]').count();
    expect(cssLinks).toBeGreaterThan(0);

    // Check that JS module is loaded (look for script tag)
    const jsScripts = await page.locator('script[type="module"]').count();
    expect(jsScripts).toBeGreaterThan(0);
  });
});
