import { test, expect } from '@playwright/test';

test('main canvas flow', async ({ page }) => {
  await page.goto('http://localhost:3001');

  // Wait for the app to load
  await page.waitForSelector('[data-react-root]');

  // Click the ready button
  await page.click('[data-testid="ready-button"]');

  // Select a topic
  await page.click('[data-testid="topic-button-money"]');

  // Select a sub-topic
  await page.click('[data-testid="subtopic-button-savings"]');

  // Select a replacement thought
  await page.click('[data-testid="thought-button-0"]');

  // Click the done button
  await page.click('text=Done');

  // Expect the thought mining container to be visible
  await expect(page.locator('text=Neutralize the Thought')).toBeVisible();

  // Click the export button
  await page.click('text=Export Selected Thought');

  // Expect the alert to be visible
  await page.on('dialog', dialog => expect(dialog.message()).toBe('Copied to clipboard!'));
});
