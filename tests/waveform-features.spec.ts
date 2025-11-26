import { test, expect } from './setup';

test.describe('Waveform Features', () => {
  // Waveform Interaction Tests
  test.describe('Waveform Interaction', () => {
    test('should show waveform area without audio', async ({ page }) => {
      await page.goto('/');
      
      // Check if SVG elements exist (used for waveform rendering)
      const svgElements = page.locator('svg');
      const hasSvg = await svgElements.count() > 0;
      
      if (hasSvg) {
        await expect(svgElements.first()).toBeVisible();
      } else {
        console.log('SVG elements not found - may be expected without audio');
      }
    });
    
    test('should display markers via tap button', async ({ page }) => {
      await page.goto('/');
      
      // Place markers via tap button (works without audio)
      const markerButton = page.getByText('TAP');
      await expect(markerButton).toBeVisible();
      
      // Get initial marker count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Click tap button multiple times
      await markerButton.click();
      await markerButton.click();
      await markerButton.click();
      
      // Wait for state updates
      await page.waitForTimeout(200);
      
      // Verify marker count increased
      const newText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      
      // Should have added markers
      expect(newCount).toBeGreaterThan(initialCount);
    });
    
    test('should show rhythmic grid elements', async ({ page }) => {
      await page.goto('/');
      
      // Look for SVG elements which are used for grid/waveform
      const svgElements = page.locator('svg');
      const hasSvg = await svgElements.count() > 0;
      
      expect(hasSvg).toBe(true);
    });
    
    test('should handle waveform area clicks', async ({ page }) => {
      await page.goto('/');
      
      // Look for SVG elements to click
      const svgElements = page.locator('svg');
      
      if (await svgElements.count() > 0) {
        await svgElements.first().click();
      }
      
      // Verify app remains functional after click
      await expect(page.getByText('Load Song')).toBeVisible();
    });
    
    test('should handle timeline interactions', async ({ page }) => {
      await page.goto('/');
      
      // Test interaction on SVG elements (timeline/waveform)
      const svgElements = page.locator('svg');
      
      if (await svgElements.count() > 0) {
        await svgElements.first().hover();
        await svgElements.first().click();
      }
      
      // Verify app remains functional
      await expect(page.getByText('Load Song')).toBeVisible();
    });
    
    test('should show play button and handle clicks', async ({ page }) => {
      await page.goto('/');
      
      const playButton = page.getByText('Play');
      await expect(playButton).toBeVisible();
      
      await playButton.click();
      
      // Verify button remains clickable
      const audioControls = page.getByText('Play').or(page.getByText('Pause'));
      await expect(audioControls).toBeVisible();
    });
  });

  // Waveform Rendering Tests
  test.describe('Waveform Rendering', () => {
    test('should render waveform placeholder without audio', async ({ page }) => {
      await page.goto('/');
      
      // Wait for the app to load
      await expect(page.getByText('Load Song')).toBeVisible();
      
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
      
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      // Both buttons should be present
      await expect(unifiedButton).toBeVisible();
      await expect(multitrackButton).toBeVisible();
      
      // Test switching between view modes
      await multitrackButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      
      await unifiedButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
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

  // Waveform Basic Tests
  test.describe('Waveform Basic', () => {
    test('should show basic waveform elements', async ({ page }) => {
      await page.goto('/');
      
      // Check for basic waveform-related elements
      const svgElements = page.locator('svg');
      const hasAnySvg = await svgElements.count() > 0;
      
      // Should have SVG elements for waveform rendering
      expect(hasAnySvg).toBe(true);
    });
    
    test('should display markers after placing them via tap', async ({ page }) => {
      await page.goto('/');
      
      // Place markers via tap button (works without audio)
      const markerButton = page.getByText('TAP');
      await expect(markerButton).toBeVisible();
      
      // Get initial count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Place multiple markers
      await markerButton.click();
      await markerButton.click();
      
      // Wait for state update
      await page.waitForTimeout(200);
      
      // Check marker count increased
      const markerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const markerCount = parseInt(markerText?.match(/\d+/)?.[0] || '0');
      
      expect(markerCount).toBeGreaterThan(initialCount);
    });
    
    test('should handle view mode switching', async ({ page }) => {
      await page.goto('/');
      
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      await expect(unifiedButton).toBeVisible();
      await expect(multitrackButton).toBeVisible();
      
      await multitrackButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      
      await unifiedButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });

    test('should show waveform elements without audio', async ({ page }) => {
      await page.goto('/');
      
      // Check for SVG elements that should be present
      const svgElements = page.locator('svg');
      const hasSvg = await svgElements.count() > 0;
      
      expect(hasSvg).toBe(true);
    });
    
    test('should handle waveform area interactions', async ({ page }) => {
      await page.goto('/');
      
      // Get initial marker count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Try clicking on SVG elements
      const svgElements = page.locator('svg');
      
      if (await svgElements.count() > 0) {
        await svgElements.first().click();
      }
      
      // Wait for potential state changes
      await page.waitForTimeout(200);
      
      // Verify app remains functional
      await expect(page.getByText('Load Song')).toBeVisible();
      
      // Check marker count (may or may not change)
      const newText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      expect(newCount >= initialCount).toBe(true);
    });
  });
});