import { test, expect, loadTestAudio } from './setup';

test.describe('Waveform Features', () => {
  test.describe('Critical wrapped waveform workflows', () => {
    test('should render the loaded song as wrapped rows', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page);

      await expect(page.getByTestId('wrapped-waveform')).toBeVisible();
      await expect(page.getByTestId('wrapped-row-0')).toBeVisible();
      await expect(page.getByTestId('wrapped-row-gutter-0')).toContainText('0:00');
      await expect(page.getByTestId('wrapped-row-waveform-0')).toBeVisible();
      await expect(page.getByTestId('wrapped-row-playhead-0')).toBeAttached();
    });

    test('should expose wrapped controls and markers to assistive technology', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page);

      const activeRow = page.getByTestId('wrapped-row-0');
      // React Native Web maps the native "adjustable" role to the ARIA slider role.
      await expect(activeRow).toHaveAttribute('role', 'slider');
      await expect(activeRow).toHaveAttribute('aria-label', 'Row 1, 0:00 to 0:08');
      await expect(activeRow).toHaveAttribute('aria-valuetext', /Playback at 0:00/);

      await expect(page.getByTestId('wrapped-row-gutter-0')).toHaveAttribute(
        'aria-label',
        'Row starts at 0:00',
      );
      await expect(page.getByTestId('wrapped-follow-toggle')).toHaveAttribute(
        'aria-label',
        'Follow playhead',
      );
      await expect(page.getByTestId('row-density-preset-default')).toHaveAttribute(
        'aria-label',
        'Default',
      );

      const detailAction = page.getByTestId('wrapped-row-detail-0');
      await detailAction.focus();
      await detailAction.press('Enter');
      await expect(page.getByTestId('waveform-detail-panel')).toBeVisible();
      await expect(page.getByTestId('waveform-detail-close')).toHaveAttribute(
        'aria-label',
        'Close waveform details',
      );
      await page.getByTestId('waveform-detail-close').click();
      await expect(page.getByTestId('wrapped-waveform')).toBeVisible();

      const gestureArea = page.getByTestId('wrapped-row-gesture-area-0');
      const box = await gestureArea.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      await gestureArea.click({ position: { x: box.width * 0.4, y: 12 } });
      await expect(page.getByTestId('grand-total-markers')).toContainText('0 markers');
      await page.getByTestId('add-marker').click();
      const marker = page.locator('[data-testid^="wrapped-row-marker-vocals-"]');
      await expect(marker).toHaveAttribute('aria-label', /Vocals marker at 0:0[1-4], not annotated/);

      await page.getByTestId('marker-annotation').fill('Accessible note');
      await expect(marker).toHaveAttribute('aria-label', /Vocals marker at 0:0[1-4], annotated/);
      await expect(page.locator('[data-testid^="wrapped-row-annotation-vocals-"]')).toBeVisible();
    });

    test('should reserve marker creation for the marker controls', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page);

      const gestureArea = page.getByTestId('wrapped-row-gesture-area-0');
      await expect(gestureArea).toBeVisible();
      const box = await gestureArea.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      const markerCount = async () => Number(
        (await page.getByTestId('grand-total-markers').textContent())?.match(/\d+/)?.[0] || 0,
      );
      const initialMarkers = await markerCount();

      await gestureArea.click({ position: { x: box.width * 0.7, y: box.height - 12 } });
      await expect.poll(markerCount).toBe(initialMarkers);

      const markerPosition = { x: box.width * 0.6, y: 12 };
      await gestureArea.click({ position: markerPosition });
      await expect.poll(markerCount).toBe(initialMarkers);

      await page.getByTestId('add-marker').click();
      await expect.poll(markerCount).toBe(initialMarkers + 1);

      await gestureArea.click({ position: markerPosition });
      await expect.poll(markerCount).toBe(initialMarkers + 1);

      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height - 12);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height - 12, { steps: 5 });
      await page.mouse.up();
      await expect.poll(markerCount).toBe(initialMarkers + 1);
      await expect(page.getByText('Something went wrong')).toHaveCount(0);
    });

    test('should show and reopen compact annotation indicators', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page);

      const gestureArea = page.getByTestId('wrapped-row-gesture-area-0');
      const box = await gestureArea.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      await gestureArea.click({ position: { x: box.width * 0.4, y: 12 } });
      await page.getByTestId('add-marker').click();
      const annotationField = page.getByTestId('marker-annotation');
      await annotationField.fill('Turn');

      const singleIndicator = page.locator('[data-testid^="wrapped-row-annotation-vocals-"]');
      await expect(singleIndicator).toBeVisible();
      await expect(page.getByText('Turn')).toHaveCount(0);

      await annotationField.blur();
      await gestureArea.click({ position: { x: box.width * 0.8, y: box.height - 12 } });
      await expect(annotationField).toHaveValue('');

      await singleIndicator.click();
      await expect(annotationField).toHaveValue('Turn');
      await expect(page.getByText('Something went wrong')).toHaveCount(0);
    });

    test('should reflow row-density presets without changing marker data', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page, 'long-test-track.m4a');

      const gestureArea = page.getByTestId('wrapped-row-gesture-area-0');
      const box = await gestureArea.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      await gestureArea.click({ position: { x: box.width * 0.25, y: 12 } });
      await page.getByTestId('add-marker').click();
      const annotationField = page.getByTestId('marker-annotation');
      await annotationField.fill('Keep me');
      const marker = page.locator('[data-testid^="wrapped-row-marker-vocals-"]');
      const indicator = page.locator('[data-testid^="wrapped-row-annotation-vocals-"]');
      await expect(marker).toHaveCount(1);
      await expect(indicator).toHaveCount(1);

      await expect(page.getByTestId('wrapped-row-gutter-1')).toContainText('0:08');

      await page.getByTestId('row-density-preset-spacious').click();
      await expect(page.getByTestId('wrapped-row-gutter-1')).toContainText('0:04');
      await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
      await expect(marker).toHaveCount(1);
      await expect(indicator).toHaveCount(1);
      await expect(annotationField).toHaveValue('Keep me');

      await page.getByTestId('row-density-preset-compact').click();
      await expect(page.getByTestId('wrapped-row-gutter-1')).toContainText('0:12');
      await expect(page.getByTestId('grand-total-markers')).toContainText('1 markers');
      await expect(marker).toHaveCount(1);
      await expect(indicator).toHaveCount(1);
      await expect(annotationField).toHaveValue('Keep me');
    });

    test('follow-playhead toggle and wrapped scroll on long track', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page, 'long-test-track.m4a');

      const followToggle = page.getByTestId('wrapped-follow-toggle');
      await expect(followToggle).toHaveText('Follow: On');

      await followToggle.click();
      await expect(followToggle).toHaveText('Follow: Off');

      await followToggle.click();
      await expect(followToggle).toHaveText('Follow: On');

      const waveform = page.getByTestId('wrapped-waveform');
      await expect(waveform).toBeVisible();

      // Start playback so follow-playhead is active.
      const playPause = page.getByTestId('play-pause');
      await expect(playPause).toBeVisible();
      await playPause.click();

      const distantRow = page.locator('[data-testid^="wrapped-row-"][role="slider"]').last();
      await distantRow.scrollIntoViewIfNeeded();
      await expect(distantRow).toBeVisible();
      const box = await distantRow.boundingBox();
      expect(box).not.toBeNull();
      if (!box) return;

      await distantRow.click({ position: { x: box.width * 0.95, y: box.height / 2 }, force: true });

      // While playing and tracking a distant row, waveform should have scrolled down.
      await expect.poll(
        () => waveform.evaluate(element => element.scrollTop),
        { timeout: 5000 },
      ).toBeGreaterThan(0);

      await waveform.hover();
      await page.mouse.wheel(0, -10000);
      await expect(followToggle).toHaveText('Follow: Suspended');

      await followToggle.click();
      await expect(followToggle).toHaveText('Follow: On');
      await expect.poll(
        () => waveform.evaluate(element => element.scrollTop),
        { timeout: 5000 },
      ).toBeGreaterThan(0);

      await waveform.hover();
      await page.mouse.wheel(0, -10000);
      await expect(followToggle).toHaveText('Follow: Suspended');
      await followToggle.click();
      await expect(followToggle).toHaveText('Follow: On');

      // No runtime error screen
      await expect(page.getByText('Something went wrong')).toHaveCount(0);
    });

    test('precision detail switches responsively without mutating studio data', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await page.getByTestId('sidebar-toggle').click();
      await loadTestAudio(page, 'long-test-track.m4a');

      const overview = page.getByTestId('loop-overview');
      const overviewBox = await page.getByTestId('loop-overview-track-region').boundingBox();
      expect(overviewBox).not.toBeNull();
      if (!overviewBox) return;
      await page.mouse.move(overviewBox.x + overviewBox.width * 0.01, overviewBox.y + overviewBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(overviewBox.x + overviewBox.width * 0.04, overviewBox.y + overviewBox.height / 2, { steps: 6 });
      await page.mouse.up();

      await expect(page.getByTestId('wrapped-row-gutter-1')).not.toContainText('0:04');
      const firstRow = page.getByTestId('wrapped-row-gesture-area-0');
      const firstRowBox = await firstRow.boundingBox();
      expect(firstRowBox).not.toBeNull();
      if (!firstRowBox) return;
      await firstRow.click({ position: { x: firstRowBox.width * 0.25, y: 12 } });
      await page.getByTestId('add-marker').click();
      const annotationField = page.getByTestId('marker-annotation');
      await annotationField.fill('Survives resize');

      const initialTime = await page.getByTestId('playback-current-time').textContent();
      const initialMarkers = await page.getByTestId('grand-total-markers').textContent();
      await page.getByTestId('wrapped-row-detail-0').click();

      await expect(page.getByTestId('waveform-detail-panel')).toBeVisible();
      await expect(page.getByTestId('waveform-detail-loop')).toBeVisible();
      await expect(page.getByTestId('wrapped-waveform')).toHaveCount(0);
      await expect(page.getByTestId('playback-current-time')).toHaveText(initialTime || '');
      await expect(page.getByTestId('grand-total-markers')).toHaveText(initialMarkers || '');

      const detailWaveform = page.getByTestId('waveform-container');
      const detailBox = await detailWaveform.boundingBox();
      expect(detailBox).not.toBeNull();
      if (!detailBox) return;
      await detailWaveform.click({ position: { x: detailBox.width / 2, y: detailBox.height / 2 } });
      await expect(page.getByTestId('playback-current-time')).toContainText('0:02');
      const detailTime = await page.getByTestId('playback-current-time').textContent();

      await page.getByTestId('waveform-detail-close').click();
      await expect(page.getByTestId('wrapped-waveform')).toBeVisible();
      await expect(page.getByTestId('wrapped-row-detail-0')).toBeVisible();
      await expect(page.getByTestId('playback-current-time')).toHaveText(detailTime || '');

      await page.setViewportSize({ width: 844, height: 390 });
      await page.getByTestId('wrapped-row-detail-0').click();
      const wideDetail = page.getByTestId('waveform-detail-panel');
      const wideWrapped = page.getByTestId('wrapped-waveform');
      await expect(wideDetail).toBeVisible();
      await expect(wideWrapped).toBeVisible();
      await expect(page.getByTestId('wrapped-row-gutter-1')).toContainText('0:08');
      await expect(page.getByTestId('grand-total-markers')).toHaveText(initialMarkers || '');
      const resizedIndicator = page.locator('[data-testid^="wrapped-row-annotation-vocals-"]');
      await expect(resizedIndicator).toHaveCount(1);

      const wrappedBox = await wideWrapped.boundingBox();
      const wideDetailBox = await wideDetail.boundingBox();
      expect(wrappedBox).not.toBeNull();
      expect(wideDetailBox).not.toBeNull();
      if (!wrappedBox || !wideDetailBox) return;
      expect(wrappedBox.x + wrappedBox.width).toBeLessThanOrEqual(wideDetailBox.x);
      expect(wrappedBox.width).toBeGreaterThan(200);
      expect(wideDetailBox.width).toBeGreaterThan(200);
      await expect.poll(() => page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      )).toBe(true);

      await page.getByTestId('waveform-detail-close').click();
      await resizedIndicator.scrollIntoViewIfNeeded();
      await resizedIndicator.click();
      await expect(annotationField).toHaveValue('Survives resize');
      await expect(page.getByText('Something went wrong')).toHaveCount(0);
    });
  });
});
