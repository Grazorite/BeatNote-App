import { test, expect } from './setup';

test.describe('Core Functionality', () => {
  // Audio Integration Tests
  test.describe('Audio Integration', () => {
    test('should show load song button', async ({ page }) => {
      await page.goto('/');
      
      const loadButton = page.getByText('Load Song');
      await expect(loadButton).toBeVisible();
      await expect(loadButton).toBeEnabled();
    });
    
    test('should allow tap to beat functionality', async ({ page }) => {
      await page.goto('/');
      
      const markerButton = page.getByText('TAP', { exact: true });
      await expect(markerButton).toBeVisible();
      
      // Get initial marker count
      const initialText = await page.getByText(/Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Click tap button
      await markerButton.click();
      
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

  // File Upload Tests
  test.describe('File Upload', () => {
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

  // Marker Placement Tests
  test.describe('Marker Placement', () => {
    test('should place markers via tap button', async ({ page }) => {
      await page.goto('/');
      
      // Wait for the studio to load
      await expect(page.getByText('BeatNote Studio')).toBeVisible();
      
      // Find TAP button
      const markerButton = page.getByText('TAP', { exact: true });
      await expect(markerButton).toBeVisible();
      
      // Get initial marker count
      const initialText = await page.getByText(/Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Click tap button to add marker
      await markerButton.click();
      
      // Verify marker was added
      const newText = await page.getByText(/Total: \d+ markers/).textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      
      expect(newCount).toBe(initialCount + 1);
    });

    test('should handle view mode switching if implemented', async ({ page }) => {
      await page.goto('/');
      
      // Look for view mode toggle
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      if (await unifiedButton.count() > 0 && await multitrackButton.count() > 0) {
        await expect(unifiedButton).toBeVisible();
        await expect(multitrackButton).toBeVisible();
        
        // Switch to multitrack view
        await multitrackButton.click();
        await page.waitForTimeout(500);
        
        // Verify app still works
        await expect(page.getByText('BeatNote Studio')).toBeVisible();
        
        // Switch back to unified view
        await unifiedButton.click();
        await page.waitForTimeout(500);
        
        await expect(page.getByText('BeatNote Studio')).toBeVisible();
      } else {
        console.log('View mode toggle not found - may not be implemented yet');
      }
    });
  });
});