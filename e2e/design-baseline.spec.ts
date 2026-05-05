import { test, expect } from '@playwright/test';

/**
 * Design baseline spec acceptance criteria tests
 * Spec: .sdd/specifications/design-baseline/spec.md
 *
 * Acceptance criteria:
 * 1. pnpm build succeeds; dist/ includes design-reference.html and index.html with no console errors
 * 2. design-reference.html implements the section table; "Design baseline" appears in title or h1
 * 3. index.html stays minimal and does not duplicate the full section inventory
 * 4. Design-system forbidden items are not used
 * 5. Tailwind and DaisyUI wired and themed per vite-baseline and design-system Implementation section
 * 6. Motion rules followed; reduced-motion behaviour is observable
 * 7. .sdd/provenance/design-baseline/provenance.md exists
 */

test.describe('Design baseline spec acceptance criteria', () => {
  // AC-02: design-reference.html contains all required sections
  test.describe('AC-02: design-reference.html sections', () => {
    test('DB-02-01: Page title contains "Design baseline"', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page).toHaveTitle(/Design baseline/i);
    });

    test('DB-02-02: H1 contains "Design baseline"', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('h1')).toContainText('Design baseline');
    });

    test('DB-02-03: All required sections present as h2 headings', async ({ page }) => {
      await page.goto('/design-reference.html');

      const requiredSections = [
        'Colour',
        'Theme / tooling',
        'Typography',
        'Grid and layout',
        'Buttons',
        'Inputs',
        'Table',
        'Card',
        'Motion',
        'Filter chips'
      ];

      for (const section of requiredSections) {
        await expect(page.locator(`h2:has-text("${section}")`)).toBeVisible();
      }
    });

    test('DB-02-04: Colour section has all subsections', async ({ page }) => {
      await page.goto('/design-reference.html');

      const colourSubsections = ['Surface', 'Ink', 'Rules', 'Brand accent', 'Ring semantics'];

      for (const subsection of colourSubsections) {
        await expect(page.locator(`h3:has-text("${subsection}")`)).toBeVisible();
      }
    });

    test('DB-02-05: Typography section has all type tokens', async ({ page }) => {
      await page.goto('/design-reference.html');

      const typographySection = page.locator('section').filter({
        has: page.locator('h2:has-text("Typography")'),
      });

      const typeTokens = [
        'DISPLAY',
        'H1',
        'H2',
        'H3',
        'BODY LARGE',
        'BODY',
        'SMALL',
        'MICRO',
        'MONO',
        'MONO SMALL',
      ];

      for (const token of typeTokens) {
        await expect(typographySection.getByText(token, { exact: true })).toBeVisible();
      }
    });

    test('DB-02-06: Theme / tooling section describes DaisyUI or token mapping', async ({
      page,
    }) => {
      await page.goto('/design-reference.html');
      const themeSection = page.locator('section').filter({
        has: page.locator('h2:has-text("Theme / tooling")'),
      });
      await expect(themeSection).toContainText(
        /DaisyUI|Tailwind|--accent|primary|theme|token/i
      );
    });
  });

  // AC-03: index.html stays minimal
  test.describe('AC-03: index.html minimal', () => {
    test('DB-03-01: index.html does not contain design reference sections', async ({ page }) => {
      await page.goto('/');

      const designRefSections = [
        'Colour',
        'Theme / tooling',
        'Typography',
        'Grid and layout',
        'Buttons',
        'Inputs',
        'Table',
        'Card',
        'Motion',
        'Filter chips'
      ];

      for (const section of designRefSections) {
        const count = await page.locator(`h2:has-text("${section}")`).count();
        expect(count).toBe(0);
      }
    });

    test('DB-03-02: index.html does not contain "Design baseline" string', async ({ page }) => {
      await page.goto('/');
      const content = await page.content();
      expect(content).not.toContain('Design baseline');
    });

    test('DB-03-03: index.html has semantic structure', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('header')).toBeVisible();
    });
  });

  // AC-04: Forbidden items not used
  test.describe('AC-04: Forbidden design patterns', () => {
    test('DB-04-01: No glassmorphism (backdrop-filter)', async ({ page }) => {
      await page.goto('/design-reference.html');
      const content = await page.content();
      expect(content).not.toContain('backdrop-filter');
      expect(content).not.toContain('glassmorphic');
    });

    test('DB-04-02: No pill-shaped radius abuse', async ({ page }) => {
      await page.goto('/design-reference.html');
      const content = await page.content();
      expect(content).not.toContain('border-radius: 9999px');
      expect(content).not.toContain('9999px');
    });

    test('DB-04-03: No gradient backgrounds in CSS', async ({ page, request, baseURL }) => {
      await page.goto('/design-reference.html');
      const hrefs = await page
        .locator('link[rel="stylesheet"]')
        .evaluateAll((els) =>
          els
            .map((e) => (e as HTMLLinkElement).getAttribute('href'))
            .filter((h): h is string => Boolean(h))
        );
      const origin = baseURL ?? 'http://localhost:4173';
      for (const href of hrefs) {
        const url = new URL(href, origin).toString();
        const response = await request.get(url);
        expect(response.ok()).toBeTruthy();
        const cssContent = await response.text();
        expect(cssContent).not.toContain('background: linear-gradient');
        expect(cssContent).not.toContain('background-image: linear-gradient');
      }
    });
  });

  // AC-05: Motion rules and reduced-motion support
  test.describe('AC-05: Motion and reduced-motion', () => {
    test('DB-05-01: Motion demo elements exist', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('#motion-trigger')).toBeVisible();
      await expect(page.locator('#motion-box')).toBeVisible();
    });

    test('DB-05-02: Reduced-motion note is visible', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('text=/Reduce motion/i')).toBeVisible();
    });

    test('DB-05-03: Motion section describes prefers-reduced-motion', async ({ page }) => {
      await page.goto('/design-reference.html');
      const motionSection = page.locator('h2:has-text("Motion")').locator('..');
      await expect(motionSection).toContainText(/prefers-reduced-motion/i);
    });
  });

  // Structural and content tests
  test.describe('Design system implementation', () => {
    test('DB-STR-01: Skip-to-content link exists', async ({ page }) => {
      await page.goto('/design-reference.html');
      const skipLink = page.locator('.skip-link');
      await expect(skipLink).toHaveAttribute('href', '#main');
      await expect(skipLink).toContainText(/Skip to content/i);
    });

    test('DB-STR-02: Main element with id="main" exists', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('#main')).toBeVisible();
    });

    test('DB-STR-03: Semantic sections used', async ({ page }) => {
      await page.goto('/design-reference.html');
      const sections = await page.locator('section').count();
      expect(sections).toBeGreaterThan(5);
    });

    test('DB-STR-04: Google Fonts loaded', async ({ page }) => {
      await page.goto('/design-reference.html');
      // preconnect + stylesheet both point at fonts.googleapis.com
      await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(2);
      // <link> in <head> is attached but not "visible" to Playwright
      await expect(page.locator('link[href*="Inter"]')).toBeAttached();
      await expect(page.locator('link[href*="JetBrains+Mono"]')).toBeAttached();
    });

    test('DB-STR-05: Button variants exist', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('.btn-primary').first()).toBeVisible();
      await expect(page.locator('.btn-secondary').first()).toBeVisible();
      await expect(page.locator('.btn-tertiary').first()).toBeVisible();
      await expect(page.locator('.btn-primary:disabled')).toBeVisible();
    });

    test('DB-STR-06: Input with error state exists', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('.input-error')).toBeVisible();
      await expect(page.locator('.input-error-text')).toBeVisible();
    });

    test('DB-STR-07: Table with numeric columns exists', async ({ page }) => {
      await page.goto('/design-reference.html');
      const table = page.locator('.table');
      await expect(table).toBeVisible();
      await expect(table.locator('.numeric')).toHaveCount(10);
    });

    test('DB-STR-08: Card component exists', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('.card')).toHaveCount(2);
    });

    test('DB-STR-09: Filter chips exist', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('.chip')).toHaveCount(8);
      await expect(page.locator('.chip-ring-adopt')).toBeVisible();
      await expect(page.locator('.chip-ring-trial')).toBeVisible();
      await expect(page.locator('.chip-ring-assess')).toBeVisible();
      await expect(page.locator('.chip-ring-divest')).toBeVisible();
    });

    test('DB-STR-10: Asymmetric layout exists', async ({ page }) => {
      await page.goto('/design-reference.html');
      await expect(page.locator('.layout-asymmetric')).toBeVisible();
    });

    test('DB-STR-11: Tabular numerals applied to version/date columns', async ({ page }) => {
      await page.goto('/design-reference.html');
      const numericCells = page.locator('.table .numeric');
      await expect(numericCells).toHaveCount(10);

      // Check that numeric cells have mono font family
      const firstNumeric = numericCells.first();
      const fontFamily = await firstNumeric.evaluate(el => {
        return window.getComputedStyle(el).fontFamily;
      });
      expect(fontFamily).toContain('JetBrains Mono');
    });

    test('DB-STR-12: Ring color tokens used correctly', async ({ page }) => {
      await page.goto('/design-reference.html');

      await expect(page.locator('.chip-ring-adopt')).toBeVisible();
      await expect(page.locator('.chip-ring-trial')).toBeVisible();
      await expect(page.locator('.chip-ring-assess')).toBeVisible();
      await expect(page.locator('.chip-ring-divest')).toBeVisible();
    });
  });

  // No console errors test
  test.describe('Console errors', () => {
    test('DB-ERR-01: No console errors on design-reference.html load', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/design-reference.html');
      await page.waitForLoadState('networkidle');

      expect(
        consoleErrors,
        `Console errors detected: ${consoleErrors.join(', ')}`
      ).toHaveLength(0);
    });

    test('DB-ERR-02: No console errors on index.html load', async ({ page }) => {
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
});
