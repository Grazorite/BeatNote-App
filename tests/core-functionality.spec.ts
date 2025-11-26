import { test, expect } from './setup';

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
      
      // Look for TAP button which should always be visible
      const tapButton = page.getByText('TAP');
      await expect(tapButton).toBeVisible();
    });
  });

  // Marker Placement Tests
  test.describe('Marker Placement', () => {
    test('should place markers via tap button', async ({ page }) => {
      await page.goto('/');
      
      // Find TAP button
      const tapButton = page.getByText('TAP');
      await expect(tapButton).toBeVisible();
      
      // Get initial marker count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Click TAP button to add marker
      await tapButton.click();
      
      // Wait for state update
      await page.waitForTimeout(100);
      
      // Verify marker was added
      const newText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('should handle view mode and stem switching', async ({ page }) => {
      await page.goto('/');
      
      // Test view mode switching
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      await expect(unifiedButton).toBeVisible();
      await expect(multitrackButton).toBeVisible();
      
      // Switch to multitrack view
      await multitrackButton.click();
      await page.waitForTimeout(300);
      
      // Verify app still works
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      
      // Test stem separation switching if visible
      const twoStemsButton = page.getByText('2 Stems');
      const sixStemsButton = page.getByText('6 Stems');
      
      if (await twoStemsButton.isVisible()) {
        await twoStemsButton.click();
        await page.waitForTimeout(300);
      }
      
      if (await sixStemsButton.isVisible()) {
        await sixStemsButton.click();
        await page.waitForTimeout(300);
      }
      
      // Switch back to unified view
      await unifiedButton.click();
      await page.waitForTimeout(300);
      
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });
  });
});