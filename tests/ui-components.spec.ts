import { test, expect, loadTestAudio } from './setup';

test.describe('UI Components & Layout', () => {
  test('V1 settings expose only help and BPM controls', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    await expect(page.getByTestId('sidebar-toggle')).toHaveCount(0);
    await expect(page.getByTestId('settings-help')).toHaveCount(0);
    await expect(page.getByTestId('load-song')).toHaveAttribute('aria-label', 'Choose Audio File');
    await expect(page.getByTestId('load-project')).toHaveAttribute('aria-label', 'Open Projects');
    await expect(page.getByTestId('import-data')).toHaveAttribute('aria-label', 'Import CSV');
    await expect(page.getByTestId('export-data')).toHaveAttribute('aria-label', 'Export CSV');
    const emptyWaveform = await page.getByTestId('waveform-container').boundingBox();
    const emptyMessage = await page.getByText('Load a song', { exact: true }).boundingBox();
    expect(emptyWaveform).not.toBeNull();
    expect(emptyMessage).not.toBeNull();
    if (emptyWaveform && emptyMessage) {
      const containerCenterX = emptyWaveform.x + emptyWaveform.width / 2;
      const containerCenterY = emptyWaveform.y + emptyWaveform.height / 2;
      const messageCenterX = emptyMessage.x + emptyMessage.width / 2;
      const messageCenterY = emptyMessage.y + emptyMessage.height / 2;
      expect(Math.abs(containerCenterX - messageCenterX)).toBeLessThan(2);
      expect(Math.abs(containerCenterY - messageCenterY)).toBeLessThan(2);
    }
    const unloadedAnnotation = page.getByTestId('marker-annotation');
    await expect(unloadedAnnotation).not.toBeEditable();
    expect(await unloadedAnnotation.getAttribute('placeholder')).toBeNull();
    const annotationBox = await unloadedAnnotation.boundingBox();
    const dockBox = await page.getByTestId('portrait-control-dock').boundingBox();
    expect(annotationBox).not.toBeNull();
    expect(dockBox).not.toBeNull();
    if (annotationBox && dockBox) {
      expect(dockBox.y - (annotationBox.y + annotationBox.height)).toBeGreaterThanOrEqual(8);
    }
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('settings-help')).toBeVisible();
    await expect(page.getByTestId('settings-bpm')).toBeVisible();
    await expect(page.getByText('Project BPM', { exact: true })).toBeVisible();

    for (const label of [
      'Canvas Options',
      'Ghost Playhead in Timeline',
      'Show Loop Overview',
      'Show Grid Lines',
      'Magnetic Snapping',
      'Marker Options',
      'Active Layer Only',
      'Show Annotations',
    ]) {
      await expect(page.getByText(label, { exact: true })).toHaveCount(0);
    }
  });

  test('phone dock consolidates controls, reflows in landscape, and shares overview feedback', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await expect(page.getByTestId('loop-overview')).toHaveCount(0);
    await loadTestAudio(page, 'long-test-track.m4a');

    await expect(page.getByTestId('control-dock')).toBeVisible();
    await expect(page.getByTestId('control-dock-glass')).toBeVisible();
    await expect(page.getByTestId('annotation-glass')).toBeVisible();
    await expect(page.getByTestId('loop-region-toggle')).toHaveCount(0);
    await expect(page.getByTestId('loop-marker-toggle')).toHaveCount(0);
    for (const id of [
      'navigate-left-marker', 'add-marker', 'navigate-right-marker', 'play-pause',
      'repeat-toggle', 'inner-loop-cycle', 'shuffle-control', 'first-track-control',
      'previous-track-control', 'next-track-control', 'playback-speed',
      'remove-last-marker', 'dock-empty-cell',
    ]) {
      await expect(page.getByTestId(id)).toBeVisible();
    }

    const ordinary = await page.getByTestId('add-marker').boundingBox();
    const dominant = await page.getByTestId('play-pause').boundingBox();
    expect(ordinary).not.toBeNull();
    expect(dominant).not.toBeNull();
    if (ordinary && dominant) {
      expect(ordinary.height).toBeGreaterThanOrEqual(44);
      expect(dominant.width).toBeGreaterThanOrEqual(ordinary.width * 1.9);
      expect(dominant.height).toBeGreaterThanOrEqual(ordinary.height * 1.9);
    }

    const innerLoop = page.getByTestId('inner-loop-cycle');
    await expect(innerLoop).toHaveAttribute('aria-valuetext', 'off');
    await expect(page.getByTestId('inner-loop-marker-icon')).toBeVisible();
    await innerLoop.click();
    await expect(innerLoop).toHaveAttribute('aria-valuetext', 'markers');
    await expect(page.getByTestId('inner-loop-marker-icon')).toBeVisible();
    await expect(page.getByTestId('dock-toast')).toHaveText('Loop between markers');
    await innerLoop.click();
    await expect(innerLoop).toHaveAttribute('aria-valuetext', 'range');
    await expect(page.getByTestId('loop-range-icon').first()).toBeVisible();
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
    await innerLoop.click();
    await expect(innerLoop).toHaveAttribute('aria-valuetext', 'off');
    await expect(page.getByTestId('inner-loop-marker-icon')).toBeVisible();

    await page.getByTestId('shuffle-control').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Shuffle is in development');
    await page.getByTestId('remove-last-marker').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('No previous marker to delete');
    await page.getByTestId('add-marker').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Marker added');
    await page.getByTestId('add-marker').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Marker removed');
    await page.getByTestId('repeat-toggle').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Repeat track on');
    await expect(page.getByTestId('repeat-track-icon').first()).toHaveAttribute('fill', 'none');
    await page.getByTestId('playback-speed').click();
    await page.getByRole('button', { name: 'Select 0.75× playback speed' }).click();
    await expect(page.getByTestId('playback-speed')).toContainText('0.75×');
    await expect(page.getByTestId('dock-toast')).toHaveText('0.75× selected; playback speed is coming soon');

    const toastBox = await page.getByTestId('dock-toast').boundingBox();
    const overviewBox = await page.getByTestId('loop-overview').boundingBox();
    expect(toastBox).not.toBeNull();
    expect(overviewBox).not.toBeNull();
    if (toastBox && overviewBox) expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(overviewBox.y + 1);

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('playback-speed')).toContainText('0.75×');
    await expect(page.getByTestId('repeat-toggle')).toHaveAttribute('aria-pressed', 'true');
    const landscape = await page.evaluate(() => {
      const box = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect();
      const previousMarker = box('navigate-left-marker');
      const nextMarker = box('navigate-right-marker');
      const addMarker = box('add-marker');
      const removePrevious = box('remove-last-marker');
      const firstTrack = box('first-track-control');
      const previousTrack = box('previous-track-control');
      const nextTrack = box('next-track-control');
      const repeat = box('repeat-toggle');
      const innerLoop = box('inner-loop-cycle');
      const speed = box('playback-speed');
      const shuffle = box('shuffle-control');
      const play = box('play-pause');
      const overview = box('loop-overview');
      const annotation = box('marker-annotation');
      const rail = box('landscape-control-rail');
      return {
        leftColumn: [previousMarker?.x, addMarker?.x, innerLoop?.x, repeat?.x, firstTrack?.x, previousTrack?.x],
        rightColumn: [nextMarker?.x, removePrevious?.x, speed?.x, shuffle?.x, nextTrack?.x],
        rows: [previousMarker?.y ?? 0, addMarker?.y ?? 0, innerLoop?.y ?? 0, play?.y ?? 0, repeat?.y ?? 0, firstTrack?.y ?? 0, previousTrack?.y ?? 0],
        ordinary: previousMarker ? { width: previousMarker.width, height: previousMarker.height } : null,
        play: play ? { left: play.left, right: play.right, width: play.width, height: play.height } : null,
        overview: overview ? { right: overview.right, bottom: overview.bottom } : null,
        annotation: annotation ? { y: annotation.y, bottom: annotation.bottom, left: annotation.left, right: annotation.right } : null,
        lastControlBottom: previousTrack?.bottom,
        rail: rail ? { top: rail.top, bottom: rail.bottom, left: rail.left, right: rail.right, width: rail.width } : null,
      };
    });
    expect(new Set(landscape.leftColumn).size).toBe(1);
    expect(new Set(landscape.rightColumn).size).toBe(1);
    for (let index = 1; index < landscape.rows.length; index += 1) {
      expect(landscape.rows[index - 1]).toBeLessThan(landscape.rows[index]);
    }
    expect(landscape.play?.width).toBeGreaterThanOrEqual((landscape.ordinary?.width ?? 0) * 1.9);
    expect(landscape.play?.height).toBeGreaterThanOrEqual((landscape.ordinary?.height ?? 0) * 1.9);
    expect(landscape.play?.left).toBeGreaterThanOrEqual((landscape.rail?.left ?? 0) - 1);
    expect(landscape.play?.right).toBeLessThanOrEqual((landscape.rail?.right ?? 0) + 1);
    expect(landscape.rail?.width).toBeLessThanOrEqual(110);
    expect(landscape.ordinary?.height).toBeGreaterThanOrEqual(38);
    expect((landscape.ordinary?.width ?? 0) / (landscape.ordinary?.height ?? 1)).toBeLessThanOrEqual(1.2);
    expect((landscape.rail?.bottom ?? 0) - (landscape.lastControlBottom ?? 0)).toBeLessThanOrEqual(2);
    expect(landscape.overview?.right).toBeLessThanOrEqual((landscape.rail?.left ?? 0) + 1);
    expect(landscape.annotation?.right).toBeLessThanOrEqual((landscape.rail?.left ?? 0) + 1);
    expect(landscape.annotation?.y).toBeGreaterThanOrEqual((landscape.overview?.bottom ?? 0) - 2);

    await expect(page.getByTestId('previous-track-icon').locator('path')).toHaveCount(2);
    await expect(page.getByTestId('next-track-icon').locator('path')).toHaveCount(2);
  });

  test('phone workspace keeps all editor chrome fixed within the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
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
    await expect(page.getByTestId('loop-overview-clear')).toBeVisible();
    await expect(page.getByTestId('loop-overview-clear')).toBeDisabled();
    await expect(page.getByTestId('loop-overview-clear')).toHaveAttribute('aria-label', 'Clear loop unavailable');
    await expect(page.getByText('Show Loop Overview', { exact: true })).toHaveCount(0);
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
    await expect(page.getByTestId('loop-overview-clear')).toBeEnabled();
    await expect(page.getByTestId('loop-overview-outside-start')).toHaveCount(0);
    await expect(page.getByTestId('loop-overview-outside-end')).toHaveCount(0);
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
      expect(clearBox.x - (trackBox.x + trackBox.width)).toBeLessThanOrEqual(1);
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
    await expect(page.getByTestId('loop-overview-outside-start')).toBeVisible();
    await expect(page.getByTestId('loop-overview-outside-end')).toBeVisible();
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
    const lastRow = page.locator('[data-testid^="wrapped-row-gesture-area-"]').last();
    await expect(lastRow).toBeVisible();
    await expect.poll(async () => (await lastRow.boundingBox()) !== null).toBe(true);
    const lastRowBox = await lastRow.boundingBox();
    expect(lastRowBox).not.toBeNull();
    if (lastRowBox) {
      await page.mouse.click(lastRowBox.x + lastRowBox.width - 2, lastRowBox.y + lastRowBox.height / 2);
      await expect.poll(async () => {
        const playheadBox = await page.getByTestId('loop-overview-playhead').boundingBox();
        const liveTrackBox = await page.getByTestId('loop-overview-track').boundingBox();
        if (!playheadBox || !liveTrackBox) return Number.POSITIVE_INFINITY;
        return Math.abs(
          playheadBox.x + playheadBox.width / 2 - (liveTrackBox.x + liveTrackBox.width - 2),
        );
      }).toBeLessThanOrEqual(1);
    }

    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Loop range cleared');
    await expect(page.getByTestId('loop-overview-range')).toHaveCount(0);
    await expect(page.getByTestId('loop-overview-clear')).toHaveAttribute('aria-label', 'Restore');
    await expect(page.getByTestId('loop-overview-clear')).toBeFocused();
    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Loop range restored');
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
  });
});
