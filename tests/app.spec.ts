import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('supports the complete tune, compare, and export path', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Soft arrival' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Elastic echo' }).click();
  await expect(page.getByRole('button', { name: 'Elastic echo' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#x1-output')).toHaveText('0.24');

  await page.getByRole('tab', { name: 'Rotation' }).click();
  await expect(page.locator('#x1-output')).toHaveText('0.30');
  await page.locator('#x1').fill('0.4');
  await expect(page.locator('#curve-readout')).toContainText('0.4');

  await expect(page.getByLabel('2 frame sample of the current motion')).toBeVisible();
  await expect(page.getByLabel('4 frame sample of the current motion')).toBeVisible();
  await expect(page.getByLabel('8 frame sample of the current motion')).toBeVisible();

  await page.getByRole('tab', { name: 'JavaScript' }).click();
  await expect(page.getByLabel('Generated export code')).toContainText('sampleMotion');
  await expect(page.getByRole('button', { name: 'Copy share link' })).toBeEnabled();
});

test('curve handles are adjustable with the keyboard', async ({ page }) => {
  const firstHandle = page.getByRole('slider', { name: 'First control point' }).first();
  await firstHandle.focus();
  const before = await firstHandle.getAttribute('aria-valuetext');
  await firstHandle.press('ArrowRight');
  await expect(firstHandle).not.toHaveAttribute('aria-valuetext', before ?? '');
});

test('has no serious accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious).toEqual([]);
});

test('loads without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.reload();
  await page.getByRole('heading', { name: 'Tune one move' }).waitFor();
  expect(errors).toEqual([]);
});

test('fits the mobile viewport without horizontal overflow', async ({ page }) => {
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  await expect(page.getByRole('button', { name: 'Play move' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible();
});

test('legal pages are present and semantic', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy' })).toBeVisible();
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms' })).toBeVisible();
});

test('keeps the complete lab available offline', async ({ page, context }) => {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Tune one move' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play move' })).toBeEnabled();
  await expect(page.getByText(/Offline mode/)).toBeVisible();
  await context.setOffline(false);
});

test('replaces playback with an end-state in reduced-motion mode', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Play move' }).click();
  await expect(page.locator('#preview-readout')).toHaveText('t 1.00');
  await expect(page.getByText(/Reduced motion is on/)).toBeVisible();
});
