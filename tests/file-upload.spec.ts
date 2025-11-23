import { test, expect } from './setup';

test.describe('File Upload and Audio Loading', () => {
  test('should show load song button and handle click', async ({ page }) => {
    await page.goto('/');
    
    // Verify load song button is present and clickable
    const loadButton = page.getByText('Load Song');
    await expect(loadButton).toBeVisible();
    await expect(loadButton).toBeEnabled();
    
    // Click should trigger file picker (but we can't test the actual picker in web)
    await loadButton.click();
    
    // Button should still be visible after click (since no file was selected)
    await expect(loadButton).toBeVisible();
  });
  
  test('should maintain unloaded state without file selection', async ({ page }) => {
    await page.goto('/');
    
    const loadButton = page.getByText('Load Song');
    await loadButton.click();
    
    // Should remain in unloaded state
    await expect(page.getByText('Load Song')).toBeVisible();
    
    // Play button may be visible but should be for empty player
    // The important thing is Load Song button is still visible (not changed to "Song Loaded")
    const playButton = page.getByText('Play');
    if (await playButton.count() > 0) {
      // If Play button exists, it should be clickable but won't do anything without audio
      await expect(playButton).toBeVisible();
    }
  });
  
  test('should handle file upload button interaction', async ({ page }) => {
    await page.goto('/');
    
    // Click load song button (would open file picker in real scenario)
    const loadButton = page.getByText('Load Song');
    await loadButton.click();
    
    // Button should remain visible and functional
    await expect(loadButton).toBeVisible();
    await expect(loadButton).toBeEnabled();
    
    // Verify play button is available
    await expect(page.getByText('Play')).toBeVisible();
  });
  
  test('should maintain app state after load attempts', async ({ page }) => {
    await page.goto('/');
    
    const loadButton = page.getByText('Load Song');
    
    // Multiple clicks should not break the app
    await loadButton.click();
    await loadButton.click();
    
    // App should remain functional
    await expect(page.getByText('Load Song')).toBeVisible();
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
  });
});