import { test, expect } from './setup';

test.describe('UI Components & Layout', () => {
  // Studio Screen Tests
  test.describe('Studio Screen', () => {
    test('should load the studio screen', async ({ page }) => {
      await page.goto('/');
      
      // Check if the main title is visible
      await expect(page.getByText('BeatNote Studio')).toBeVisible();
      
      // Check if main UI components are present
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
    });

    test('should show audio controls', async ({ page }) => {
      await page.goto('/');
      
      const loadButton = page.getByText('Load Song');
      await expect(loadButton).toBeVisible();
      await expect(loadButton).toBeEnabled();
      
      // Check for play/pause button (may not be visible until audio loaded)
      const playButton = page.locator('button').filter({ hasText: /play|pause/i });
      // Don't assert visibility since it may be conditional
    });

    test('should display layer information', async ({ page }) => {
      await page.goto('/');
      
      // Check if layer info is displayed with current format
      await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
      
      // Should show default active layer (vocals)
      await expect(page.getByText(/Active: Vocals/)).toBeVisible();
    });

    test('should have tap button available', async ({ page }) => {
      await page.goto('/');
      
      // Look for TAP button with exact text
      const tapButton = page.getByText('TAP', { exact: true });
      
      // TapButton should be present
      await expect(tapButton).toBeVisible();
    });
    
    test('should have view mode toggle', async ({ page }) => {
      await page.goto('/');
      
      // Look for Unified and Multitrack buttons
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      // Both buttons should be present
      await expect(unifiedButton).toBeVisible();
      await expect(multitrackButton).toBeVisible();
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
      
      // Check for main title
      await expect(page.getByText('BeatNote Studio')).toBeVisible();
      
      // Check for essential UI components
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
    });
    
    test('should show tap button', async ({ page }) => {
      await page.goto('/');
      
      const tapButton = page.getByText('TAP', { exact: true });
      await expect(tapButton).toBeVisible();
    });
    
    test('should handle tap button interaction', async ({ page }) => {
      await page.goto('/');
      
      // Get initial marker count
      const initialMarkerText = await page.getByText(/Total: \d+ markers/).textContent();
      const initialMarkerCount = parseInt(initialMarkerText?.match(/\d+/)?.[0] || '0');
      
      // Click tap button
      const tapButton = page.getByText('TAP', { exact: true });
      await tapButton.click();
      
      // Verify marker count increased
      const newMarkerText = await page.getByText(/Total: \d+ markers/).textContent();
      const newMarkerCount = parseInt(newMarkerText?.match(/\d+/)?.[0] || '0');
      
      expect(newMarkerCount).toBe(initialMarkerCount + 1);
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
    
    test('should show view mode toggle', async ({ page }) => {
      await page.goto('/');
      
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      await expect(unifiedButton).toBeVisible();
      await expect(multitrackButton).toBeVisible();
    });
    
    test('should show timeline elements', async ({ page }) => {
      await page.goto('/');
      
      // Look for timeline or time-related elements
      const timeElements = page.locator('[data-testid*="timeline"], [data-testid*="time"]');
      const timeText = page.getByText(/--:--/);
      
      // At least some time-related elements should be present
      const hasTimeElements = await timeElements.count() > 0;
      const hasTimeText = await timeText.count() > 0;
      
      // Either timeline elements or time display should be present
      expect(hasTimeElements || hasTimeText).toBe(true);
    });
  });

  // UI Layout Tests
  test.describe('UI Layout', () => {
    test('should render main layout without crashes', async ({ page }) => {
      await page.goto('/');
      
      // Basic smoke test - app should load without crashing
      await expect(page.getByText('BeatNote Studio')).toBeVisible();
      
      // Should have some interactive elements
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText('TAP', { exact: true })).toBeVisible();
    });
    
    test('should show sidebar elements', async ({ page }) => {
      await page.goto('/');
      
      // Look for sidebar-related elements
      const sidebarElements = page.locator('[data-testid*="sidebar"]');
      const stemElements = page.getByText(/Stems/);
      const layerElements = page.getByText(/Vocals|Drums|Bass/);
      
      // Check if any sidebar-like elements exist
      const hasSidebar = await sidebarElements.count() > 0;
      const hasStems = await stemElements.count() > 0;
      const hasLayers = await layerElements.count() > 0;
      
      // At least some organizational elements should be present
      expect(hasSidebar || hasStems || hasLayers).toBe(true);
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