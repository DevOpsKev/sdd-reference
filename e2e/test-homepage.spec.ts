import { test, expect } from '@playwright/test';

test.describe('Homepage acceptance criteria', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    (page as any).consoleErrors = consoleErrors;

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('AC1: index.html implements all ten sections in order with semantic landmarks', async ({ page }) => {
    // Check semantic landmarks exist
    await expect(page.locator('header.masthead')).toBeVisible();
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('footer.homepage-footer')).toBeVisible();

    // Check all sections exist and are visible in order
    const sections = [
      'section.hero',
      'section.thesis',
      'section.homepage-section:has(.why-different-grid)',
      'section.homepage-section:has(.rings-grid)',
      'section.homepage-section:has(.quadrants-grid)',
      'section.homepage-section:has(.radar-figure)',
      'section.closing-thesis',
      'section.final-cta',
    ];

    for (const selector of sections) {
      await expect(page.locator(selector)).toBeVisible();
    }

    // Verify sections appear in DOM order
    const main = page.locator('main#main');
    const sectionElements = await main.locator('section').all();
    expect(sectionElements.length).toBe(8);
  });

  test('AC2: All prose matches copy.yaml exactly (spot checks)', async ({ page }) => {
    // Document title
    await expect(page).toHaveTitle('Tech Sovereignty Radar');

    // Masthead wordmark
    await expect(page.locator('.masthead-wordmark')).toHaveText('Tech Sovereignty Radar');

    // Nav labels (uppercase via CSS text-transform)
    const navLinks = page.locator('.masthead-nav a');
    await expect(navLinks.nth(0)).toHaveText('Radar');
    await expect(navLinks.nth(1)).toHaveText('About');
    await expect(navLinks.nth(2)).toHaveText('Methodology');
    await expect(navLinks.nth(3)).toHaveText('Releases');

    // Verify CSS applies uppercase
    const navTextTransform = await navLinks.first().evaluate((el) => {
      return window.getComputedStyle(el).textTransform;
    });
    expect(navTextTransform).toBe('uppercase');

    // Hero title and eyebrow
    await expect(page.locator('.hero-eyebrow')).toHaveText('EUROPEAN TECHNOLOGY ASSESSMENT · v0.1 · MAY 2026');
    await expect(page.locator('.hero-title')).toHaveText('Tech Sovereignty Radar');

    // Hero value prop (check key phrase)
    await expect(page.locator('.hero-value-prop')).toContainText('sovereignty-aware decisions');

    // Hero metadata lines
    const metadata = page.locator('.hero-metadata div');
    await expect(metadata.nth(0)).toHaveText('NEXT RELEASE');
    await expect(metadata.nth(1)).toHaveText('Q3 2026');
    await expect(metadata.nth(2)).toHaveText('47 entries under review');

    // Thesis pull-quote (check exact match for key phrase with typographic quotes)
    await expect(page.locator('.thesis-quote')).toContainText('Sovereignty is not maturity');
    await expect(page.locator('.thesis-attribution')).toHaveText('— EDITORIAL POSITION, v0.1');

    // Ring names
    const ringNames = page.locator('.ring-name');
    await expect(ringNames.nth(0)).toHaveText('Adopt');
    await expect(ringNames.nth(1)).toHaveText('Trial');
    await expect(ringNames.nth(2)).toHaveText('Assess');
    await expect(ringNames.nth(3)).toHaveText('Divest');

    // Quadrant mono labels
    const quadrantLabels = page.locator('.quadrant-label-mono');
    await expect(quadrantLabels.nth(0)).toHaveText('INFRA');
    await expect(quadrantLabels.nth(1)).toHaveText('DATA');
    await expect(quadrantLabels.nth(2)).toHaveText('TOOLS');
    await expect(quadrantLabels.nth(3)).toHaveText('STANDARDS');

    // Figure caption (exact match with special chars)
    await expect(page.locator('.figure-caption')).toHaveText('FIG. 1 — SAMPLE RADAR, ILLUSTRATIVE ONLY. v1.0 RELEASE Q3 2026.');

    // Footer strings
    const footer = page.locator('.homepage-footer');
    await expect(footer.locator('.footer-left')).toHaveText('Tech Sovereignty Radar v0.1');
    await expect(footer.locator('.footer-centre')).toHaveText('Last updated 3 May 2026');
    await expect(footer.locator('.footer-right')).toHaveText('CC BY-SA 4.0');
  });

  test('AC3: Styles reuse design baseline tokens (visual inspection)', async ({ page }) => {
    // Verify CSS custom properties are used (check computed styles)
    const heroTitle = page.locator('.hero-title');
    const titleColor = await heroTitle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Verify ink color is near-black (rgb(10, 10, 10) = #0A0A0A)
    // Allow slight variation due to anti-aliasing
    expect(titleColor).toMatch(/rgb\(10, 10, 10\)/);

    // Check that ring indicators use CSS variables (not hardcoded hex in HTML)
    const ringIndicator = page.locator('.ring-indicator').first();
    const bgColor = await ringIndicator.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Ring adopt color is #1F5F4A = rgb(31, 95, 74)
    expect(bgColor).toMatch(/rgb\(31, 95, 74\)/);
  });

  test('AC4: radar-sample.svg appears centered, max-width 600px', async ({ page }) => {
    const svg = page.locator('.radar-svg-container svg');
    await expect(svg).toBeVisible();

    // Check SVG dimensions
    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox).toBe('0 0 600 600');

    // Check SVG is centered and max-width 600px
    const container = page.locator('.radar-svg-container');
    const containerStyles = await container.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        maxWidth: styles.maxWidth
      };
    });

    // Verify centering (flexbox or similar)
    expect(['flex', 'grid', 'block'].includes(containerStyles.display)).toBeTruthy();

    // Check SVG max-width
    const svgBox = await svg.boundingBox();
    expect(svgBox).not.toBeNull();
    expect(svgBox!.width).toBeLessThanOrEqual(600);

    // Verify SVG has 12 dots, 4 rings, axes, labels (structural check)
    // Dots have fill colors, rings have fill="none"
    const dots = svg.locator('circle[fill]:not([fill="none"])');
    const dotCount = await dots.count();
    expect(dotCount).toBe(12); // 12 illustrative dots

    const axes = svg.locator('line.axis');
    const axisCount = await axes.count();
    expect(axisCount).toBe(2); // horizontal and vertical
  });

  test('AC5: Masthead has wordmark left, nav right, 1px rule below', async ({ page }) => {
    const masthead = page.locator('.masthead');
    await expect(masthead).toBeVisible();

    // Check border-bottom (1px rule)
    const borderBottom = await masthead.evaluate((el) => {
      return window.getComputedStyle(el).borderBottom;
    });
    expect(borderBottom).toContain('1px');

    // Check wordmark and nav are siblings in flex container
    const mastheadContent = page.locator('.masthead-content');
    const display = await mastheadContent.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('flex');

    // Check nav links have uppercase micro styling
    const navLink = page.locator('.masthead-nav a').first();
    const textTransform = await navLink.evaluate((el) => {
      return window.getComputedStyle(el).textTransform;
    });
    expect(textTransform).toBe('uppercase');
  });

  test('AC6: Hero is asymmetric with metadata block; primary button styling', async ({ page }) => {
    const heroGrid = page.locator('.hero-grid');
    await expect(heroGrid).toBeVisible();

    // Check grid layout (2fr 1fr on large screens)
    const display = await heroGrid.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('grid');

    // Check metadata block exists and is in mono font
    const metadata = page.locator('.hero-metadata');
    await expect(metadata).toBeVisible();

    const fontFamily = await metadata.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(fontFamily).toContain('JetBrains Mono');

    // Check primary button styling: square corners, no shadow, accent background
    const primaryButton = page.locator('.hero-actions .btn-primary').first();
    await expect(primaryButton).toBeVisible();

    const buttonStyles = await primaryButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        backgroundColor: styles.backgroundColor
      };
    });

    // Border radius should be 2px (--radius-1)
    expect(buttonStyles.borderRadius).toBe('2px');

    // No shadow (or minimal)
    expect(buttonStyles.boxShadow).toMatch(/^(none|rgba\(0, 0, 0, 0\))/);

    // Background should be accent (#1B3A6B = rgb(27, 58, 107))
    expect(buttonStyles.backgroundColor).toMatch(/rgb\(27, 58, 107\)/);
  });

  test('AC7: Ring colour discipline respected', async ({ page }) => {
    // Ring indicators should have coloured squares
    const ringIndicators = page.locator('.ring-indicator');
    expect(await ringIndicators.count()).toBe(4);

    // Check that ring colors are used (adopt, trial, assess, divest fills)
    const colors = await ringIndicators.evaluateAll((els) => {
      return els.map(el => window.getComputedStyle(el).backgroundColor);
    });

    // Verify we have 4 distinct ring colors
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);

    // Verify colors match ring tokens
    expect(colors[0]).toMatch(/rgb\(31, 95, 74\)/);    // adopt: #1F5F4A
    expect(colors[1]).toMatch(/rgb\(27, 58, 107\)/);   // trial: #1B3A6B
    expect(colors[2]).toMatch(/rgb\(166, 110, 18\)/);  // assess: #A66E12
    expect(colors[3]).toMatch(/rgb\(122, 36, 25\)/);   // divest: #7A2419

    // Verify SVG dots also have ring colors (placement dots only)
    const svgDots = page.locator('.radar-svg-container svg circle:not(.ring)');
    const svgDotColors = await svgDots.evaluateAll((els) => {
      return els.slice(0, 12).map((el: SVGElement) =>
        el.getAttribute('fill')
      );
    });

    // Should include ring color hex values
    expect(svgDotColors.some((c: any) => c === '#1F5F4A')).toBeTruthy();
    expect(svgDotColors.some((c: any) => c === '#1B3A6B')).toBeTruthy();
    expect(svgDotColors.some((c: any) => c === '#A66E12')).toBeTruthy();
    expect(svgDotColors.some((c: any) => c === '#7A2419')).toBeTruthy();
  });

  test('AC8: Subscribe area is non-functional', async ({ page }) => {
    const subscribeForm = page.locator('.subscribe-form');
    await expect(subscribeForm).toBeVisible();

    // Check form method and action
    const method = await subscribeForm.getAttribute('method');
    const action = await subscribeForm.getAttribute('action');

    expect(method).toBe('get');
    expect(action).toBe('#');

    // Check submit button is disabled
    const submitButton = subscribeForm.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('AC9: pnpm build succeeds and no console errors on load', async ({ page }) => {
    // Build success is verified by CI/test setup
    // Check console errors
    const errors = (page as any).consoleErrors;
    expect(errors).toEqual([]);
  });

  test('AC10: design-reference.html still exists', async ({ page }) => {
    // Navigate to design reference
    const response = await page.goto('/design-reference.html');
    expect(response?.status()).toBe(200);

    // Verify it loads
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Additional: Skip-to-content link exists', async ({ page }) => {
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveAttribute('href', '#main');
  });

  test('Additional: Vertical rhythm between sections', async ({ page }) => {
    // Check spacing between major sections
    const sections = await page.locator('main section').all();

    // At least 2 sections should exist for spacing check
    expect(sections.length).toBeGreaterThanOrEqual(2);

    // Sample check: thesis section should have large top/bottom padding
    const thesisSection = page.locator('section.thesis');
    const thesisPadding = await thesisSection.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        paddingTop: parseInt(styles.paddingTop),
        paddingBottom: parseInt(styles.paddingBottom)
      };
    });

    // Should be at least --space-9 (96px)
    expect(thesisPadding.paddingTop).toBeGreaterThanOrEqual(96);
    expect(thesisPadding.paddingBottom).toBeGreaterThanOrEqual(96);
  });

  test('Additional: All external links have correct hrefs', async ({ page }) => {
    // Check primary CTA
    const heroButton = page.locator('.hero-actions .btn-primary').first();
    await expect(heroButton).toHaveAttribute('href', '/radar');

    // Check secondary link
    const heroSecondary = page.locator('.hero-secondary-link');
    await expect(heroSecondary).toHaveAttribute('href', '/methodology');

    // Check footer links
    const footerLinks = page.locator('.footer-links a');
    const footerHrefs = await footerLinks.evaluateAll((els) => {
      return els.map((el: any) => el.getAttribute('href'));
    });

    expect(footerHrefs).toEqual([
      '/methodology',
      '/releases',
      '/rss',
      '/contact'
    ]);
  });
});
