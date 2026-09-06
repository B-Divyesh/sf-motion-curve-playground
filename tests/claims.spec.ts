import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

let demoContext: BrowserContext;
let demoPage: Page;

test.beforeAll(async ({ browser }) => {
  demoContext = await browser.newContext();
  demoPage = await demoContext.newPage();
});

test.beforeEach(async () => {
  await demoPage.goto('/demo');
  await demoPage.evaluate(() => localStorage.removeItem('demo:motion-feel-lab:v1'));
  await demoPage.reload();
});

test.afterAll(async () => {
  await demoContext.close();
});

test('@claim:sample-demo Opening the demo loads a realistic curve sample', async () => {
  await expect(demoPage).toHaveTitle('Demo — Motion Feel Lab');
  await expect(demoPage.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(demoPage.getByRole('button', { name: 'Elastic echo' })).toHaveAttribute('aria-pressed', 'true');
  await expect(demoPage.locator('#duration')).toHaveValue('1200');
  await expect(demoPage.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(demoPage.getByRole('button', { name: 'Start for real' })).toBeVisible();
});

test('@claim:demo-isolation Demo edits leave normal curve data unchanged', async () => {
  const normalCurve = JSON.stringify({ position: [0.62, 0, 0.78, 0.52], rotation: [0.72, -0.08, 0.82, 0.42], duration: 1800 });
  await demoPage.evaluate((value) => localStorage.setItem('motion-feel-lab:v1', value), normalCurve);
  await demoPage.getByRole('button', { name: 'Even glide' }).click();
  await expect(demoPage.getByRole('button', { name: 'Even glide' })).toHaveAttribute('aria-pressed', 'true');
  const storage = await demoPage.evaluate(() => ({ normal: localStorage.getItem('motion-feel-lab:v1'), demo: localStorage.getItem('demo:motion-feel-lab:v1') }));
  expect(storage.normal).toBe(normalCurve);
  expect(storage.demo).not.toBeNull();
});

test('@claim:six-presets The editor provides six selectable starting curves', async () => {
  const names = ['Soft arrival', 'Held departure', 'Heavy settle', 'Quick response', 'Elastic echo', 'Even glide'];
  for (const name of names) {
    await demoPage.getByRole('button', { name }).click();
    await expect(demoPage.getByRole('button', { name })).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(demoPage.locator('#curve-readout')).toContainText('cubic-bezier(0, 0, 1, 1)');
});

test('@claim:curve-editing Position and rotation curves can be adjusted with controls', async () => {
  await demoPage.getByRole('tab', { name: 'Rotation' }).click();
  await demoPage.locator('#x1').fill('0.4');
  await expect(demoPage.locator('#x1-output')).toHaveText('0.40');
  const firstHandle = demoPage.getByRole('slider', { name: 'First control point' }).first();
  await firstHandle.focus();
  const before = await firstHandle.getAttribute('aria-valuetext');
  await firstHandle.press('ArrowRight');
  await expect(firstHandle).not.toHaveAttribute('aria-valuetext', before ?? '');
  await expect(demoPage.locator('#curve-readout')).toContainText('0.41');
});

test('@claim:frame-comparison The same curve is shown at 2, 4, and 8 frames', async () => {
  for (const frameCount of [2, 4, 8]) {
    const strip = demoPage.getByLabel(`${frameCount} frame sample of the current motion`);
    await expect(strip).toBeVisible();
    await expect(strip.locator('.sample-frame')).toHaveCount(frameCount);
  }
});

test('@claim:css-export CSS export reflects the selected curve and duration', async () => {
  await demoPage.getByRole('button', { name: 'Even glide' }).click();
  await demoPage.locator('#duration').selectOption('1800');
  const code = demoPage.getByLabel('Generated export code');
  await expect(code).toContainText('animation: travel 1800ms cubic-bezier(0, 0, 1, 1) both');
  await expect(code).toContainText('animation: turn 1800ms cubic-bezier(0, 0, 1, 1) both');
});

test('@claim:javascript-export JavaScript export provides a motion sampler', async () => {
  await demoPage.getByRole('tab', { name: 'JavaScript' }).click();
  const code = demoPage.getByLabel('Generated export code');
  await expect(code).toContainText('function sampleMotion(progress)');
  await expect(code).toContainText('position: sampleBezier(motion.position, t)');
  await expect(code).toContainText('rotation: sampleBezier(motion.rotation, t)');
});

test('@claim:file-download Export can be downloaded as a file', async () => {
  const downloadPromise = demoPage.waitForEvent('download');
  await demoPage.getByRole('button', { name: 'Download' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('motion-feel.css');
  await expect(demoPage.getByText('motion-feel.css downloaded.')).toBeVisible();
});

test('@claim:share-link A share link contains the selected curve values', async () => {
  await demoContext.grantPermissions(['clipboard-read', 'clipboard-write']);
  await demoPage.getByRole('button', { name: 'Copy share link' }).click();
  const shared = await demoPage.evaluate(() => navigator.clipboard.readText());
  const url = new URL(shared);
  expect(url.pathname).toMatch(/^\/demo\/?$/);
  expect(url.hash).toMatch(/^#curve=/);
  expect(url.search).toBe('');
});

test('@claim:share-fragment Share values stay out of HTTP requests', async () => {
  await demoContext.grantPermissions(['clipboard-read', 'clipboard-write']);
  await demoPage.getByRole('button', { name: 'Copy share link' }).click();
  const shared = await demoPage.evaluate(() => navigator.clipboard.readText());
  const requests: string[] = [];
  const sharedPage = await demoContext.newPage();
  sharedPage.on('request', (request) => requests.push(request.url()));
  await sharedPage.goto(shared);
  expect(requests).toContain(`${new URL(shared).origin}${new URL(shared).pathname}`);
  expect(requests.every((url) => new URL(url).hash === '')).toBe(true);
  await sharedPage.close();
});

test('@claim:offline-reload The sample editor works offline after the first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Edit a sample motion curve' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play move' })).toBeEnabled();
  await expect(page.getByText(/Offline mode/)).toBeVisible();
  await context.close();
});

test('@claim:reduced-motion Reduced motion shows the end state instead of playing', async () => {
  await demoPage.emulateMedia({ reducedMotion: 'reduce' });
  await demoPage.getByRole('button', { name: 'Play move' }).click();
  await expect(demoPage.locator('#preview-readout')).toHaveText('t 1.00');
  await expect(demoPage.getByText(/Reduced motion is on/)).toBeVisible();
  await demoPage.emulateMedia({ reducedMotion: 'no-preference' });
});

test('@claim:small-screen The sample editor fits a 390 pixel viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await context.newPage();
  await page.goto('/demo');
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  await expect(page.getByRole('button', { name: 'Start for real' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Play move' })).toBeVisible();
  await context.close();
});

test('@claim:free-price The sample is free to use', async () => {
  await expect(demoPage.getByText('Free to use.')).toBeVisible();
});

test('@claim:no-account The sample editor opens without an account', async () => {
  await expect(demoPage.getByRole('button', { name: 'Play move' })).toBeEnabled();
  await expect(demoPage.getByRole('button', { name: 'Copy code' })).toBeEnabled();
});

test('@claim:local-privacy Sample use makes no request outside this site', async () => {
  const requests: string[] = [];
  const capture = (request: { url(): string }) => requests.push(request.url());
  demoPage.on('request', capture);
  await demoPage.reload();
  await demoPage.getByRole('button', { name: 'Elastic echo' }).click();
  await demoPage.getByRole('button', { name: 'Play move' }).click();
  await expect(demoPage.getByRole('button', { name: 'Play again' })).toBeVisible();
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((url) => new URL(url).origin === new URL(demoPage.url()).origin)).toBe(true);
  demoPage.off('request', capture);
});

test('has no serious accessibility violations in the sample demo', async () => {
  const results = await new AxeBuilder({ page: demoPage }).analyze();
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  expect(serious).toEqual([]);
});
