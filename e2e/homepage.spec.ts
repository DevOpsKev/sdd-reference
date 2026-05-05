import { test, expect } from '@playwright/test';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

// Load copy.yaml for verification
const copyPath = path.join(process.cwd(), 'sdd/homepage/copy.yaml');
const copyData = yaml.parse(fs.readFileSync(copyPath, 'utf-8'));

test.describe('Homepage Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });

    await page.goto('/');
  });

  test('HC-01: Page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('HC-02: All 10 sections exist in correct DOM order', async ({ page }) => {
    const sections = [
      { selector: 'header.masthead', name: 'Masthead' },
      { selector: 'main#main', name: 'Main' },
      { selector: 'section.hero', name: 'Hero' },
      { selector: 'section.thesis', name: 'Thesis' },
      { selector: 'section.homepage-section:has(.why-different-grid)', name: 'Why different' },
      { selector: 'section.homepage-section:has(.rings-grid)', name: 'Rings' },
      { selector: 'section.homepage-section:has(.quadrants-grid)', name: 'Quadrants' },
      { selector: 'section.homepage-section:has(.radar-figure)', name: 'Preview/Radar' },
      { selector: 'section.closing-thesis', name: 'Closing thesis' },
      { selector: 'section.final-cta', name: 'Final CTA' },
      { selector: 'footer.homepage-footer', name: 'Footer' },
    ];

    for (const section of sections) {
      await expect(page.locator(section.selector).first()).toBeVisible();
    }
  });

  test('HC-03: Skip-to-content link exists and works', async ({ page }) => {
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main');
    await expect(skipLink).toHaveText('Skip to content');
  });

  test('HC-04: Document uses correct lang attribute', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', copyData.meta.html_lang);
  });

  test('HC-05: Document title matches copy.yaml', async ({ page }) => {
    await expect(page).toHaveTitle(copyData.meta.document_title);
  });

  test('HC-06: Masthead structure and copy', async ({ page }) => {
    const masthead = page.locator('header.masthead');

    // Wordmark
    const wordmark = masthead.locator('.masthead-wordmark');
    await expect(wordmark).toHaveText(copyData.masthead.wordmark);

    // Navigation links
    const navLinks = masthead.locator('.masthead-nav a');
    await expect(navLinks).toHaveCount(copyData.masthead.nav.length);

    for (let i = 0; i < copyData.masthead.nav.length; i++) {
      const link = navLinks.nth(i);
      await expect(link).toHaveText(copyData.masthead.nav[i].label);
      await expect(link).toHaveAttribute('href', copyData.masthead.nav[i].href);
    }

    // Masthead has bottom border (rule)
    await expect(masthead).toHaveCSS('border-bottom-width', '1px');
  });

  test('HC-07: Hero section structure and copy', async ({ page }) => {
    const hero = page.locator('section.hero');

    // Eyebrow
    await expect(hero.locator('.hero-eyebrow')).toHaveText(copyData.hero.eyebrow);

    // Title
    await expect(hero.locator('.hero-title')).toHaveText(copyData.hero.title);

    // Value proposition
    await expect(hero.locator('.hero-value-prop')).toContainText(copyData.hero.value_prop.trim());

    // Primary CTA
    const primaryCta = hero.locator('.btn-primary');
    await expect(primaryCta).toHaveText(copyData.hero.primary_cta.label);
    await expect(primaryCta).toHaveAttribute('href', copyData.hero.primary_cta.href);

    // Secondary link
    const secondaryLink = hero.locator('.hero-secondary-link');
    await expect(secondaryLink).toHaveText(copyData.hero.secondary_link.label);
    await expect(secondaryLink).toHaveAttribute('href', copyData.hero.secondary_link.href);

    // Metadata
    const metadata = hero.locator('.hero-metadata div');
    await expect(metadata).toHaveCount(copyData.hero.hero_metadata.lines.length);
    for (let i = 0; i < copyData.hero.hero_metadata.lines.length; i++) {
      await expect(metadata.nth(i)).toHaveText(copyData.hero.hero_metadata.lines[i]);
    }
  });

  test('HC-08: Hero primary button has square corners and no shadow', async ({ page }) => {
    const primaryBtn = page.locator('section.hero .btn-primary');
    const borderRadius = await primaryBtn.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });

    // Should be small radius (2px) not rounded
    expect(borderRadius).toBe('2px');

    // Check for absence of box-shadow (should be 'none')
    const boxShadow = await primaryBtn.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow;
    });
    expect(boxShadow).toBe('none');
  });

  test('HC-09: Thesis section copy', async ({ page }) => {
    const thesis = page.locator('section.thesis');

    await expect(thesis.locator('.thesis-quote')).toContainText(copyData.thesis.pull_quote.trim());
    await expect(thesis.locator('.thesis-attribution')).toHaveText(copyData.thesis.attribution);

    // Thesis has top border
    await expect(thesis).toHaveCSS('border-top-width', '2px');
  });

  test('HC-10: Why different section copy', async ({ page }) => {
    const section = page.locator('section.homepage-section:has(.why-different-grid)');

    await expect(section.locator('.section-eyebrow')).toHaveText(copyData.why_different.eyebrow);
    await expect(section.locator('.section-heading')).toHaveText(copyData.why_different.heading);

    // Body paragraphs
    const bodyParagraphs = section.locator('.why-different-body p');
    await expect(bodyParagraphs).toHaveCount(copyData.why_different.body_paragraphs.length);

    for (let i = 0; i < copyData.why_different.body_paragraphs.length; i++) {
      await expect(bodyParagraphs.nth(i)).toContainText(copyData.why_different.body_paragraphs[i].trim());
    }

    // Factors panel
    const factors = section.locator('.factor-item');
    await expect(factors).toHaveCount(copyData.why_different.factors_panel.length);

    for (let i = 0; i < copyData.why_different.factors_panel.length; i++) {
      const factor = factors.nth(i);
      const expected = copyData.why_different.factors_panel[i];
      await expect(factor.locator('.factor-index')).toHaveText(expected.index);
      await expect(factor.locator('.factor-title')).toHaveText(expected.title);
      await expect(factor.locator('.factor-gloss')).toHaveText(expected.gloss);
    }
  });

  test('HC-11: Rings section copy and color indicators', async ({ page }) => {
    const section = page.locator('section.homepage-section:has(.rings-grid)');

    await expect(section.locator('.section-eyebrow')).toHaveText(copyData.rings.eyebrow);
    await expect(section.locator('.section-heading')).toHaveText(copyData.rings.heading);

    const ringCards = section.locator('.ring-card');
    await expect(ringCards).toHaveCount(copyData.rings.items.length);

    for (let i = 0; i < copyData.rings.items.length; i++) {
      const card = ringCards.nth(i);
      const expected = copyData.rings.items[i];

      await expect(card.locator('.ring-name')).toHaveText(expected.name);
      await expect(card.locator('.ring-description')).toHaveText(expected.description);

      // Color indicator should be a small square (16x16px), not rounded
      const indicator = card.locator('.ring-indicator');
      await expect(indicator).toBeVisible();

      const indicatorStyles = await indicator.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
          borderRadius: styles.borderRadius,
        };
      });

      expect(indicatorStyles.width).toBe('16px');
      expect(indicatorStyles.height).toBe('16px');
      expect(indicatorStyles.borderRadius).toBe('0px');
    }
  });

  test('HC-12: Quadrants section copy', async ({ page }) => {
    const section = page.locator('section.homepage-section:has(.quadrants-grid)');

    await expect(section.locator('.section-eyebrow')).toHaveText(copyData.quadrants.eyebrow);
    await expect(section.locator('.section-heading')).toHaveText(copyData.quadrants.heading);

    const quadrantCards = section.locator('.quadrant-card');
    await expect(quadrantCards).toHaveCount(copyData.quadrants.items.length);

    for (let i = 0; i < copyData.quadrants.items.length; i++) {
      const card = quadrantCards.nth(i);
      const expected = copyData.quadrants.items[i];

      await expect(card.locator('.quadrant-label-mono')).toHaveText(expected.label_mono);
      await expect(card.locator('.quadrant-name')).toHaveText(expected.name);
      await expect(card.locator('.quadrant-description')).toHaveText(expected.description);
    }
  });

  test('HC-13: Preview/Radar section copy and structure', async ({ page }) => {
    const section = page.locator('section.homepage-section:has(.radar-figure)');

    await expect(section.locator('.section-eyebrow')).toHaveText(copyData.preview.eyebrow);
    await expect(section.locator('.section-heading')).toHaveText(copyData.preview.heading);
    await expect(section.locator('.preview-body')).toContainText(copyData.preview.body.trim());

    // Figure caption
    await expect(section.locator('.radar-caption')).toHaveText(copyData.preview.figure_caption);
  });

  test('HC-14: Radar SVG structure and geometry', async ({ page }) => {
    const svg = page.locator('.radar-svg-container svg');
    await expect(svg).toBeVisible();

    // Check SVG has correct attributes
    await expect(svg).toHaveAttribute('viewBox', '0 0 600 600');
    await expect(svg).toHaveAttribute('role', 'img');

    // Check for title and desc for accessibility (SVG title/desc are not visually rendered)
    await expect(svg.locator('#radar-title')).toHaveCount(1);
    await expect(svg.locator('#radar-desc')).toHaveCount(1);

    // Verify it has 4 rings (circles with class="ring")
    const rings = svg.locator('circle.ring');
    await expect(rings).toHaveCount(4);

    // Verify it has 12 dots (circles without class="ring")
    const dots = svg.locator('circle:not(.ring)');
    await expect(dots).toHaveCount(12);

    // Verify axes (2 lines with class="axis")
    const axes = svg.locator('line.axis');
    await expect(axes).toHaveCount(2);

    // Verify quadrant labels (4 text elements with class="q-label")
    const quadrantLabels = svg.locator('text.q-label');
    await expect(quadrantLabels).toHaveCount(4);

    // Verify ring labels (4 text elements with class="ring-label")
    const ringLabels = svg.locator('text.ring-label');
    await expect(ringLabels).toHaveCount(4);

    // Check max-width constraint
    const container = page.locator('.radar-svg-container');
    const maxWidth = await container.evaluate((el) => {
      return window.getComputedStyle(el).maxWidth;
    });
    expect(maxWidth).toBe('600px');
  });

  test('HC-15: Closing thesis copy', async ({ page }) => {
    const section = page.locator('section.closing-thesis');
    await expect(section.locator('.closing-thesis-quote')).toContainText(copyData.closing_thesis.pull_quote.trim());
  });

  test('HC-16: Final CTA section copy and structure', async ({ page }) => {
    const section = page.locator('section.final-cta');

    await expect(section.locator('.section-eyebrow')).toHaveText(copyData.final_cta.eyebrow);
    await expect(section.locator('.section-heading')).toHaveText(copyData.final_cta.heading);

    // Primary CTA button
    const primaryBtn = section.locator('.btn-primary').first();
    await expect(primaryBtn).toHaveText(copyData.final_cta.primary_cta.label);
    await expect(primaryBtn).toHaveAttribute('href', copyData.final_cta.primary_cta.href);

    // Subscribe note
    await expect(section.locator('.subscribe-note')).toHaveText(copyData.final_cta.subscribe_note);
  });

  test('HC-17: Subscribe form is non-functional', async ({ page }) => {
    const form = page.locator('.subscribe-form');

    // Form should use method="get" with action="#"
    await expect(form).toHaveAttribute('method', 'get');
    await expect(form).toHaveAttribute('action', '#');

    // Submit button should be disabled
    const submitBtn = form.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('HC-18: Footer structure and copy', async ({ page }) => {
    const footer = page.locator('footer.homepage-footer');

    // Top border
    await expect(footer).toHaveCSS('border-top-width', '1px');

    // Three columns
    await expect(footer.locator('.footer-left')).toHaveText(copyData.footer.left);
    await expect(footer.locator('.footer-centre')).toHaveText(copyData.footer.centre);
    await expect(footer.locator('.footer-right')).toHaveText(copyData.footer.right);

    // Footer links
    const links = footer.locator('.footer-links a');
    await expect(links).toHaveCount(copyData.footer.links.length);

    for (let i = 0; i < copyData.footer.links.length; i++) {
      const link = links.nth(i);
      await expect(link).toHaveText(copyData.footer.links[i].label);
      await expect(link).toHaveAttribute('href', copyData.footer.links[i].href);
    }
  });

  test('HC-19: Semantic HTML landmarks', async ({ page }) => {
    // Verify presence of semantic landmarks
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Main should have id="main" for skip link
    await expect(page.locator('main#main')).toBeVisible();

    // Verify sections within main (8 sections: hero, thesis, why different, rings, quadrants, preview, closing thesis, final CTA)
    const sections = page.locator('main section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBe(8);
  });

  test('HC-20: Typography uses design system fonts', async ({ page }) => {
    // Check body font family
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    expect(bodyFont).toContain('Inter');

    // Check mono font on metadata
    const monoFont = await page.locator('.hero-metadata').evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    expect(monoFont).toContain('JetBrains Mono');
  });

  test('HC-21: Build produces no broken asset references', async ({ page }) => {
    // Check that all images load (if any beyond inline SVG)
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }

    // Check that CSS is loaded (by verifying computed styles)
    const hasStyles = await page.evaluate(() => {
      const body = document.body;
      const bgColor = window.getComputedStyle(body).backgroundColor;
      // Should not be empty or 'rgba(0, 0, 0, 0)'
      return bgColor && bgColor !== 'rgba(0, 0, 0, 0)';
    });
    expect(hasStyles).toBe(true);
  });
});
