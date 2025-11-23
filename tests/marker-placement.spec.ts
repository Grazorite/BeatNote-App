import { test, expect } from './setup';

test.describe('Marker Placement', () => {
  test('should place markers via tap button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the studio to load
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    
    // Find TAP button
    const tapButton = page.getByText('TAP', { exact: true });
    await expect(tapButton).toBeVisible();
    
    // Get initial marker count
    const initialText = await page.getByText(/Total: \d+ markers/).textContent();
    const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
    
    // Click tap button to add marker
    await tapButton.click();
    
    // Verify marker was added
    const newText = await page.getByText(/Total: \d+ markers/).textContent();
    const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
    
    expect(newCount).toBe(initialCount + 1);
  });

  test('should handle view mode switching if implemented', async ({ page }) => {
    await page.goto('/');
    
    // Look for view mode toggle
    const singleButton = page.getByText('Single');
    const stemsButton = page.getByText('Stems', { exact: true });
    
    if (await singleButton.count() > 0 && await stemsButton.count() > 0) {
      await expect(singleButton).toBeVisible();
      await expect(stemsButton).toBeVisible();
      
      // Switch to stems view
      await stemsButton.click();
      await page.waitForTimeout(500);
      
      // Verify app still works
      await expect(page.getByText('BeatNote Studio')).toBeVisible();
      
      // Switch back to single view
      await singleButton.click();
      await page.waitForTimeout(500);
      
      await expect(page.getByText('BeatNote Studio')).toBeVisible();
    } else {
      console.log('View mode toggle not found - may not be implemented yet');
    }
  });
});