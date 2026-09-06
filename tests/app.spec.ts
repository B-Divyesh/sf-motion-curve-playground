import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('shows the job, audience, and sample action before scrolling', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Motion Feel Lab — Edit motion curves');
  await expect(page.getByRole('heading', { level: 1, name: 'Edit motion curves for animation' })).toBeVisible();
  await expect(page.getByText('For indie animators and game or UI makers who need timing to read at a few frames.')).toBeVisible();
  const sampleAction = page.getByRole('link', { name: /Try it with sample data/ });
  await expect(sampleAction).toBeVisible();
  const bottom = await sampleAction.evaluate((element) => element.getBoundingClientRect().bottom);
  expect(bottom).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight));
});

test('keeps the normal editor usable after malformed stored state', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('motion-feel-lab:v1', '{not-json'));
  await page.reload();
  await expect(page.getByText(/Saved settings could not be read/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Soft arrival' })).toHaveAttribute('aria-pressed', 'true');
});

test('uses route-specific metadata and shared navigation on legal pages', async ({ page }) => {
  const demoResponse = await page.goto('/demo');
  expect(demoResponse?.status()).toBe(200);
  await expect(page).toHaveTitle('Demo — Motion Feel Lab');
  await expect(page.getByRole('heading', { level: 1, name: 'Edit a sample motion curve' })).toBeVisible();

  await page.goto('/privacy/');
  await expect(page).toHaveTitle('Privacy — Motion Feel Lab');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
  await expect(page.getByText('Built by Param Factory')).toBeVisible();

  await page.goto('/terms/');
  await expect(page).toHaveTitle('Terms — Motion Feel Lab');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://motion-curve-playground.sociobot.in/terms/');
});

test('returns a designed 404 response for an unknown URL', async ({ page }) => {
  const response = await page.goto('/definitely-missing-review-1');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Page not found — Motion Feel Lab');
  await expect(page.getByRole('heading', { level: 1, name: 'This page was not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Go to the curve editor' })).toBeVisible();
});

test('serves self-only framing and content policies', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
});

test('has no serious accessibility violations on the landing page', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious).toEqual([]);
});

test('loads without console or page errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Edit motion curves for animation' })).toBeVisible();
  expect(errors).toEqual([]);
});
