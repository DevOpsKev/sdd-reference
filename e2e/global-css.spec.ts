import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Global CSS spec verification
 * Tests acceptance criteria from sdd/specs/global-css/spec.md
 */

test.describe('Global CSS', () => {
  test('CSS files are present in built assets', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Find the bundled CSS file
    const cssLinks = await page.locator('link[rel="stylesheet"]').all();
    expect(cssLinks.length).toBeGreaterThan(0);

    const href = await cssLinks[0].getAttribute('href');
    expect(href).toBeTruthy();
  });

  test(':root custom properties match design-system.md tokens', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Wait for CSS to load
    await page.waitForLoadState('networkidle');

    // Check key tokens from design-system.md
    const paper = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()
    );
    expect(paper).toBe('#ece6d4');

    const ink = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()
    );
    expect(ink).toBe('#1a1410');

    const orange = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--orange').trim()
    );
    expect(orange).toBe('#c95028');

    const gutter = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--gutter').trim()
    );
    expect(gutter).toContain('clamp');
  });

  test('body uses paper background and Special Elite font', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Wait for fonts to be ready
    await page.waitForFunction(() => document.fonts.ready);
    await page.evaluate(() => document.fonts.ready);

    const bodyStyles = await page.evaluate(() => {
      const computed = getComputedStyle(document.body);
      return {
        backgroundColor: computed.backgroundColor,
        fontFamily: computed.fontFamily,
      };
    });

    // Check background color is paper (#ece6d4)
    // RGB equivalent: rgb(236, 230, 212)
    expect(bodyStyles.backgroundColor).toMatch(/rgb\(236,\s*230,\s*212\)/);

    // Check font family includes Special Elite
    expect(bodyStyles.fontFamily).toMatch(/Special Elite/i);
  });

  test('headings use Anton font family', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Create test headings
    await page.evaluate(() => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Test Heading';
      h1.id = 'test-h1';
      document.body.appendChild(h1);

      const h2 = document.createElement('h2');
      h2.textContent = 'Test Heading 2';
      h2.id = 'test-h2';
      document.body.appendChild(h2);
    });

    // Wait for fonts
    await page.waitForFunction(() => document.fonts.ready);
    await page.evaluate(() => document.fonts.ready);

    const h1Font = await page.evaluate(() =>
      getComputedStyle(document.getElementById('test-h1')!).fontFamily
    );
    expect(h1Font).toMatch(/Anton/i);

    const h2Font = await page.evaluate(() =>
      getComputedStyle(document.getElementById('test-h2')!).fontFamily
    );
    expect(h2Font).toMatch(/Anton/i);
  });

  test('built CSS contains @font-face declarations', async () => {
    // Read the built CSS file from dist/assets/
    const distPath = join(process.cwd(), 'dist');
    const cssFiles = readFileSync(join(distPath, 'index.html'), 'utf-8')
      .match(/href="([^"]*\.css)"/);

    expect(cssFiles).toBeTruthy();

    if (cssFiles && cssFiles[1]) {
      const cssPath = join(distPath, cssFiles[1].replace(/^\//, ''));
      const cssContent = readFileSync(cssPath, 'utf-8');

      // Check for Special Elite @font-face
      expect(cssContent).toMatch(/@font-face/);
      expect(cssContent).toMatch(/Special Elite/);
      expect(cssContent).toMatch(/\/fonts\/special-elite-v20-latin-regular\.woff2/);

      // Check for Anton
      expect(cssContent).toMatch(/Anton/);
      expect(cssContent).toMatch(/\/fonts\/anton-v27-latin-regular\.woff2/);

      // Check for JetBrains Mono
      expect(cssContent).toMatch(/JetBrains Mono/);
      expect(cssContent).toMatch(/\/fonts\/jetbrains-mono-v24-latin-regular\.woff2/);
    }
  });

  test('font files are accessible in dist/fonts/', async ({ page }) => {
    const fonts = [
      '/fonts/special-elite-v20-latin-regular.woff2',
      '/fonts/anton-v27-latin-regular.woff2',
      '/fonts/stardos-stencil-v15-latin-regular.woff2',
      '/fonts/stardos-stencil-v15-latin-700.woff2',
      '/fonts/permanent-marker-v16-latin-regular.woff2',
      '/fonts/jetbrains-mono-v24-latin-regular.woff2',
      '/fonts/jetbrains-mono-v24-latin-500.woff2',
      '/fonts/jetbrains-mono-v24-latin-700.woff2',
    ];

    for (const font of fonts) {
      const response = await page.request.get(`http://localhost:4173${font}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toMatch(/font\/woff2|application\/octet-stream/);
    }
  });

  test('document.fonts.ready resolves successfully', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const fontsReady = await page.evaluate(async () => {
      await document.fonts.ready;
      return document.fonts.status;
    });

    expect(fontsReady).toBe('loaded');
  });

  test('prefers-reduced-motion is respected', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Create a test element to check animation/transition duration
    const duration = await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.transition = 'all 1s';
      document.body.appendChild(div);

      const computed = getComputedStyle(div);
      const transDuration = computed.transitionDuration;

      document.body.removeChild(div);
      return transDuration;
    });

    // Should be near-zero (0.01ms as per spec)
    // Can be in scientific notation like "1e-05s" or "0.00001s"
    expect(duration).toMatch(/^(0\.0*1|[0-9.]+e-[0-9]+)s?$/);
  });
});
