import { test, expect, loadTestAudio } from './setup';

test.describe('Critical interaction resilience', () => {
  test('supports keyboard activation of the marker control', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page);

    const markerButton = page.getByTestId('add-marker');
    await markerButton.focus();
    await expect(markerButton).toBeFocused();
    await markerButton.press('Enter');
    await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
  });

  test('keeps marker data when changing annotation lanes', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page);
    await page.getByTestId('add-marker').click();

    const markerCount = page.getByTestId('grand-total-markers');
    await expect(markerCount).toContainText('1 markers');
    await page.getByTestId('layer-drums').click();
    await expect(markerCount).toContainText('1 markers');
    await page.getByTestId('layer-vocals').click();
    await expect(markerCount).toContainText('1 markers');
  });

  test('handles repeated same-position marker taps deterministically', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page);

    const markerButton = page.getByTestId('add-marker');
    await Promise.all([
      markerButton.click(),
      markerButton.click(),
      markerButton.click(),
      markerButton.click(),
      markerButton.click(),
    ]);

    await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
    await expect(page.getByTestId('load-song')).toContainText('Song Loaded');
  });

  test('preserves loaded state and editing through desktop-phone reflow', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page);

    await page.setViewportSize({ width: 375, height: 667 });
    const sidebarToggle = page.getByTestId('sidebar-toggle');
    if (await sidebarToggle.isVisible()) await sidebarToggle.click();
    await expect(page.getByTestId('load-song')).toContainText('Song Loaded');
    await page.getByTestId('add-marker').click();

    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.getByTestId('load-song')).toContainText('Song Loaded');
    await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
  });
});
