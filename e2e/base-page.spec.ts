import { test, expect } from '@playwright/test';
import { basePage } from '../src/templates/pages/base';

const UNIT_LABEL = 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX';

test.describe('Base page template (pure)', () => {
  test('basePage emits docket, masthead, nav, main inside .page', () => {
    const html = basePage({
      title: 'Escaping <demo> & Co.',
      docket: {
        open: true,
        dktRef: 'DKT-2099-W01-001',
        dateLabel: 'MON 01.01.2099 / 00:00',
        unitLabel: UNIT_LABEL,
      },
      masthead: {
        metaTitle: 'M',
        metaLine2: 'L2',
        metaLine3: 'L3',
        metaLine4: 'L4',
        tagline: 'T',
        stampDefault: 'A',
        stampInk: 'B',
        stampRed: 'C',
      },
      navTabs: {
        primary: [{ href: '#', label: 'One' }],
        activePrimaryIndex: 0,
        right: [{ href: '#', label: 'R' }],
      },
      children: '<p>x</p>',
    });

    expect(html).toContain('<title>Escaping &lt;demo&gt; &amp; Co.</title>');
    expect(html).toMatch(/<div class="page">\s*<div class="docket">/);
    expect(html.indexOf('class="docket"')).toBeLessThan(html.indexOf('class="masthead"'));
    expect(html.indexOf('class="masthead"')).toBeLessThan(html.indexOf('class="tabs"'));
    expect(html.indexOf('class="tabs"')).toBeLessThan(html.indexOf('<main>'));
    expect(html).toContain('<main><p>x</p></main>');
  });

  test('theme-color meta uses paper token colour', () => {
    const html = basePage({
      title: 'T',
      docket: {
        open: false,
        dktRef: 'DKT-2026-W01-001',
        dateLabel: 'MON 01.01.2026 / 12:00',
        unitLabel: UNIT_LABEL,
      },
      masthead: {
        metaTitle: 'M',
        metaLine2: 'L2',
        metaLine3: 'L3',
        metaLine4: 'L4',
        tagline: 'T',
        stampDefault: 'A',
        stampInk: 'B',
        stampRed: 'C',
      },
      navTabs: { primary: [{ href: '#', label: 'P' }], activePrimaryIndex: 0, right: [] },
      children: '',
    });
    expect(html).toContain('<meta name="theme-color" content="#ece6d4">');
  });
});

test.describe('Base page shell (preview)', () => {
  test('first element child of .page is the docket root', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    const firstTag = await page.locator('.page').evaluate((el) => el.firstElementChild?.tagName);
    const firstClass = await page.locator('.page').evaluate((el) => el.firstElementChild?.className);
    expect(firstTag).toBe('DIV');
    expect(firstClass).toBe('docket');
  });

  test('.page children order is docket, masthead, nav.tabs, main; main empty on home', async ({
    page,
  }) => {
    await page.goto('http://localhost:4173/');
    const rows = page.locator('.page > *');
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0)).toHaveClass(/docket/);
    expect(await rows.nth(1).evaluate((el) => el.tagName.toLowerCase())).toBe('header');
    await expect(rows.nth(1)).toHaveClass(/masthead/);
    expect(await rows.nth(2).evaluate((el) => el.tagName.toLowerCase())).toBe('nav');
    await expect(rows.nth(2)).toHaveClass(/tabs/);
    expect(await rows.nth(3).evaluate((el) => el.tagName.toLowerCase())).toBe('main');
    await expect(page.locator('.page > main')).toBeEmpty();
  });

  test('docket copy matches fixed build clock', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page.locator('.docket')).not.toContainText('UNIT OPEN');
    await expect(page.locator('.docket .light')).toHaveCount(0);
    await expect(page.locator('.docket')).toContainText('DKT-2026-W19-001');
    await expect(page.locator('.docket')).toContainText('THU 07.05.2026 / 17:00');
    await expect(page.locator('.docket')).toContainText(UNIT_LABEL);

    const dateText = await page.locator('.docket .right span').first().innerText();
    expect(dateText).toMatch(/^[A-Z]{3} \d{2}\.\d{2}\.\d{4} \/ \d{2}:\d{2}$/);

    const refText = await page.locator('.docket .left .ref').innerText();
    expect(refText).toMatch(/^DKT-\d{4}-W\d{2}-001$/);
  });
});
