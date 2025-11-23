import { test, expect } from './setup';

test.describe('Test Discovery and Setup', () => {
  test('should discover this test in Playwright UI', async ({ page }) => {
    await page.goto('/');
    
    // Basic test to ensure test discovery works
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Test discovery working - this test should appear in Playwright UI');
  });
  
  test('should have basic test setup working', async ({ page }) => {
    // Basic test to verify test setup
    await page.goto('/');
    
    // Verify page loads
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Test setup working - page loads correctly');
  });
  
  test('should load BeatNote app with core components', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForLoadState('networkidle');
    
    // Check for main app elements that should be present
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    await expect(page.getByText('Load Song')).toBeVisible();
    await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
    
    console.log('✅ BeatNote app loads with core components');
  });
  
  test('should show current app state', async ({ page }) => {
    await page.goto('/');
    
    // Check core elements are present
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    await expect(page.getByText('Load Song')).toBeVisible();
    await expect(page.getByText(/Active:.*Total:.*markers/)).toBeVisible();
    await expect(page.getByText('TAP', { exact: true })).toBeVisible();
    
    console.log('✅ All core app elements are visible');
  });
});