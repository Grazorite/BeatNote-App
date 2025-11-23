import { test, expect } from './setup';

test.describe('UI Components', () => {
  test('should render main layout components', async ({ page }) => {
    await page.goto('/');
    
    // Main title
    await expect(page.getByText('BeatNote Studio')).toBeVisible();
    
    // Audio controls
    await expect(page.getByText('Load Song')).toBeVisible();
    
    // Layer info
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
    const initialCount = parseInt(initialMarkerText?.match(/\d+/)?.[0] || '0');
    
    // Click tap button
    const tapButton = page.getByText('TAP', { exact: true });
    await tapButton.click();
    
    // Verify marker count increased
    const newMarkerText = await page.getByText(/Total: \d+ markers/).textContent();
    const newCount = parseInt(newMarkerText?.match(/\d+/)?.[0] || '0');
    
    expect(newCount).toBe(initialCount + 1);
  });
  
  test('should show BPM control', async ({ page }) => {
    await page.goto('/');
    
    const bpmText = page.getByText('BPM');
    const bpmValue = page.getByText('120');
    
    await expect(bpmText).toBeVisible();
    await expect(bpmValue).toBeVisible();
  });
  
  test('should show view mode toggle', async ({ page }) => {
    await page.goto('/');
    
    const singleButton = page.getByText('Single');
    const stemsButton = page.getByText('Stems', { exact: true });
    
    await expect(singleButton).toBeVisible();
    await expect(stemsButton).toBeVisible();
  });
  
  test('should show timeline elements', async ({ page }) => {
    await page.goto('/');
    
    // Look for timeline time displays
    const timeElements = page.getByText(/--:--/);
    const currentTimeElement = page.getByText(/Current: --:--/);
    
    // At least one time element should be visible
    const timeCount = await timeElements.count();
    expect(timeCount).toBeGreaterThan(0);
  });
});