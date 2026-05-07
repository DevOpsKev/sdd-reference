import { test, expect } from '@playwright/test';
import { isUnitOpen } from '../build/lib/unit-open';

/**
 * Home page `/` — docket, masthead + nav tabs in `beforeMain`, empty `<main>`.
 * Must match `webServer` in `playwright.config.ts` (BUILD_DATE for reproducible output).
 */
const PAGE_TITLE = 'Vinyl Traffic — Industrial Record Dispatch';
const UNIT_LABEL = 'UNIT 14B · SOROKSÁRI ÚT · BUDAPEST IX';

/** Same instant as `BUILD_DATE=...` in `playwright.config.ts` webServer build step */
const E2E_BUILD_INSTANT = new Date('2026-05-07T15:00:00.000Z');
const TZ = 'Europe/Budapest';

test.describe('Home page /', () => {
  test('serves root with HTTP 200', async ({ page }) => {
    const response = await page.goto('http://localhost:4173/');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
  });

  test('document title matches spec', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await expect(page).toHaveTitle(PAGE_TITLE);
  });

  test('.docket is first child of .page; masthead and nav.tabs follow; <main> is empty', async ({
    page,
  }) => {
    await page.goto('http://localhost:4173/');

    await expect(page.locator('.page')).toBeVisible();
    await expect(page.locator('.docket')).toBeVisible();

    const first = page.locator('.page').locator(':scope > *').first();
    await expect(first).toHaveClass(/docket/);

    await expect(page.locator('header.masthead')).toBeVisible();
    await expect(page.locator('nav.tabs')).toBeVisible();

    const main = page.locator('.page > main');
    await expect(main).toHaveCount(1);
    await expect(main).toBeEmpty();
  });

  test('nav tabs: structure, active tab, copy, and order after masthead', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const nav = page.locator('nav.tabs');
    await expect(nav).toBeVisible();

    await expect(nav.locator(':scope > a.active')).toHaveCount(1);

    await expect(nav.locator(':scope > a').filter({ hasText: 'Stockroom' })).toBeVisible();
    await expect(nav.locator(':scope > a').filter({ hasText: 'Find Us' })).toBeVisible();

    const right = nav.locator('.right-tabs');
    await expect(right).toContainText('Search');
    await expect(right).toContainText('Bag (0)');

    const order = await page.locator('.page').evaluate((el) => {
      const kids = [...el.children];
      return kids.map((k) => k.tagName.toLowerCase() + (k.className ? '.' + k.className : ''));
    });
    const mastIdx = order.findIndex((s) => s.includes('masthead'));
    const navIdx = order.findIndex((s) => s === 'nav.tabs');
    expect(mastIdx).toBeGreaterThanOrEqual(0);
    expect(navIdx).toBeGreaterThanOrEqual(0);
    expect(mastIdx).toBeLessThan(navIdx);
  });

  test('masthead wordmark, stamps, and tagline', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const wordmark = page.locator('.wordmark-stamp');
    await expect(wordmark).toContainText('VINYL');
    await expect(wordmark).toContainText('TRAFFIC');

    await expect(page.locator('.stamps-row .stamp:not(.ink):not(.red)')).toContainText(
      'FRAGILE · DO NOT BEND',
    );
    await expect(page.locator('.stamps-row .stamp.ink')).toContainText('BTC · ETH · USDC · XMR');
    await expect(page.locator('.stamps-row .stamp.red')).toContainText('NO RETURNS · NO REFUNDS');

    await expect(page.locator('.masthead-meta .tagline')).toContainText('Soroksári út');
    await expect(page.locator('.masthead-meta .tagline')).toContainText("don't have a shop");
  });

  test('docket date, DKT ref, and unit label', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const dateText = await page.locator('.docket .right span').first().innerText();
    expect(dateText).toMatch(/^[A-Z]{3} \d{2}\.\d{2}\.\d{4} \/ \d{2}:\d{2}$/);

    const dktText = await page.locator('.docket .left .ref').innerText();
    expect(dktText).toMatch(/^DKT-\d{4}-W\d{2}-001$/);

    const unitText = await page.locator('.docket .right .ref').innerText();
    expect(unitText).toBe(UNIT_LABEL);
  });

  test('open vs closed matches .light per build instant', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const expectOpen = isUnitOpen(E2E_BUILD_INSTANT, TZ);
    const light = page.locator('.docket .light');

    if (expectOpen) {
      await expect(light).toBeVisible();
    } else {
      await expect(light).toHaveCount(0);
      await expect(page.locator('.docket .left')).toContainText('UNIT CLOSED');
    }
  });
});
