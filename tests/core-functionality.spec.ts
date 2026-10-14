import { test, expect, loadTestAudio } from './setup';

test.describe('Core Functionality', () => {
  test('keeps deferred stem controls hidden without blocking marker creation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('View Mode')).toHaveCount(0);
    await expect(page.getByText('Stem Separation')).toHaveCount(0);
    await expect(page.getByTestId('layer-vocals')).toBeVisible();
    await loadTestAudio(page);
    await page.getByTestId('add-marker').click();
    await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
  });
});
