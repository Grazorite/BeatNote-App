import { test, expect, loadTestAudio } from './setup';

test.describe('Critical annotation workflow', () => {
  test('creates markers only from controls and saves a mobile annotation', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadTestAudio(page);

    const gestureArea = page.getByTestId('wrapped-row-gesture-area-0');
    const box = await gestureArea.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    const markerCount = async () => Number(
      (await page.getByTestId('grand-total-markers').textContent())?.match(/\d+/)?.[0] || 0,
    );

    const annotationButton = page.getByTestId('annotation-control');
    await expect(annotationButton).toBeEnabled();
    await annotationButton.click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Add a marker first');
    await expect(page.getByTestId('annotation-editor-input')).not.toBeVisible();

    await gestureArea.click({ position: { x: box.width * 0.6, y: 12 } });
    await expect.poll(markerCount).toBe(0);
    await page.getByTestId('add-marker').click();
    await expect.poll(markerCount).toBe(1);

    await expect(annotationButton).toBeEnabled();
    await annotationButton.click();
    await page.getByTestId('annotation-editor-input').fill('Turn together');
    await page.getByTestId('save-annotation').click();

    const annotationDot = page.locator('[data-testid^="wrapped-row-annotation-vocals-"]').first();
    await expect(annotationDot).toHaveAttribute('fill', '#c084fc');
    await expect(annotationDot).toHaveAttribute('stroke', 'none');
    await expect(page.getByTestId('annotation-callout')).toContainText('Turn together');

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height - 12);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height - 12, { steps: 5 });
    await page.mouse.up();
    await expect.poll(markerCount).toBe(1);

    await annotationDot.click();
    await annotationButton.click();
    await expect(page.getByTestId('annotation-editor-input')).toHaveValue('Turn together');
  });

  test('preserves loaded marker data through portrait and landscape reflow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadTestAudio(page, 'long-test-track.m4a');
    await page.getByTestId('add-marker').click();

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('load-song')).toContainText('Replace Audio');
    await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');

    await page.setViewportSize({ width: 393, height: 852 });
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);
  });
});
