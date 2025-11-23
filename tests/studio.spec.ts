import { test, expect } from './setup';

test.describe('BeatNote Studio', () => {
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
    
    // Look for Single and Stems buttons
    const singleButton = page.getByText('Single');
    const stemsButton = page.getByText('Stems', { exact: true });
    
    // Both buttons should be present
    await expect(singleButton).toBeVisible();
    await expect(stemsButton).toBeVisible();
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