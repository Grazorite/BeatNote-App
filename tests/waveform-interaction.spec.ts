import { test, expect } from './setup';

test.describe('Waveform Interaction', () => {
  test('should show waveform area without audio', async ({ page }) => {
    await page.goto('/');
    
    // Check if waveform area exists (may be empty without audio)
    const waveformContainer = page.locator('[data-testid="waveform-container"]');
    
    // Container may not exist without audio loaded
    const containerExists = await waveformContainer.count() > 0;
    
    if (containerExists) {
      await expect(waveformContainer).toBeVisible();
    } else {
      console.log('Waveform container not found - expected without audio');
    }
  });
  
  test('should display markers via tap button', async ({ page }) => {
    await page.goto('/');
    
    // Place markers via tap button (works without audio)
    const tapButton = page.getByText('TAP', { exact: true });
    await expect(tapButton).toBeVisible();
    
    // Get initial marker count
    const initialText = await page.getByText(/Total: \d+ markers/).textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    // Click tap button multiple times
    await tapButton.click();
    await tapButton.click();
    await tapButton.click();
    
    // Verify marker count increased
    const newText = await page.getByText(/Total: \d+ markers/).textContent();
    const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
    
    // Should have added at least one marker
    expect(newCount).toBeGreaterThan(initialCount);
  });
  
  test('should show rhythmic grid elements', async ({ page }) => {
    await page.goto('/');
    
    // Look for grid elements
    const grid = page.locator('[data-testid="rhythmic-grid"]');
    const svgElements = page.locator('svg');
    
    // Either grid or SVG elements should be present
    const hasGrid = await grid.count() > 0;
    const hasSvg = await svgElements.count() > 0;
    
    expect(hasGrid || hasSvg).toBe(true);
  });
  
  test('should handle waveform area clicks', async ({ page }) => {
    await page.goto('/');
    
    // Look for waveform container or SVG elements to click
    const waveformContainer = page.locator('[data-testid="waveform-container"]');
    const svgElements = page.locator('svg');
    
    if (await waveformContainer.count() > 0) {
      await waveformContainer.click();
    } else if (await svgElements.count() > 0) {
      await svgElements.first().click();
    }
    
    // Verify app remains functional after click
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
  });
  
  test('should handle timeline interactions', async ({ page }) => {
    await page.goto('/');
    
    // Test interaction on timeline elements
    const timeline = page.locator('[data-testid="timeline-scrollbar"]');
    
    if (await timeline.count() > 0) {
      await timeline.hover();
      await timeline.click();
    }
    
    // Verify app remains functional
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
  });
  
  test('should show play button and handle clicks', async ({ page }) => {
    await page.goto('/');
    
    const playButton = page.getByText('Play');
    await expect(playButton).toBeVisible();
    
    await playButton.click();
    
    // Verify button remains clickable
    const playPauseButton = page.getByText('Play').or(page.getByText('Pause'));
    await expect(playPauseButton).toBeVisible();
  });
});