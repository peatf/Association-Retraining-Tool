const { chromium } = require('playwright');
const { expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

(async () => {
  const port = process.argv[2] || 3000;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`http://localhost:${port}`);

  await page.waitForSelector('[data-react-root]');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);

  await page.close();
  await browser.close();
})();
