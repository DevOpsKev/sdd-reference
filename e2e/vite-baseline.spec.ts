import { test, expect } from '@playwright/test';

test.describe('vite-baseline spec acceptance criteria', () => {
  test('SC-01: page loads successfully with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('SC-02: HTML document is served (content-type header)', async ({ page }) => {
    const response = await page.goto('/');
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('text/html');
  });

  test('SC-04: CSS assets are loaded', async ({ page }) => {
    await page.goto('/');

    // Wait for CSS to load by checking computed styles
    const bodyBackground = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Should have some background color set (not transparent/initial)
    expect(bodyBackground).toBeTruthy();
    expect(bodyBackground).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('SC-05: JavaScript module is loaded', async ({ page }) => {
    await page.goto('/');

    // Check that the main module script is present
    const scriptTags = await page.locator('script[type="module"]').count();
    expect(scriptTags).toBeGreaterThan(0);
  });

  test('SC-06: page has proper HTML structure', async ({ page }) => {
    await page.goto('/');

    // Verify essential HTML elements
    await expect(page.locator('html')).toHaveAttribute('lang');
    await expect(page.locator('head meta[charset]')).toHaveCount(1);
    await expect(page.locator('head meta[name="viewport"]')).toHaveCount(1);
  });

  test('SC-07: no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(
      consoleErrors,
      `Console errors detected: ${consoleErrors.join(', ')}`
    ).toHaveLength(0);
  });
});
