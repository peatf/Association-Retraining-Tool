import { test, expect } from '@playwright/test';

test('error handling and recovery', async ({ page }) => {
  await page.goto('http://localhost:3001');

  // Wait for the app to load
  await page.waitForSelector('[data-react-root]');

  // Intercept the content search service request and return an error
  await page.route('**/content-index.bin', route => {
    route.abort();
  });

  // Click the ready button
  await page.click('[data-testid="ready-button"]');

  // Expect the error state to be visible
  await expect(page.locator('text=Failed to Load Categories')).toBeVisible();

  // Click the retry button
  await page.click('text=Try Again');

  // Un-intercept the content search service request
  await page.unroute('**/content-index.bin');

  // Expect the topic selector to be visible
  await expect(page.locator('text=Money')).toBeVisible();
});
