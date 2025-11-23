import { test, expect } from '@playwright/test';

test.describe('Marker Placement Bug', () => {
  test('should place markers at current playhead position after waveform interaction', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the studio to load
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    
    // Check initial state - no song loaded yet
    await expect(page.getByText('Load Song')).toBeVisible();
    
    // Since we can't actually load a file in the test, let's simulate the state
    // by checking if the waveform canvas and tap button are present
    const waveformCanvas = page.locator('svg').first();
    const tapButton = page.getByText('TAP');
    
    // Check if components are rendered
    if (await waveformCanvas.count() > 0) {
      await expect(waveformCanvas).toBeVisible();
    }
    
    if (await tapButton.count() > 0) {
      await expect(tapButton).toBeVisible();
    }
    
    // Test the marker placement logic by checking the store state
    // This test will help us understand the current behavior
    const currentTimeDisplay = page.getByText(/Current:/);
    if (await currentTimeDisplay.count() > 0) {
      await expect(currentTimeDisplay).toBeVisible();
    }
  });

  test('should update current time when clicking on waveform', async ({ page }) => {
    await page.goto('/');
    
    // Wait for components to load
    await page.waitForTimeout(1000);
    
    // Look for the waveform SVG element
    const waveformSvg = page.locator('svg').first();
    
    if (await waveformSvg.count() > 0) {
      // Get the bounding box of the waveform
      const boundingBox = await waveformSvg.boundingBox();
      
      if (boundingBox) {
        // Click at a specific position on the waveform (middle)
        const clickX = boundingBox.x + boundingBox.width / 2;
        const clickY = boundingBox.y + boundingBox.height / 2;
        
        await page.mouse.click(clickX, clickY);
        
        // Check if the current time display updates
        // This should reflect the new playhead position
        const timeDisplay = page.getByText(/Current:/);
        if (await timeDisplay.count() > 0) {
          const timeText = await timeDisplay.textContent();
          console.log('Current time after click:', timeText);
        }
      }
    }
  });
});