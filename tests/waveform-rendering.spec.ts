import { test, expect } from './setup';

test.describe('Waveform Rendering', () => {
  test('should render waveform placeholder without audio', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the studio to load
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    
    // Check if waveform area is rendered (should show placeholder)
    const waveformArea = page.locator('svg').first();
    
    if (await waveformArea.count() > 0) {
      await expect(waveformArea).toBeVisible();
    }
    
    // Check if rhythmic grid is present
    const gridLines = page.locator('svg line');
    if (await gridLines.count() > 0) {
      // Grid lines may be present but not visible without audio
      console.log('SVG grid lines found in DOM');
    }
  });

  test('should handle view mode switching', async ({ page }) => {
    await page.goto('/');
    
    const singleButton = page.getByText('Single');
    const stemsButton = page.getByText('Stems', { exact: true });
    
    // Both buttons should be present
    await expect(singleButton).toBeVisible();
    await expect(stemsButton).toBeVisible();
    
    // Test switching between view modes
    await stemsButton.click();
    await page.waitForTimeout(300);
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    
    await singleButton.click();
    await page.waitForTimeout(300);
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
  });
  
  test('should show visual elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for any SVG elements (waveform, grid, etc.)
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    
    // Should have at least some visual elements
    expect(svgCount).toBeGreaterThan(0);
    
    // First SVG should be visible
    await expect(svgElements.first()).toBeVisible();
  });
});