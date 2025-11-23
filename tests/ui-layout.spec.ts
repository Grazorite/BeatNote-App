import { test, expect } from './setup';

test.describe('UI Layout', () => {
  test('should render main layout without crashes', async ({ page }) => {
    await page.goto('/');
    
    // Basic layout should be visible
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    await expect(page.getByText('Load Song')).toBeVisible();
    await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
  });
  
  test('should show sidebar elements', async ({ page }) => {
    await page.goto('/');
    
    // Look for sidebar toggle button (‹ symbol)
    const sidebarToggle = page.getByText('‹');
    await expect(sidebarToggle).toBeVisible();
    
    // Look for Controls text in sidebar
    const controlsText = page.getByText('Controls');
    await expect(controlsText).toBeVisible();
    
    // Test sidebar toggle
    await sidebarToggle.click();
    await page.waitForTimeout(300);
    
    // App should still be functional after toggle
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
  });
  
  test('should check viewport dimensions', async ({ page }) => {
    await page.goto('/');
    
    const dimensions = await page.evaluate(() => ({
      bodyHeight: document.body.scrollHeight,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth
    }));
    
    console.log('Viewport dimensions:', dimensions);
    
    // Basic sanity checks
    expect(dimensions.viewportWidth).toBeGreaterThan(0);
    expect(dimensions.viewportHeight).toBeGreaterThan(0);
  });
});