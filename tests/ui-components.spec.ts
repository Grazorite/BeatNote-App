import { test, expect, loadTestAudio } from './setup';

test.describe('UI Components & Layout', () => {
  test('V1 settings open as a full mobile page with only relevant support content', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    await expect(page.getByTestId('sidebar-toggle')).toHaveCount(0);
    await expect(page.getByTestId('settings-help')).toHaveCount(0);
    await expect(page.getByTestId('load-song')).toHaveAttribute('aria-label', 'Choose Audio File');
    await expect(page.getByTestId('load-project')).toHaveAttribute('aria-label', 'Open Projects');
    await expect(page.getByTestId('import-data')).toHaveAttribute('aria-label', 'Import CSV');
    await expect(page.getByTestId('export-data')).toHaveAttribute('aria-label', 'Export CSV');
    const settingsButton = await page.getByTestId('sidebar-open-toggle').boundingBox();
    const exportButton = await page.getByTestId('export-data').boundingBox();
    expect(settingsButton).not.toBeNull();
    expect(exportButton).not.toBeNull();
    if (settingsButton && exportButton) {
      expect(settingsButton.x).toBeGreaterThan(exportButton.x);
    }
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
    await expect(page.getByTestId('marker-annotation')).toHaveCount(0);
    for (const id of [
      'navigate-left-marker', 'add-marker', 'navigate-right-marker', 'play-pause',
      'repeat-toggle', 'inner-loop-cycle', 'shuffle-control', 'first-track-control',
      'previous-track-control', 'next-track-control', 'playback-speed', 'remove-last-marker',
      'annotation-control',
    ]) {
      await expect(page.getByTestId(id)).toBeDisabled();
    }
    await expect(page.getByTestId('remove-last-marker').locator('svg path').first())
      .toHaveAttribute('fill', '#999999');
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('settings-glass')).toBeVisible();
    await expect(page.getByTestId('settings-help')).toBeVisible();
    await expect(page.getByTestId('sidebar-toggle').locator('svg')).toHaveCount(0);
    await expect(page.getByTestId('settings-bpm')).toHaveCount(0);
    await expect(page.getByText('Project BPM', { exact: true })).toHaveCount(0);
    await expect.poll(async () => {
      const box = await page.getByTestId('settings-page').boundingBox();
      return box && [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
    }).toEqual([0, 0, 393, 852]);

    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
    await page.setViewportSize({ width: 740, height: 390 });
    await page.getByTestId('sidebar-open-toggle').click();
    await expect.poll(async () => {
      const box = await page.getByTestId('settings-page').boundingBox();
      return box && [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
    }).toEqual([0, 0, 740, 390]);
    await page.getByTestId('settings-help').click();
    await expect(page.getByTestId('settings-page').getByTestId('help-page')).toBeVisible();
    await expect(page.getByText('Start a Session', { exact: true })).toBeVisible();
    await expect(page.getByText('Mobile Controls', { exact: true })).toBeVisible();
    await expect.poll(async () => {
      const box = await page.getByTestId('help-page').boundingBox();
      return box && [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
    }).toEqual([0, 0, 740, 390]);

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
    await page.evaluate(() => {
      const monitoredWindow = window as typeof window & {
        __beatNoteAudioSettings?: { rate?: number; preservesPitch?: boolean };
      };
      monitoredWindow.__beatNoteAudioSettings = {};
      const rateDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
      const pitchDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'preservesPitch');
      if (rateDescriptor?.get && rateDescriptor.set) {
        Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
          configurable: true,
          get: rateDescriptor.get,
          set(value: number) {
            monitoredWindow.__beatNoteAudioSettings = {
              ...monitoredWindow.__beatNoteAudioSettings,
              rate: value,
            };
            rateDescriptor.set?.call(this, value);
          },
        });
      }
      if (pitchDescriptor?.get && pitchDescriptor.set) {
        Object.defineProperty(HTMLMediaElement.prototype, 'preservesPitch', {
          configurable: true,
          get: pitchDescriptor.get,
          set(value: boolean) {
            monitoredWindow.__beatNoteAudioSettings = {
              ...monitoredWindow.__beatNoteAudioSettings,
              preservesPitch: value,
            };
            pitchDescriptor.set?.call(this, value);
          },
        });
      }
    });
    await loadTestAudio(page, 'long-test-track.m4a');

    await expect(page.getByTestId('control-dock')).toBeVisible();
    await expect(page.getByTestId('control-dock-glass')).toBeVisible();
    await expect(page.getByTestId('marker-annotation')).toHaveCount(0);
    await expect(page.getByTestId('loop-region-toggle')).toHaveCount(0);
    await expect(page.getByTestId('loop-marker-toggle')).toHaveCount(0);
    for (const id of [
      'navigate-left-marker', 'add-marker', 'navigate-right-marker', 'play-pause',
      'repeat-toggle', 'inner-loop-cycle', 'shuffle-control', 'first-track-control',
      'previous-track-control', 'next-track-control', 'playback-speed',
      'remove-last-marker', 'annotation-control',
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
    await expect(page.getByTestId('dock-toast-glass')).toBeVisible();
    await expect(page.getByTestId('dock-toast-glass').locator('rect').nth(1)).toHaveAttribute('stroke-opacity', '0.1');
    await innerLoop.click();
    await expect(innerLoop).toHaveAttribute('aria-valuetext', 'range');
    await expect(page.getByTestId('loop-range-icon').first()).toBeVisible();
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
    await innerLoop.click();
    await expect(innerLoop).toHaveAttribute('aria-valuetext', 'off');
    await expect(page.getByTestId('inner-loop-marker-icon')).toBeVisible();

    await page.getByTestId('shuffle-control').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Shuffle is in development');
    await expect(page.getByTestId('remove-last-marker')).toBeDisabled();
    await expect(page.getByTestId('add-marker').locator('svg path').first()).toHaveAttribute('fill', '#3a8f5b');
    await page.getByTestId('add-marker').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Marker added');
    await expect(page.getByTestId('add-marker').locator('svg path').first()).toHaveAttribute('fill', '#b54a45');
    await page.getByTestId('add-marker').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Marker removed');
    await expect(page.getByTestId('add-marker').locator('svg path').first()).toHaveAttribute('fill', '#3a8f5b');
    await page.getByTestId('repeat-toggle').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Repeat track on');
    await expect(page.getByTestId('repeat-track-icon').first()).toHaveAttribute('fill', 'none');
    await expect(page.getByTestId('dock-toast')).toHaveCount(0, { timeout: 2500 });
    await page.getByTestId('playback-speed').click();
    await expect(page.getByTestId('playback-speed-glass')).toBeVisible();
    await expect(page.getByTestId('playback-speed-slider')).toHaveAttribute('aria-valuemin', '0.5');
    await expect(page.getByTestId('playback-speed-slider')).toHaveAttribute('aria-valuemax', '2');
    await page.getByRole('button', { name: 'Select 0.75× playback speed' }).click();
    await expect(page.getByTestId('playback-speed')).toContainText('0.75×');
    await expect(page.getByTestId('dock-toast')).toHaveCount(0);
    await expect.poll(async () => page.evaluate(() => (
      window as typeof window & {
        __beatNoteAudioSettings?: { rate?: number; preservesPitch?: boolean };
      }
    ).__beatNoteAudioSettings)).toEqual({ rate: 0.75, preservesPitch: true });
    const speedButton = page.getByTestId('playback-speed');
    await expect(page.getByTestId('playback-speed-chooser')).toHaveCount(0, { timeout: 1000 });
    await speedButton.click();
    await expect(page.getByTestId('playback-speed-chooser')).toBeVisible();
    await speedButton.click();
    await expect(page.getByTestId('playback-speed-chooser')).toBeVisible();
    await expect(page.getByTestId('playback-speed-chooser')).toHaveCount(0, { timeout: 1000 });
    await speedButton.click();
    const speedSlider = page.getByTestId('playback-speed-slider');
    const speedSliderBox = await speedSlider.boundingBox();
    expect(speedSliderBox).not.toBeNull();
    if (speedSliderBox) {
      const sliderY = speedSliderBox.y + speedSliderBox.height / 2;
      await page.mouse.move(speedSliderBox.x + speedSliderBox.width * 0.1, sliderY);
      await page.mouse.down();
      await page.mouse.move(speedSliderBox.x + speedSliderBox.width * 0.5, sliderY, { steps: 4 });
      await expect(page.getByTestId('playback-speed')).toContainText('1.25×');
      await page.mouse.move(speedSliderBox.x + speedSliderBox.width * 0.8, sliderY, { steps: 4 });
      await page.mouse.up();
    }
    await expect(page.getByTestId('playback-speed')).toContainText('1.7×');
    await expect(page.getByTestId('dock-toast')).toHaveCount(0);
    await expect.poll(async () => page.evaluate(() => (
      window as typeof window & {
        __beatNoteAudioSettings?: { rate?: number; preservesPitch?: boolean };
      }
    ).__beatNoteAudioSettings)).toEqual({ rate: 1.7, preservesPitch: true });
    await expect(page.getByTestId('playback-speed-chooser')).toBeVisible();
    await page.waitForTimeout(760);
    const fadingSliderBox = await speedSlider.boundingBox();
    expect(fadingSliderBox).not.toBeNull();
    if (fadingSliderBox) {
      const fadingSliderY = fadingSliderBox.y + fadingSliderBox.height / 2;
      await page.mouse.move(fadingSliderBox.x + fadingSliderBox.width * 0.8, fadingSliderY);
      await page.mouse.down();
    }
    await page.waitForTimeout(150);
    const resumedSliderBox = await speedSlider.boundingBox();
    expect(resumedSliderBox).not.toBeNull();
    if (resumedSliderBox) {
      const sliderY = resumedSliderBox.y + resumedSliderBox.height / 2;
      await page.mouse.move(resumedSliderBox.x + resumedSliderBox.width * 0.7, sliderY);
      await page.mouse.up();
    }
    await expect(page.getByTestId('playback-speed')).toContainText('1.55×');
    await expect(page.getByTestId('playback-speed-chooser')).toHaveCount(0, { timeout: 2500 });

    const portraitOrder = await page.evaluate(() => {
      const x = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect().x ?? 0;
      return [x('annotation-control'), x('playback-speed'), x('remove-last-marker')];
    });
    expect(portraitOrder[0]).toBeLessThan(portraitOrder[1]);
    expect(portraitOrder[1]).toBeLessThan(portraitOrder[2]);

    await page.getByTestId('add-marker').click();
    await page.getByTestId('navigate-right-marker').click();
    await page.getByTestId('remove-last-marker').click();
    await expect(page.getByTestId('dock-toast')).toContainText('Previous marker deleted');
    await expect(page.getByTestId('dock-toast-action')).toHaveText('Undo');
    await page.getByTestId('dock-toast-action').click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);

    const toastBox = await page.getByTestId('dock-toast').boundingBox();
    const overviewBox = await page.getByTestId('loop-overview').boundingBox();
    expect(toastBox).not.toBeNull();
    expect(overviewBox).not.toBeNull();
    if (toastBox && overviewBox) expect(toastBox.y + toastBox.height).toBeLessThanOrEqual(overviewBox.y + 1);

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('control-dock-glass')).toBeVisible();
    await expect(page.getByTestId('playback-speed')).toContainText('1.55×');
    await page.getByTestId('playback-speed').click();
    const landscapeSpeedChooser = await page.getByTestId('playback-speed-chooser').boundingBox();
    expect(landscapeSpeedChooser).not.toBeNull();
    if (landscapeSpeedChooser) {
      expect(landscapeSpeedChooser.x).toBeGreaterThanOrEqual(0);
      expect(landscapeSpeedChooser.y).toBeGreaterThanOrEqual(0);
      expect(landscapeSpeedChooser.x + landscapeSpeedChooser.width).toBeLessThanOrEqual(740);
      expect(landscapeSpeedChooser.y + landscapeSpeedChooser.height).toBeLessThanOrEqual(390);
    }
    await page.getByTestId('playback-speed-reset').click();
    await expect(page.getByTestId('playback-speed')).toContainText('1×');
    await expect(page.getByTestId('dock-toast')).toHaveCount(0);
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
      const annotation = box('annotation-control');
      const speed = box('playback-speed');
      const shuffle = box('shuffle-control');
      const play = box('play-pause');
      const overview = box('loop-overview');
      const rail = box('landscape-control-rail');
      const glass = box('control-dock-glass');
      return {
        leftColumn: [previousMarker?.x, addMarker?.x, innerLoop?.x, repeat?.x, firstTrack?.x, previousTrack?.x],
        rightColumn: [nextMarker?.x, removePrevious?.x, annotation?.x, speed?.x, shuffle?.x, nextTrack?.x],
        rows: [previousMarker?.y ?? 0, addMarker?.y ?? 0, innerLoop?.y ?? 0, play?.y ?? 0, repeat?.y ?? 0, firstTrack?.y ?? 0, previousTrack?.y ?? 0],
        ordinary: previousMarker ? { width: previousMarker.width, height: previousMarker.height } : null,
        play: play ? { left: play.left, right: play.right, width: play.width, height: play.height } : null,
        overview: overview ? { right: overview.right, bottom: overview.bottom } : null,
        annotation: annotation ? { y: annotation.y, left: annotation.left, right: annotation.right } : null,
        lastControlBottom: previousTrack?.bottom,
        rail: rail ? { top: rail.top, bottom: rail.bottom, left: rail.left, right: rail.right, width: rail.width } : null,
        glass: glass ? { width: glass.width, height: glass.height } : null,
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
    expect(landscape.annotation?.left).toBeGreaterThanOrEqual((landscape.rail?.left ?? 0) - 1);
    expect(Math.abs((landscape.glass?.width ?? 0) - (landscape.rail?.width ?? 0))).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 393, height: 852 });
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
    const portraitGlass = await page.getByTestId('control-dock-glass').boundingBox();
    const portraitDock = await page.getByTestId('portrait-control-dock').boundingBox();
    expect(portraitGlass?.width).toBeCloseTo(portraitDock?.width ?? 0, 0);

    await expect(page.getByTestId('previous-track-icon').locator('path')).toHaveCount(2);
    await expect(page.getByTestId('next-track-icon').locator('path')).toHaveCount(2);
  });

  test('custom menus and submenus share the liquid-glass surface', async ({ page }) => {
    await page.setViewportSize({ width: 740, height: 390 });
    await page.goto('/');

    await page.getByTestId('load-project').click();
    await expect(page.getByTestId('projects-modal-glass')).toBeVisible();
    const projectHeader = await page.evaluate(() => {
      const title = Array.from(document.querySelectorAll('*')).find(node => node.textContent === 'Projects')?.getBoundingClientRect();
      const close = Array.from(document.querySelectorAll('*')).find(node => node.textContent === 'Close')?.getBoundingClientRect();
      return { titleLeft: title?.left ?? 0, closeRight: close?.right ?? 0 };
    });
    expect(projectHeader.titleLeft).toBeGreaterThanOrEqual(20);
    expect(740 - projectHeader.closeRight).toBeGreaterThanOrEqual(20);
    await page.getByText('Close', { exact: true }).click();

    await page.setViewportSize({ width: 393, height: 852 });
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('settings-glass')).toBeVisible();
    await page.getByTestId('settings-help').click();
    await expect(page.getByTestId('help-modal-glass')).toBeVisible();
    await page.getByTestId('help-close').click();
    await page.getByTestId('sidebar-toggle').click();

    await loadTestAudio(page, 'long-test-track.m4a');
    await page.getByTestId('save-project').click();
    await expect(page.getByTestId('save-project-modal-glass')).toBeVisible();
    await page.getByText('Cancel', { exact: true }).click();

    await page.getByTestId('import-data').click();
    await expect(page.getByTestId('import-modal-glass')).toBeVisible();
    await expect(page.getByText('Choose CSV', { exact: true })).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(page.getByText('Importing the same file again may create duplicate markers', { exact: true }))
      .toHaveCSS('color', 'rgb(0, 0, 0)');
    await page.getByText('Cancel', { exact: true }).last().click();

    await page.getByTestId('add-marker').click();
    await page.getByTestId('export-data').click();
    await expect(page.getByTestId('export-modal-glass')).toBeVisible();
    await expect(page.getByText('Export CSV', { exact: true }).last()).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(page.getByText('Includes timestamps, BPM-derived bar:beat timing, and annotations', { exact: true }))
      .toHaveCSS('color', 'rgb(0, 0, 0)');
    await page.getByText('Cancel', { exact: true }).last().click();
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
      expect(Math.abs(endGripBox.x + endGripBox.width - (finalTrackBox.x + finalTrackBox.width)))
        .toBeLessThanOrEqual(1);
      const rangeBox = await page.getByTestId('loop-overview-range').boundingBox();
      expect(rangeBox).not.toBeNull();
      if (rangeBox) {
        expect(Math.abs(rangeBox.x + rangeBox.width - (finalTrackBox.x + finalTrackBox.width)))
          .toBeLessThanOrEqual(1);
      }
    }

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
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
