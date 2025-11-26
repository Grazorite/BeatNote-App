import { test, expect } from './setup';

test.describe('UI Components & Layout', () => {
  // Studio Screen Tests
  test.describe('Studio Screen', () => {
    test('should load the studio screen', async ({ page }) => {
      await page.goto('/');
      
      // Check if main UI components are present
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });

    test('should show audio controls', async ({ page }) => {
      await page.goto('/');
      
      const loadButton = page.getByText('Load Song');
      await expect(loadButton).toBeVisible();
      await expect(loadButton).toBeEnabled();
      
      // Check for TAP button
      const tapButton = page.getByText('TAP');
      await expect(tapButton).toBeVisible();
    });

    test('should display layer information', async ({ page }) => {
      await page.goto('/');
      
      // Check if layer info is displayed with current format
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      await expect(page.getByText(/Grand Total:.*markers/)).toBeVisible();
    });

    test('should have tap button available', async ({ page }) => {
      await page.goto('/');
      
      // Look for TAP button
      const tapButton = page.getByText('TAP');
      await expect(tapButton).toBeVisible();
    });
    
    test('should have view mode toggle with vertical layout', async ({ page }) => {
      await page.goto('/');
      
      // Look for View Mode section and vertical toggle options
      await expect(page.getByText('View Mode')).toBeVisible();
      await expect(page.getByText('Unified')).toBeVisible();
      await expect(page.getByText('Multitrack')).toBeVisible();
    });
    
    test('should have stem separation selector', async ({ page }) => {
      await page.goto('/');
      
      // Check for stem separation section
      await expect(page.getByText('Stem Separation')).toBeVisible();
      await expect(page.getByText('2 Stems')).toBeVisible();
      await expect(page.getByText('4 Stems')).toBeVisible();
      await expect(page.getByText('6 Stems')).toBeVisible();
    });
    
    test('should have help button with icon', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByText('Help & Shortcuts')).toBeVisible();
    });
    
    test('should show BPM control', async ({ page }) => {
      await page.goto('/');
      
      // Look for BPM text and 120 value
      const bpmText = page.getByText('BPM');
      const bpmValue = page.getByText('120');
      
      // BPM control should be present
      await expect(bpmText).toBeVisible();
      await expect(bpmValue).toBeVisible();
    });
  });

  // UI Components Tests
  test.describe('UI Components', () => {
    test('should render main layout components', async ({ page }) => {
      await page.goto('/');
      
      // Check for essential UI components
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });
    
    test('should show tap button', async ({ page }) => {
      await page.goto('/');
      
      // Look for TAP button
      const tapButton = page.getByText('TAP');
      await expect(tapButton).toBeVisible();
    });
    
    test('should handle tap button interaction', async ({ page }) => {
      await page.goto('/');
      
      // Get initial marker count
      const initialMarkerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialMarkerCount = parseInt(initialMarkerText?.match(/\d+/)?.[0] || '0');
      
      // Click TAP button
      const tapButton = page.getByText('TAP');
      await tapButton.click();
      
      // Wait for state update
      await page.waitForTimeout(100);
      
      // Verify marker count increased
      const newMarkerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newMarkerCount = parseInt(newMarkerText?.match(/\d+/)?.[0] || '0');
      
      expect(newMarkerCount).toBeGreaterThan(initialMarkerCount);
    });
    
    test('should show BPM control', async ({ page }) => {
      await page.goto('/');
      
      // Check for BPM control elements
      await expect(page.getByText('BPM')).toBeVisible();
      await expect(page.getByText('120')).toBeVisible();
      
      // Check for BPM adjustment buttons
      await expect(page.getByText('-5')).toBeVisible();
      await expect(page.getByText('+5')).toBeVisible();
    });
    
    test('should show modern toggles and selectors', async ({ page }) => {
      await page.goto('/');
      
      // Check for core UI elements that should always be visible
      await expect(page.getByText('Stem Separation')).toBeVisible();
      await expect(page.getByText('View Mode')).toBeVisible();
      
      // Check for at least some toggle options (they may be collapsed)
      const markerOptions = page.getByText('Marker Options');
      const canvasOptions = page.getByText('Canvas Options');
      
      // At least the headers should be visible
      await expect(markerOptions).toBeVisible();
      await expect(canvasOptions).toBeVisible();
    });
    
    test('should show timeline elements', async ({ page }) => {
      await page.goto('/');
      
      // Look for SVG elements which are used for waveform/timeline
      const svgElements = page.locator('svg');
      const hasSvg = await svgElements.count() > 0;
      
      // Should have at least some visual elements
      expect(hasSvg).toBe(true);
    });
  });

  // UI Layout Tests
  test.describe('UI Layout', () => {
    test('should render main layout without crashes', async ({ page }) => {
      await page.goto('/');
      
      // Basic smoke test - app should load without crashing
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText('TAP')).toBeVisible();
    });
    
    test('should show sidebar elements with layer selector', async ({ page }) => {
      await page.goto('/');
      
      // Check for layer selector elements
      const vocalsButton = page.getByText('Vocals');
      const otherButton = page.getByText('Other');
      
      await expect(vocalsButton).toBeVisible();
      await expect(otherButton).toBeVisible();
      
      // Check help text
      const helpText = page.getByText(/Tap to select.*Long press to hide/);
      await expect(helpText).toBeVisible();
    });
    
    test('should check viewport dimensions', async ({ page }) => {
      await page.goto('/');
      
      // Get viewport info
      const viewportSize = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyHeight: document.body.scrollHeight
      }));
      
      console.log('Viewport dimensions:', viewportSize);
      
      // Basic sanity checks
      expect(viewportSize.viewportWidth).toBeGreaterThan(0);
      expect(viewportSize.viewportHeight).toBeGreaterThan(0);
      expect(viewportSize.bodyHeight).toBeGreaterThan(0);
    });
  });
});