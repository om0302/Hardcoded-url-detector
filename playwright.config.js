// ============================================================
//  playwright.config.js
// ============================================================
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir:    './tests',
  timeout:    15000,
  retries:    0,
  reporter:   [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL:     'http://localhost:5500',   // use Live Server or: npx serve .
    headless:    true,
    screenshot:  'only-on-failure',
    video:       'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
  // Automatically start a local web server
  webServer: {
    command:           'npx serve . --listen 5500',
    url:               'http://localhost:5500',
    reuseExistingServer: !process.env.CI,
    timeout:           10000,
  },
});
