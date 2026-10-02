import { test, expect, loadTestAudio } from './setup';

test.describe('Core Functionality', () => {
  // Basic UI Tests
  test.describe('Basic UI', () => {
    test('should show load song button', async ({ page }) => {
      await page.goto('/');
      
      const loadButton = page.getByText('Load Song');
      await expect(loadButton).toBeVisible();
      await expect(loadButton).toBeEnabled();
    });
    
    test('should show layer information', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      await expect(page.getByText(/Grand Total: \d+ markers/)).toBeVisible();
    });

    test('should show audio controls when available', async ({ page }) => {
      await page.goto('/');
      
      const markerButton = page.getByTestId('add-marker');
      await expect(markerButton).toBeVisible();
      await expect(markerButton).toBeDisabled();
    });
  });

  // Marker Placement Tests
  test.describe('Marker Placement', () => {
    test('should place markers via tap button', async ({ page }) => {
      await page.goto('/');
      
      await loadTestAudio(page);
      const markerButton = page.getByTestId('add-marker');
      await expect(markerButton).toBeEnabled();
      
      // Get initial marker count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Click TAP button to add marker
      await markerButton.click();
      
      // Wait for state update
      await page.waitForTimeout(100);
      
      // Verify marker was added
      const newText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('should keep deferred stem controls hidden without blocking markers', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('View Mode')).toHaveCount(0);
      await expect(page.getByText('Stem Separation')).toHaveCount(0);
      await expect(page.getByTestId('layer-vocals')).toBeVisible();
      await loadTestAudio(page);
      await page.getByTestId('add-marker').click();
      await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
    });
  });
});
