import { test, expect, loadTestAudio } from './setup';

test.describe('UI Components & Layout', () => {
  test('phone workspace keeps all editor chrome fixed within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const closeSidebar = page.getByTestId('sidebar-toggle');
    if (await closeSidebar.isVisible()) await closeSidebar.click();
    await loadTestAudio(page, 'long-test-track.m4a');

    await expect(page.getByText('Annotation layers')).toHaveCount(0);
    await expect(page.getByTestId('row-density-preset-default')).toHaveCount(0);
    await expect(page.getByTestId('wrapped-follow-toggle')).toHaveCount(0);
    await expect(page.getByTestId('wrapped-row-gutter-0')).toHaveText('0:00');
    const fittedRows = page.locator('[data-testid^="wrapped-row-"][role="slider"]');
    expect(await fittedRows.count()).toBeGreaterThan(1);
    await expect(fittedRows.last()).toHaveAttribute('aria-label', /to 3:00$/);

    for (const testId of [
      'project-actions-scroll',
      'wrapped-waveform',
      'loop-overview',
      'play-pause',
      'add-marker',
      'marker-annotation',
    ]) {
      await expect(page.getByTestId(testId)).toBeVisible();
    }

    const geometry = await page.evaluate(() => {
      const actions = document.querySelector('[data-testid="project-actions-scroll"]');
      const waveform = document.querySelector('[data-testid="wrapped-waveform"]');
      const row = document.querySelector('[data-testid="wrapped-row-0"]');
      const gutter = document.querySelector('[data-testid="wrapped-row-gutter-0"]');
      return {
        pageFits: document.documentElement.scrollHeight <= window.innerHeight + 1,
        actionsFit: !!actions && actions.scrollWidth <= actions.clientWidth + 1,
        waveformFits: !!waveform && waveform.scrollHeight <= waveform.clientHeight + 1,
        waveformOverflow: waveform ? window.getComputedStyle(waveform).overflowY : '',
        rowHeight: row?.getBoundingClientRect().height ?? 0,
        gutterWidth: gutter?.getBoundingClientRect().width ?? 0,
        gutterHeight: gutter?.getBoundingClientRect().height ?? 0,
        gutterJustify: gutter ? window.getComputedStyle(gutter).justifyContent : '',
      };
    });
    expect(geometry.pageFits).toBe(true);
    expect(geometry.actionsFit).toBe(true);
    expect(geometry.waveformFits).toBe(true);
    expect(geometry.waveformOverflow).toBe('hidden');
    expect(geometry.rowHeight).toBeLessThanOrEqual(56);
    expect(geometry.gutterWidth).toBeLessThanOrEqual(52);
    expect(geometry.gutterHeight).toBe(geometry.rowHeight);
    expect(geometry.gutterJustify).toBe('center');

    await page.getByTestId('add-marker').click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);
  });

  test('loop overview creates, toggles, clears, restores, and never seeks on tap', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page, 'long-test-track.m4a');

    const overview = page.getByTestId('loop-overview');
    await expect(overview).toBeVisible();
    await expect(page.getByText('Show Loop Overview', { exact: true })).toBeVisible();
    const currentTime = page.getByTestId('playback-current-time');
    const beforeTap = await currentTime.textContent();
    const trackRegion = page.getByTestId('loop-overview-track-region');
    const box = await trackRegion.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await overview.click({ position: { x: box.width * 0.7, y: box.height / 2 } });
    await expect(currentTime).toHaveText(beforeTap || '');
    await expect(page.getByTestId('loop-overview-range')).toHaveCount(0);

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();

    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
    await expect(page.getByTestId('loop-overview-handle-start')).toBeVisible();
    await expect(page.getByTestId('loop-overview-handle-end')).toBeVisible();
    const startHandle = page.getByTestId('loop-overview-handle-start');
    const endHandle = page.getByTestId('loop-overview-handle-end');
    await expect(startHandle).toHaveAttribute('role', 'slider');
    await expect(endHandle).toHaveAttribute('role', 'slider');
    await expect(startHandle).toHaveAttribute('aria-valuetext', /^Loop start \d+:\d{2}\.\d$/);
    await expect(endHandle).toHaveAttribute('aria-valuetext', /^Loop end \d+:\d{2}\.\d$/);
    await expect(startHandle).toHaveCSS('cursor', 'ew-resize');
    expect(await startHandle.evaluate((start, end) => Boolean(
      start.compareDocumentPosition(end as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ), await endHandle.elementHandle())).toBe(true);
    await expect(page.getByTestId('loop-overview-summary')).toHaveAttribute(
      'aria-label',
      /^Loop \d+:\d{2}\.\d to \d+:\d{2}\.\d, \d+\.\d seconds$/,
    );
    await expect(page.getByRole('button', { name: 'Set loop start at playhead' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Set loop end at playhead' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Clear loop', exact: true })).toHaveCount(1);
    const trackBox = await page.getByTestId('loop-overview-track').boundingBox();
    const clearBox = await page.getByTestId('loop-overview-clear').boundingBox();
    expect(trackBox).not.toBeNull();
    expect(clearBox).not.toBeNull();
    if (trackBox && clearBox) {
      expect(clearBox.x).toBeGreaterThanOrEqual(trackBox.x + trackBox.width);
    }
    await expect(page.getByTestId('loop-region-toggle')).toBeEnabled();
    await expect(page.locator('[data-testid^="wrapped-row-loop-outside-"]')).toHaveCount(0);
    const startBeforeMove = await page.getByTestId('loop-overview-handle-start').boundingBox();
    const rangeBox = await page.getByTestId('loop-overview-range').boundingBox();
    expect(startBeforeMove).not.toBeNull();
    expect(rangeBox).not.toBeNull();
    if (!startBeforeMove || !rangeBox) return;
    await page.mouse.move(rangeBox.x + rangeBox.width / 2, rangeBox.y + rangeBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(rangeBox.x + rangeBox.width / 2 + box.width * 0.08, rangeBox.y + rangeBox.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => (await page.getByTestId('loop-overview-handle-start').boundingBox())?.x ?? 0)
      .toBeGreaterThan(startBeforeMove.x);

    const startBeforeResize = await page.getByTestId('loop-overview-handle-start').boundingBox();
    expect(startBeforeResize).not.toBeNull();
    if (!startBeforeResize) return;
    await page.mouse.move(startBeforeResize.x + startBeforeResize.width / 2, startBeforeResize.y + startBeforeResize.height / 2);
    await page.mouse.down();
    await page.mouse.move(startBeforeResize.x - box.width * 0.04, startBeforeResize.y + startBeforeResize.height / 2, { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => (await page.getByTestId('loop-overview-handle-start').boundingBox())?.x ?? Number.MAX_SAFE_INTEGER)
      .toBeLessThan(startBeforeResize.x);

    const startValueBeforeKey = Number(await startHandle.getAttribute('aria-valuenow'));
    await startHandle.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => Number(await startHandle.getAttribute('aria-valuenow')))
      .toBeGreaterThan(startValueBeforeKey);

    await page.keyboard.press('l');
    await expect(page.getByTestId('loop-region-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('loop-marker-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-testid^="wrapped-row-loop-outside-"]').first()).toBeVisible();
    await expect(page.getByTestId('loop-overview-range')).toHaveCSS(
      'background-color',
      'rgba(0, 212, 199, 0.24)',
    );
    await expect(page.getByTestId(/^wrapped-row-loop-\d+$/).first())
      .toHaveAttribute('fill', '#00d4c7');

    await page.keyboard.press('Shift+l');
    await expect(page.getByTestId('loop-marker-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('loop-region-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-testid^="wrapped-row-loop-outside-"]')).toHaveCount(0);

    await endHandle.focus();
    await page.keyboard.press('End');
    const endGripBox = await page.getByTestId('loop-overview-handle-visual-end').boundingBox();
    const finalTrackBox = await page.getByTestId('loop-overview-track').boundingBox();
    expect(endGripBox).not.toBeNull();
    expect(finalTrackBox).not.toBeNull();
    if (endGripBox && finalTrackBox) {
      expect(Math.abs(endGripBox.x + endGripBox.width / 2 - (finalTrackBox.x + finalTrackBox.width)))
        .toBeLessThanOrEqual(1);
    }

    await page.setViewportSize({ width: 375, height: 667 });
    const mobileSidebarToggle = page.getByTestId('sidebar-toggle');
    if (await mobileSidebarToggle.isVisible()) await mobileSidebarToggle.click();
    const lastRow = page.locator('[data-testid^="wrapped-row-gesture-area-"]').last();
    await expect(lastRow).toBeVisible();
    const lastRowBox = await lastRow.boundingBox();
    expect(lastRowBox).not.toBeNull();
    if (lastRowBox) {
      await lastRow.click({ position: { x: lastRowBox.width - 1, y: lastRowBox.height / 2 } });
      await expect.poll(async () => {
        const playheadBox = await page.getByTestId('loop-overview-playhead').boundingBox();
        const liveTrackBox = await page.getByTestId('loop-overview-track').boundingBox();
        if (!playheadBox || !liveTrackBox) return Number.POSITIVE_INFINITY;
        return Math.abs(
          playheadBox.x + playheadBox.width / 2 - (liveTrackBox.x + liveTrackBox.width - 1),
        );
      }).toBeLessThanOrEqual(1);
    }

    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('loop-overview-range')).toHaveCount(0);
    await expect(page.getByTestId('loop-overview-clear')).toHaveAttribute('aria-label', 'Restore');
    await expect(page.getByTestId('loop-overview-clear')).toBeFocused();
    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
  });
});
