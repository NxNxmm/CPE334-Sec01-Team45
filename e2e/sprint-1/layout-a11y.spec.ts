import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const screenshotDir = path.resolve(process.cwd(), 'docs/sprints/sprint-1/evidence/screenshots');

test.describe('E2E-01-04: Viewport Layout Audit (375px / 768px / 1280px) & Keyboard Focus Rings', () => {
  test.beforeAll(() => {
    fs.mkdirSync(screenshotDir, { recursive: true });
  });

  test('Verifies zero horizontal scroll across 375px, 768px, and 1280px viewports and high-contrast focus rings', async ({ page }) => {
    await page.goto('/');

    // Sign in as Borrower
    await page.getByLabel(/email address/i).fill('borrower@cpe.kmutt.ac.th');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('heading', { name: /department equipment catalog/i })).toBeVisible();

    const viewports = [
      { name: 'mobile-375px', width: 375, height: 812 },
      { name: 'tablet-768px', width: 768, height: 1024 },
      { name: 'desktop-1280px', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(150);

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(overflow, `Expected zero horizontal scroll at ${vp.name}`).toBe(false);

      await page.screenshot({
        path: path.join(screenshotDir, `10-viewport-${vp.name}.png`),
        fullPage: true,
      });
    }

    // Verify Keyboard Focus Ring (WCAG 2.1 SC 1.4.11 >= 3:1 contrast)
    await page.setViewportSize({ width: 1280, height: 800 });
    const firstDetailsBtn = page.getByRole('button', { name: /view details/i }).first();
    await firstDetailsBtn.focus();

    // Trigger keyboard focus-visible state via Tab key navigation
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');

    const focusOutline = await firstDetailsBtn.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
      };
    });

    expect(focusOutline.outlineStyle).toBe('solid');
    expect(parseFloat(focusOutline.outlineWidth)).toBeGreaterThanOrEqual(2);
    // Deep Ocean #31465A => rgb(49, 70, 90)
    expect(focusOutline.outlineColor).toBe('rgb(49, 70, 90)');

    await page.screenshot({
      path: path.join(screenshotDir, '11-keyboard-focus-ring.png'),
    });
  });
});

