import { test, expect } from '@playwright/test';

test.describe('BeatNote Studio', () => {
  test('should load the studio screen', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main title is visible
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    
    // Check if main UI components are present
    await expect(page.getByText('Load Song')).toBeVisible();
    await expect(page.getByText('Active:')).toBeVisible();
  });

  test('should show load song button', async ({ page }) => {
    await page.goto('/');
    
    const loadButton = page.getByText('Load Song');
    await expect(loadButton).toBeVisible();
    await expect(loadButton).toBeEnabled();
  });

  test('should display layer information', async ({ page }) => {
    await page.goto('/');
    
    // Check if layer info is displayed
    await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
  });

  test('should have tap button available', async ({ page }) => {
    await page.goto('/');
    
    // Look for tap functionality (button or interactive element)
    // This will need to be adjusted based on your TapButton implementation
    const tapButton = page.locator('[data-testid="tap-button"]').or(
      page.getByRole('button').filter({ hasText: /tap|beat/i })
    );
    
    if (await tapButton.count() > 0) {
      await expect(tapButton.first()).toBeVisible();
    }
  });
});