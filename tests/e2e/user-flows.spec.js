/**
 * End-to-End User Flow Tests
 * Tests complete user journeys from landing to completion
 * Validates both NLP-driven and legacy therapeutic paths
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';

test.describe('Complete User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Complete NLP-driven therapeutic journey - Money/Anxious', async ({ page }) => {
    // Step 1: Landing screen
    await expect(page.locator('h1')).toContainText('Ready to trade your old story for a new one?');
    await page.click('#btn-start');

    // Step 2: Readiness check
    await expect(page.locator('h2')).toContainText('How intense are your feelings right now?');
    
    // Set intensity to moderate level (5) to avoid ACT routing
    await page.locator('#intensity-slider').fill('5');
    await expect(page.locator('#intensity-value')).toContainText('5');
    await page.click('#btn-continue-readiness');

    // Step 3: Topic selection
    await expect(page.locator('h2')).toContainText('What area would you like to work on?');
    await page.click('.topic-money, [data-topic="Money"]');

    // Step 4: Emotion selection
    await expect(page.locator('h2')).toContainText('How are you feeling about this?');
    await page.click('.emotion-anxious, [data-emotion="anxious"]');

    // Step 5: Text input (mandatory for NLP)
    await expect(page.locator('h2')).toContainText('What\'s on your mind?');
    await page.fill('#starting-textarea', 'I keep worrying about not having enough money for retirement and it makes me feel anxious about my financial future');
    await page.click('#btn-begin-journey');

    // Wait for potential model loading
    await page.waitForTimeout(2000);

    // Step 6: Therapeutic journey
    await expect(page.locator('.journey-header h2')).toContainText('Your Journey');
    
    // Verify progress dots are visible
    await expect(page.locator('.progress-dots')).toBeVisible();
    
    // Complete the journey by clicking "This feels better" multiple times
    for (let i = 0; i < 6; i++) {
      await expect(page.locator('#journey-prompt')).toBeVisible();
      await page.click('#btn-feels-better');
      await page.waitForTimeout(500);
    }

    // Step 7: Completion screen
    await expect(page.locator('h2')).toContainText('Well Done!');
    await expect(page.locator('#completion-summary')).toBeVisible();
    await expect(page.locator('#emotional-shift-summary')).toBeVisible();
  });

  test('Complete legacy therapeutic journey - Romance/Lonely', async ({ page }) => {
    // Navigate through flow without providing text input to trigger legacy path
    await page.click('#btn-start');
    
    // Set moderate intensity
    await page.locator('#intensity-slider').fill('4');
    await page.click('#btn-continue-readiness');
    
    // Select Romance topic
    await page.click('.topic-romance, [data-topic="Romance"]');
    
    // Select lonely emotion
    await page.click('.emotion-lonely, [data-emotion="lonely"]');
    
    // Skip text input to trigger legacy path
    await page.click('#btn-begin-journey');
    
    // Should go to therapeutic journey with legacy content
    await expect(page.locator('.journey-header h2')).toContainText('Your Journey');
    
    // Complete journey
    for (let i = 0; i < 5; i++) {
      await page.click('#btn-feels-better');
      await page.waitForTimeout(500);
    }
    
    await expect(page.locator('h2')).toContainText('Well Done!');
  });

  test('ACT defusion flow - High intensity routing', async ({ page }) => {
    await page.click('#btn-start');
    
    // Set high intensity (8) to trigger ACT routing
    await page.locator('#intensity-slider').fill('8');
    await page.click('#btn-continue-readiness');
    
    await page.click('.topic-selfimage, [data-topic="Self-Image"]');
    await page.click('.emotion-worthless, [data-emotion="worthless"]');
    
    await page.fill('#starting-textarea', 'I feel completely worthless and like nothing I do matters');
    await page.click('#btn-begin-journey');
    
    // Should route to ACT defusion
    await expect(page.locator('#act-prompt')).toBeVisible();
    await page.click('#btn-act-continue');
    
    // Should complete to finish screen
    await expect(page.locator('h2')).toContainText('Well Done!');
  });

  test('ACT defusion flow - Try another angle trigger', async ({ page }) => {
    await page.click('#btn-start');
    await page.locator('#intensity-slider').fill('5');
    await page.click('#btn-continue-readiness');
    
    await page.click('.topic-money, [data-topic="Money"]');
    await page.click('.emotion-overwhelmed, [data-emotion="overwhelmed"]');
    
    await page.fill('#starting-textarea', 'I feel completely overwhelmed by my financial situation');
    await page.click('#btn-begin-journey');
    
    // Click "Try another angle" twice to trigger ACT
    await page.click('#btn-try-another');
    await page.waitForTimeout(500);
    await page.click('#btn-try-another');
    await page.waitForTimeout(500);
    
    // Should route to ACT defusion
    await expect(page.locator('#act-prompt')).toBeVisible();
  });

  test('Calendar integration flow', async ({ page }) => {
    // Complete a basic journey first
    await page.click('#btn-start');
    await page.locator('#intensity-slider').fill('3');
    await page.click('#btn-continue-readiness');
    await page.click('.topic-money, [data-topic="Money"]');
    await page.click('.emotion-anxious, [data-emotion="anxious"]');
    await page.fill('#starting-textarea', 'I worry about money sometimes');
    await page.click('#btn-begin-journey');
    
    // Complete journey quickly
    for (let i = 0; i < 5; i++) {
      await page.click('#btn-feels-better');
      await page.waitForTimeout(300);
    }
    
    // Go to calendar setup
    await page.click('#set-reminder-link');
    await expect(page.locator('h2')).toContainText('Set up gentle reminders');
    
    // Test daily reminder download
    const downloadPromise = page.waitForEvent('download');
    await page.click('#btn-daily');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.ics');
  });

  test('Start over functionality', async ({ page }) => {
    // Navigate partway through flow
    await page.click('#btn-start');
    await page.locator('#intensity-slider').fill('6');
    await page.click('#btn-continue-readiness');
    await page.click('.topic-romance, [data-topic="Romance"]');
    
    // Complete a journey
    await page.click('.emotion-rejected, [data-emotion="rejected"]');
    await page.fill('#starting-textarea', 'I was rejected and it hurts');
    await page.click('#btn-begin-journey');
    
    for (let i = 0; i < 5; i++) {
      await page.click('#btn-feels-better');
      await page.waitForTimeout(300);
    }
    
    // Click start over
    await page.click('#btn-start-over');
    
    // Should return to landing
    await expect(page.locator('h1')).toContainText('Ready to trade your old story for a new one?');
    
    // Verify state is reset
    await page.click('#btn-start');
    await expect(page.locator('#intensity-value')).toContainText('5'); // Default value
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Text input validation', async ({ page }) => {
    // Navigate to text input
    await page.click('#btn-start');
    await page.locator('#intensity-slider').fill('5');
    await page.click('#btn-continue-readiness');
    await page.click('.topic-money, [data-topic="Money"]');
    await page.click('.emotion-anxious, [data-emotion="anxious"]');
    
    // Try to continue without text
    await page.click('#btn-begin-journey');
    
    // Should show validation error
    const textarea = page.locator('#starting-textarea');
    await expect(textarea).toHaveCSS('border-color', 'rgb(231, 76, 60)'); // Red border
  });

  test('Model loading fallback', async ({ page }) => {
    // This test simulates model loading issues
    // In a real scenario, we'd mock the model loading to fail
    await page.click('#btn-start');
    await page.locator('#intensity-slider').fill('5');
    await page.click('#btn-continue-readiness');
    await page.click('.topic-selfimage, [data-topic="Self-Image"]');
    await page.click('.emotion-inadequate, [data-emotion="inadequate"]');
    
    await page.fill('#starting-textarea', 'I feel inadequate in many areas of my life');
    await page.click('#btn-begin-journey');
    
    // Should still proceed to journey even if NLP fails
    await expect(page.locator('.journey-header h2')).toContainText('Your Journey');
  });

  test('Content loading fallback', async ({ page }) => {
    // Test graceful degradation when content fails to load
    // This would require mocking fetch failures in a real test
    await page.click('#btn-start');
    await expect(page.locator('#btn-start')).toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  test('Mobile viewport journey', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto(BASE_URL);
    
    // Complete basic flow on mobile
    await page.click('#btn-start');
    await page.locator('#intensity-slider').fill('4');
    await page.click('#btn-continue-readiness');
    
    // Verify mobile-friendly layout
    await expect(page.locator('.container')).toBeVisible();
    
    await page.click('.topic-money, [data-topic="Money"]');
    await page.click('.emotion-anxious, [data-emotion="anxious"]');
    
    await page.fill('#starting-textarea', 'Mobile test input');
    await page.click('#btn-begin-journey');
    
    // Verify progress dots are visible on mobile
    await expect(page.locator('.progress-dots')).toBeVisible();
  });

  test('Tablet viewport journey', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    
    await page.goto(BASE_URL);
    
    // Test basic functionality on tablet
    await page.click('#btn-start');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Accessibility Tests', () => {
  test('Keyboard navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('#btn-start')).toBeFocused();
    
    await page.keyboard.press('Enter');
    
    // Should navigate to readiness screen
    await expect(page.locator('#intensity-slider')).toBeVisible();
  });

  test('ARIA labels and screen reader support', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('#btn-start');
    
    // Check slider has proper ARIA labels
    const slider = page.locator('#intensity-slider');
    await expect(slider).toHaveAttribute('aria-label');
    await expect(slider).toHaveAttribute('aria-describedby');
    
    // Check progress dots have proper labels
    await page.locator('#intensity-slider').fill('5');
    await page.click('#btn-continue-readiness');
    await page.click('.topic-money, [data-topic="Money"]');
    await page.click('.emotion-anxious, [data-emotion="anxious"]');
    await page.fill('#starting-textarea', 'Test input');
    await page.click('#btn-begin-journey');
    
    const dots = page.locator('.dot');
    await expect(dots.first()).toHaveAttribute('aria-label');
  });
});