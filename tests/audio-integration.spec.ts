import { test, expect } from './setup';

test.describe('Audio Integration Tests', () => {
  test('should show load song button', async ({ page }) => {
    await page.goto('/');
    
    const loadButton = page.getByText('Load Song');
    await expect(loadButton).toBeVisible();
    await expect(loadButton).toBeEnabled();
  });
  
  test('should allow tap to beat functionality', async ({ page }) => {
    await page.goto('/');
    
    const tapButton = page.getByText('TAP', { exact: true });
    await expect(tapButton).toBeVisible();
    
    // Get initial marker count
    const initialText = await page.getByText(/Total: \d+ markers/).textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    // Click tap button
    await tapButton.click();
    
    // Wait for state update
    await page.waitForTimeout(100);
    
    // Verify marker count increased
    const newText = await page.getByText(/Total: \d+ markers/).textContent();
    const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
    
    expect(newCount).toBe(initialCount + 1);
  });
  
  test('should show layer information', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/Active: Vocals/)).toBeVisible();
    await expect(page.getByText(/Total: \d+ markers/)).toBeVisible();
  });

  test('should handle load song button click', async ({ page }) => {
    await page.goto('/');
    
    const loadButton = page.getByText('Load Song');
    await loadButton.click();
    
    // Button should remain clickable (file picker would open in real scenario)
    await expect(loadButton).toBeVisible();
    await expect(loadButton).toBeEnabled();
  });
  
  test('should show play button when available', async ({ page }) => {
    await page.goto('/');
    
    // Play button should be visible (may be disabled without audio)
    const playButton = page.getByText('Play');
    await expect(playButton).toBeVisible();
  });
});