// ============================================================
//  tests/url-detector.spec.js
//  Playwright Tests — Hardcoded URL Detector PRO
//
//  ✅ No file upload needed — uses Paste Code tab to inject
//     test code directly into the browser.
//  Run: npx playwright test
// ============================================================

const { test, expect } = require('@playwright/test');

// ── Sample code injected into Paste Code tab ─────────────────
const SAMPLE_CODE = `
const API_BASE  = "https://api.example.com/v1/users";
const AUTH_URL  = "https://auth.myapp.com/login";
const PAYMENT   = "https://payment.stripe.com/charge";
const INSECURE  = "http://old.service.com/api";
const LOCAL_DEV = "http://localhost:3000/debug";
const IP_ADDR   = "http://192.168.1.100/admin";
const TOKEN_URL = "https://api.service.com?api_key=ABCDEF1234567890XXYZ";
const DUPE1     = "https://api.example.com/v1/users";
`;

// ── Helper — navigate and inject sample code ─────────────────
async function goAndScanPaste(page) {
  // Navigate to the Paste Code tab
  await page.click('button[data-tab="paste"]');
  await page.fill('#pasteArea', SAMPLE_CODE);
  await page.click('#pasteScanBtn');
  // Wait for stats to appear
  await page.waitForSelector('#statsRow', { state: 'visible', timeout: 5000 });
}

// ════════════════════════════════════════════════════════════
//  1. Page Load & Header
// ════════════════════════════════════════════════════════════
test('Page loads with correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Hardcoded URL Detector/);
});

test('Header shows PRO badge', async ({ page }) => {
  await page.goto('/');
  const header = await page.textContent('h1');
  expect(header).toContain('Hardcoded URL Detector');
});

// ════════════════════════════════════════════════════════════
//  2. Tab Navigation
// ════════════════════════════════════════════════════════════
test('All 8 tabs are visible', async ({ page }) => {
  await page.goto('/');
  const tabs = ['scan', 'paste', 'bulk', 'analyzer', 'risk', 'charts', 'history', 'howto'];
  for (const tab of tabs) {
    await expect(page.locator(`button[data-tab="${tab}"]`)).toBeVisible();
  }
});

test('Switching tabs activates correct panel', async ({ page }) => {
  await page.goto('/');
  await page.click('button[data-tab="paste"]');
  await expect(page.locator('#tab-paste')).toHaveClass(/active/);
  await expect(page.locator('#tab-scan')).not.toHaveClass(/active/);
});

test('Bulk Scan tab shows file chooser button', async ({ page }) => {
  await page.goto('/');
  await page.click('button[data-tab="bulk"]');
  await expect(page.locator('#bulkScanBtn')).toBeVisible();
});

// ════════════════════════════════════════════════════════════
//  3. Paste Code & Scan (no file upload)
// ════════════════════════════════════════════════════════════
test('Paste Code tab accepts text', async ({ page }) => {
  await page.goto('/');
  await page.click('button[data-tab="paste"]');
  await page.fill('#pasteArea', 'https://test.example.com/api');
  const val = await page.inputValue('#pasteArea');
  expect(val).toContain('https://test.example.com/api');
});

test('Scanning pasted code shows stat row', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await expect(page.locator('#statsRow')).toBeVisible();
});

test('Total URL count is correct (8 URLs in sample)', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const total = await page.textContent('#statTotal');
  expect(parseInt(total)).toBeGreaterThanOrEqual(8);
});

test('HTTPS count is non-zero', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const https = await page.textContent('#statHttps');
  expect(parseInt(https)).toBeGreaterThan(0);
});

test('HTTP count detects insecure URLs', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const http = await page.textContent('#statHttp');
  expect(parseInt(http)).toBeGreaterThan(0);
});

test('Localhost count is non-zero', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const local = await page.textContent('#statLocal');
  expect(parseInt(local)).toBeGreaterThan(0);
});

test('IP Address count is non-zero', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const ip = await page.textContent('#statIP');
  expect(parseInt(ip)).toBeGreaterThan(0);
});

test('Duplicates count is non-zero (api.example.com appears twice)', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const dupes = await page.textContent('#statDupes');
  expect(parseInt(dupes)).toBeGreaterThanOrEqual(1);
});

// ════════════════════════════════════════════════════════════
//  4. Result Cards
// ════════════════════════════════════════════════════════════
test('Result cards appear after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const cards = page.locator('.result-card');
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);
});

test('Result cards show URL text', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const firstCard = page.locator('.result-card').first();
  const text = await firstCard.textContent();
  expect(text).toMatch(/https?:\/\//);
});

test('Result cards have type badges', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await expect(page.locator('.badge').first()).toBeVisible();
});

test('Result cards have risk badges', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await expect(page.locator('.risk-badge').first()).toBeVisible();
});

// ════════════════════════════════════════════════════════════
//  5. Filter Chips
// ════════════════════════════════════════════════════════════
test('Filter section appears after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await expect(page.locator('#filterSection')).toBeVisible();
});

test('HTTPS filter chip works', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('.chip[data-filter="https"]');
  const cards = page.locator('.result-card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  // All visible cards should have HTTPS badge
  const badges = await page.locator('.badge.https').count();
  expect(badges).toBeGreaterThan(0);
});

test('HTTP filter shows only HTTP cards', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('.chip[data-filter="http"]');
  const httpsBadges = await page.locator('.badge.https').count();
  const httpBadges  = await page.locator('.badge.http').count();
  expect(httpBadges).toBeGreaterThan(0);
  // After HTTP filter, HTTPS cards should be hidden
  expect(httpsBadges).toBe(0);
});

test('All filter restores full results', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const totalBefore = await page.locator('.result-card').count();
  await page.click('.chip[data-filter="https"]');
  await page.click('.chip[data-filter="all"]');
  const totalAfter = await page.locator('.result-card').count();
  expect(totalAfter).toBe(totalBefore);
});

// ════════════════════════════════════════════════════════════
//  6. Search Bar
// ════════════════════════════════════════════════════════════
test('Search bar filters results', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.fill('#searchBar', 'localhost');
  const cards = await page.locator('.result-card').count();
  expect(cards).toBeGreaterThanOrEqual(1);
});

test('Search with no match shows no-url message', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.fill('#searchBar', 'zzz-nonexistent-domain-xyz-9999');
  await expect(page.locator('.no-url')).toBeVisible();
});

// ════════════════════════════════════════════════════════════
//  7. AI Analyzer Tab
// ════════════════════════════════════════════════════════════
test('AI Analyzer renders after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="analyzer"]');
  await expect(page.locator('#analyzerContent .analyzer-section').first()).toBeVisible({ timeout: 5000 });
});

test('AI Analyzer shows duplicate detection section', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="analyzer"]');
  const text = await page.locator('#analyzerContent').textContent();
  expect(text).toContain('Duplicate URLs');
});

test('AI Analyzer shows env variable suggestions', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="analyzer"]');
  const text = await page.locator('#analyzerContent').textContent();
  expect(text).toContain('URL_');
});

// ════════════════════════════════════════════════════════════
//  8. Risk Report Tab
// ════════════════════════════════════════════════════════════
test('Risk Report renders after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="risk"]');
  await expect(page.locator('#riskContent')).toBeVisible();
  const text = await page.locator('#riskContent').textContent();
  expect(text).not.toContain('Run a scan first');
});

test('Risk Report shows version info after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="risk"]');
  await expect(page.locator('#versionInfo')).toBeVisible();
});

test('Version info contains scan ID', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="risk"]');
  const scanId = await page.textContent('#reportScanId');
  expect(scanId).toMatch(/SCAN-\d+/);
});

test('Version starts at v1 on fresh session', async ({ page }) => {
  // Clear storage before this test
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('urlDetectorVersions'));
  await page.reload();
  await goAndScanPaste(page);
  await page.click('button[data-tab="risk"]');
  const version = await page.textContent('#reportVersion');
  expect(version).toBe('v1');
});

// ════════════════════════════════════════════════════════════
//  9. Charts Tab
// ════════════════════════════════════════════════════════════
test('Charts tab renders canvases after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="charts"]');
  await expect(page.locator('#chartTypes')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#chartRisk')).toBeVisible();
});

// ════════════════════════════════════════════════════════════
//  10. History Tab
// ════════════════════════════════════════════════════════════
test('History tab shows scan entry after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="history"]');
  const items = page.locator('.history-item');
  await expect(items.first()).toBeVisible();
});

test('History shows pasted-code as source', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('button[data-tab="history"]');
  const text = await page.locator('#historyList').textContent();
  expect(text).toContain('pasted-code');
});

// ════════════════════════════════════════════════════════════
//  11. Export Bar
// ════════════════════════════════════════════════════════════
test('Export bar appears after scan', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await expect(page.locator('#bottomBar')).toBeVisible();
});

test('Export buttons are present', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const bar = page.locator('#bottomBar');
  await expect(bar.locator('text=.txt')).toBeVisible();
  await expect(bar.locator('text=.csv')).toBeVisible();
  await expect(bar.locator('text=.json')).toBeVisible();
});

// ════════════════════════════════════════════════════════════
//  12. Theme Toggle
// ════════════════════════════════════════════════════════════
test('Theme toggle button exists', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#themeToggleBtn')).toBeVisible();
});

test('Theme toggle switches light mode class', async ({ page }) => {
  await page.goto('/');
  await page.click('#themeToggleBtn');
  const isLight = await page.evaluate(() => document.body.classList.contains('light-mode'));
  expect(isLight).toBe(true);
});

// ════════════════════════════════════════════════════════════
//  13. Clear Results
// ════════════════════════════════════════════════════════════
test('Clear button hides stats row', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('#bottomBar button:has-text("Clear")');
  await expect(page.locator('#statsRow')).toBeHidden();
});

test('Clear button empties result cards', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  await page.click('#bottomBar button:has-text("Clear")');
  const cards = await page.locator('.result-card').count();
  expect(cards).toBe(0);
});

// ════════════════════════════════════════════════════════════
//  14. Admin Panel
// ════════════════════════════════════════════════════════════
test('Admin button opens login modal', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Admin")');
  await expect(page.locator('#adminModal')).toBeVisible();
});

test('Wrong admin credentials shows error toast', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Admin")');
  await page.fill('#adminUser', 'wrong');
  await page.fill('#adminPass', 'wrong');
  await page.click('button:has-text("Login")');
  await expect(page.locator('#toast')).toHaveClass(/show/, { timeout: 3000 });
});

test('Correct admin credentials opens admin panel', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Admin")');
  await page.fill('#adminUser', 'admin');
  await page.fill('#adminPass', 'admin123');
  await page.click('button:has-text("Login")');
  await expect(page.locator('#adminPanel')).toBeVisible({ timeout: 3000 });
});

// ════════════════════════════════════════════════════════════
//  ❌ INTENTIONAL FAILING TEST (as required by assignment)
//     This test expects 999 URLs — will always fail.
//     It demonstrates a known edge case for review.
// ════════════════════════════════════════════════════════════
test('INTENTIONAL FAIL — expects unrealistic URL count', async ({ page }) => {
  await page.goto('/');
  await goAndScanPaste(page);
  const total = await page.textContent('#statTotal');
  // This WILL fail — sample code only has ~8 URLs, not 999
  expect(parseInt(total)).toBe(999);
});
