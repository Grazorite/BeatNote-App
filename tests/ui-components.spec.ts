import { test, expect, loadSyntheticClickAudio, loadTestAudio, prepareFilePicker } from './setup';
import path from 'node:path';

test.describe('UI Components & Layout', () => {
  test('V1 settings expose timing guidance and support in a full mobile page', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    await expect(page.getByTestId('sidebar-toggle')).toHaveCount(0);
    await expect(page.getByTestId('settings-help')).toHaveCount(0);
    await expect(page.getByTestId('song-title-control')).toHaveAttribute(
      'aria-label',
      'Music library, no song chosen',
    );
    await expect(page.getByTestId('load-project')).toHaveAttribute('aria-label', 'Open Projects');
    const assertToolbarOrder = async () => {
      const positions = await page.evaluate(() => [
        'song-title-control',
        'save-project',
        'load-project',
        'sidebar-open-toggle',
      ].map(id => document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect().x ?? -1));
      expect(positions.every(position => position >= 0)).toBe(true);
      for (let index = 1; index < positions.length; index += 1) {
        expect(positions[index - 1]).toBeLessThan(positions[index]);
      }
    };
    await assertToolbarOrder();
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
    await expect(page.getByTestId('settings-bpm')).toBeVisible();
    await expect(page.getByText('Project BPM', { exact: true })).toBeVisible();
    await expect(page.getByTestId('settings-dance-counts')).toBeVisible();
    await expect(page.getByTestId('dance-counts-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-count-size')).toBeVisible();
    await expect(page.getByText('Annotation lane', { exact: true })).toBeVisible();
    await expect(page.getByTestId('settings-layer-name-vocals')).toHaveValue('Annotations');
    await expect(page.getByTestId('settings-layer-name-vocals'))
      .toHaveAttribute('aria-label', 'Annotation lane name');
    await expect(page.getByTestId('settings-layer-name-drums')).toHaveCount(0);
    await expect(page.getByText('Layer names', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('count-size-8')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('count-size-6').click();
    await expect(page.getByTestId('count-size-6')).toHaveAttribute('aria-checked', 'true');
    await expect.poll(async () => {
      const box = await page.getByTestId('settings-page').boundingBox();
      return box && [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
    }).toEqual([0, 0, 393, 852]);

    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
    await page.setViewportSize({ width: 740, height: 390 });
    await assertToolbarOrder();
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
    await loadTestAudio(page);
    await loadTestAudio(page, 'background-audio.wav', 'test-audio.wav');
    await loadTestAudio(page, 'long-test-track.wav', 'test-audio.wav');

    const title = page.getByTestId('song-title-control');
    const nextTrack = page.getByTestId('next-track-control');
    const previousTrack = page.getByTestId('previous-track-control');
    const firstTrack = page.getByTestId('first-track-control');
    await expect(title).toContainText('long-test-track');

    await nextTrack.click();
    await expect(title).toContainText('background-audio');

    const seekArea = page.getByTestId('wrapped-row-gesture-area-9');
    const seekBox = await seekArea.boundingBox();
    expect(seekBox).not.toBeNull();
    if (seekBox) {
      await seekArea.click({ position: { x: seekBox.width * 0.8, y: 12 } });
    }
    await expect(page.getByTestId('playback-current-time')).toHaveText(/^Current: 0:0[3-9]$/);
    await previousTrack.click();
    await expect(title).toContainText('background-audio');
    await expect(page.getByTestId('playback-current-time')).toHaveText('Current: 0:00');
    await previousTrack.click();
    await expect(title).toContainText('long-test-track');

    await nextTrack.click();
    await expect(title).toContainText('background-audio');
    await nextTrack.click();
    await expect(title).toContainText('test-audio');
    await expect(nextTrack).toBeDisabled();
    await expect(nextTrack).toHaveAccessibleName('Next track, End of queue');
    await firstTrack.click();
    await expect(title).toContainText('long-test-track');

    const shuffle = page.getByTestId('shuffle-control');
    await shuffle.click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('dock-toast')).toHaveText('Shuffle on');
    await shuffle.click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('dock-toast')).toHaveText('Shuffle off');

    await nextTrack.click();
    await nextTrack.click();
    await expect(title).toContainText('test-audio', { timeout: 10000 });

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

    await expect(page.getByTestId('shuffle-control')).toBeEnabled();
    await expect(page.getByTestId('shuffle-control')).toHaveAttribute('aria-pressed', 'false');
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
    const decrementSpeed = page.getByTestId('playback-speed-decrement');
    const incrementSpeed = page.getByTestId('playback-speed-increment');
    await expect(decrementSpeed).toBeEnabled();
    await expect(incrementSpeed).toBeEnabled();
    await decrementSpeed.click();
    await expect(page.getByTestId('playback-speed')).toContainText('0.95×');
    await incrementSpeed.click();
    await expect(page.getByTestId('playback-speed')).toContainText('1×');
    await page.getByRole('button', { name: 'Select 0.5× playback speed' }).click();
    await expect(decrementSpeed).toBeDisabled();
    const minimumThumbBox = await page.getByTestId('playback-speed-slider-thumb').boundingBox();
    const decrementBox = await decrementSpeed.boundingBox();
    expect(minimumThumbBox).not.toBeNull();
    expect(decrementBox).not.toBeNull();
    if (minimumThumbBox && decrementBox) {
      expect(minimumThumbBox.x - (decrementBox.x + decrementBox.width)).toBeGreaterThanOrEqual(4);
    }
    await expect(page.getByTestId('playback-speed-chooser')).toHaveCount(0, { timeout: 1000 });
    await page.getByTestId('playback-speed').click();
    await page.getByRole('button', { name: 'Select 2× playback speed' }).click();
    await expect(incrementSpeed).toBeDisabled();
    const maximumThumbBox = await page.getByTestId('playback-speed-slider-thumb').boundingBox();
    const incrementBox = await incrementSpeed.boundingBox();
    expect(maximumThumbBox).not.toBeNull();
    expect(incrementBox).not.toBeNull();
    if (maximumThumbBox && incrementBox) {
      expect(incrementBox.x - (maximumThumbBox.x + maximumThumbBox.width)).toBeGreaterThanOrEqual(4);
    }
    await expect(page.getByTestId('playback-speed-chooser')).toHaveCount(0, { timeout: 1000 });
    await page.getByTestId('playback-speed').click();
    await page.getByRole('button', { name: 'Select 0.75× playback speed' }).click();
    await expect(page.getByTestId('playback-speed')).toContainText('0.75×');
    await expect(page.getByTestId('dock-toast')).toHaveCount(0);
    await expect.poll(async () => page.evaluate(() => (
      window as typeof window & {
        __beatNoteAudioSettings?: { rate?: number; preservesPitch?: boolean };
      }
    ).__beatNoteAudioSettings)).toEqual({ rate: 0.75, preservesPitch: true });
    const speedButton = page.getByTestId('playback-speed');
    const speedChooser = page.getByTestId('playback-speed-chooser');
    await page.waitForTimeout(360);
    await speedButton.click({ force: true });
    await expect(speedChooser).toBeVisible();
    await expect.poll(async () => speedChooser.evaluate(element => (
      Number.parseFloat(window.getComputedStyle(element).opacity)
    ))).toBeGreaterThan(0.9);
    await page.waitForTimeout(500);
    await expect(speedChooser).toBeVisible();
    const chooserIsAbovePlay = await page.evaluate(() => {
      const chooser = document.querySelector('[data-testid="playback-speed-chooser"]');
      const play = document.querySelector('[data-testid="play-pause"]');
      if (!chooser || !play) return false;
      const chooserBox = chooser.getBoundingClientRect();
      const playBox = play.getBoundingClientRect();
      const left = Math.max(chooserBox.left, playBox.left);
      const right = Math.min(chooserBox.right, playBox.right);
      const top = Math.max(chooserBox.top, playBox.top);
      const bottom = Math.min(chooserBox.bottom, playBox.bottom);
      if (left >= right || top >= bottom) return false;
      const topElement = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
      return Boolean(topElement?.closest('[data-testid="playback-speed-chooser"]'));
    });
    expect(chooserIsAbovePlay).toBe(true);
    await speedButton.click();
    await expect(speedChooser).toBeVisible();
    await expect(speedChooser).toHaveCount(0, { timeout: 1000 });
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

    const waveformContainer = page.getByTestId('waveform-container');
    await expect(page.locator('[data-testid^="wrapped-row-peaks-"]').first()).toBeVisible();
    await waveformContainer.evaluate(element => element.setAttribute('data-rotation-identity', 'retained'));
    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(waveformContainer).toHaveAttribute('data-rotation-identity', 'retained');
    await expect(page.locator('[data-testid^="wrapped-row-peaks-"]').first()).toBeVisible();
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
      const title = box('song-title-control');
      const settings = box('sidebar-open-toggle');
      const waveform = box('waveform-container');
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
        title: title ? { left: title.left } : null,
        settings: settings ? { right: settings.right } : null,
        waveform: waveform ? { left: waveform.left } : null,
        ordinaryHeights: [previousMarker?.height, nextMarker?.height, addMarker?.height, removePrevious?.height,
          innerLoop?.height, annotation?.height, repeat?.height, speed?.height, firstTrack?.height,
          shuffle?.height, previousTrack?.height, nextTrack?.height],
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
    landscape.ordinaryHeights.forEach(height => {
      expect(Math.abs((height ?? 0) - (landscape.ordinary?.height ?? 0))).toBeLessThanOrEqual(1);
    });
    expect((landscape.rail?.bottom ?? 0) - (landscape.lastControlBottom ?? 0)).toBeGreaterThanOrEqual(4);
    expect((landscape.rail?.bottom ?? 0) - (landscape.lastControlBottom ?? 0)).toBeLessThanOrEqual(8);
    expect(landscape.overview?.right).toBeLessThanOrEqual((landscape.rail?.left ?? 0) + 1);
    expect(390 - (landscape.overview?.bottom ?? 390)).toBeGreaterThanOrEqual(18);
    expect(landscape.annotation?.left).toBeGreaterThanOrEqual((landscape.rail?.left ?? 0) - 1);
    expect(Math.abs((landscape.glass?.width ?? 0) - (landscape.rail?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((landscape.title?.left ?? 0) - (landscape.waveform?.left ?? 0))).toBeLessThanOrEqual(4);
    expect(Math.abs((landscape.settings?.right ?? 0) - (landscape.rail?.right ?? 0))).toBeLessThanOrEqual(2);

    await page.setViewportSize({ width: 393, height: 852 });
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
    const portraitGlass = await page.getByTestId('control-dock-glass').boundingBox();
    const portraitDock = await page.getByTestId('portrait-control-dock').boundingBox();
    expect(portraitGlass?.width).toBeCloseTo(portraitDock?.width ?? 0, 0);
    const portraitTitle = await page.getByTestId('song-title-control').boundingBox();
    const portraitWaveform = await page.getByTestId('waveform-container').boundingBox();
    expect(Math.abs((portraitTitle?.x ?? 0) - (portraitWaveform?.x ?? 0))).toBeLessThanOrEqual(4);

    await expect(page.getByTestId('previous-track-icon').locator('path')).toHaveCount(2);
    await expect(page.getByTestId('next-track-icon').locator('path')).toHaveCount(2);
  });

  test('annotation suggestions append cues without replacing free-form editing', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadTestAudio(page);
    await page.getByTestId('add-marker').click();
    await page.getByTestId('annotation-control').click();

    await expect(page.getByTestId('annotation-suggestions')).toBeVisible();
    await expect(page.locator('[data-testid^="annotation-suggestion-"]')).toHaveCount(7);
    await page.getByTestId('annotation-suggestion-turn').click();
    await page.getByTestId('annotation-suggestion-accent').click();
    await expect(page.getByTestId('annotation-editor-input')).toHaveValue('Turn · Accent');

    await page.getByTestId('annotation-editor-input').fill('Turn left into diagonal');
    await page.getByTestId('save-annotation').click();
    await expect(page.getByTestId('annotation-editor')).toHaveCount(0);
    await page.getByTestId('annotation-control').click();
    await expect(page.getByTestId('annotation-editor-input')).toHaveValue('Turn left into diagonal');
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

    await loadSyntheticClickAudio(page);
    await expect(page.getByTestId('dance-count-display')).toHaveCount(0);
    await expect(page.getByTestId('wrapped-row-gutter-0-count')).toHaveCount(0);
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('bpm-suggestion-card')).toContainText(/Suggested: \d+(?:\.\d+)? BPM/, {
      timeout: 15000,
    });
    const suggestedBpmText = await page.getByTestId('bpm-suggestion-card').textContent();
    const suggestedBpm = Number(suggestedBpmText?.match(/Suggested: (\d+(?:\.\d+)?) BPM/)?.[1]);
    expect(Math.abs(suggestedBpm - 120)).toBeLessThanOrEqual(0.5);
    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByRole('button', { name: 'Apply Preview' })).toBeVisible();
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('wrapped-row-detail-0').click();
    await expect(page.getByTestId('grid-preview-overlay')).toBeVisible();
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByRole('button', { name: 'Apply Preview' }).click();
    await expect(page.getByRole('button', { name: 'Restore Previous' })).toBeVisible();
    await page.getByRole('button', { name: 'Restore Previous' }).click();
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('waveform-detail-close').click();
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('beat-anchor-control')).toBeVisible();
    await expect(page.getByTestId('beat-anchor-value')).toHaveText('0.000s');
    await page.getByTestId('set-count-one-here').click();
    await page.getByTestId('beat-anchor-later-5').click();
    await expect(page.getByTestId('beat-anchor-value')).toHaveText('0.005s');
    await page.getByTestId('beat-anchor-earlier-5').click();
    await expect(page.getByTestId('beat-anchor-value')).toHaveText('0.000s');
    await page.getByTestId('beat-anchor-later-quarter').click();
    await expect(page.getByTestId('beat-anchor-value')).toHaveText('0.125s');
    await page.getByTestId('beat-anchor-earlier-quarter').click();
    await expect(page.getByTestId('beat-anchor-value')).toHaveText('0.000s');
    await expect(page.getByTestId('dance-counts-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('dance-counts-toggle').click();
    await expect(page.getByTestId('dance-counts-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('dance-count-display')).toHaveText('Phrase 1 | Count 1');
    await expect(page.getByTestId('wrapped-row-gutter-0-count')).toHaveText('1');
    await page.waitForTimeout(800);
    await page.reload();
    await expect(page.getByTestId('song-title-control')).toContainText('test-audio');
    await expect(page.getByTestId('dance-count-display')).toHaveText('Phrase 1 | Count 1');
    const songTitleControl = page.getByTestId('song-title-control');
    await songTitleControl.click();
    await expect(page.getByTestId('music-library-sheet-title')).toBeFocused();
    await expect(page.getByRole('button', { name: 'Import Audio' }).locator('path').last())
      .toHaveAttribute('d', /^M19 13h-7/);
    await page.keyboard.press('Tab');
    await expect.poll(() => page.evaluate(() => (
      document.querySelector('[data-testid="music-library-sheet"]')?.contains(document.activeElement)
    ))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(songTitleControl).toBeFocused();
    await songTitleControl.click();
    const restoredLibraryRow = page.getByRole('button', { name: /^test-audio,/ });
    await expect(restoredLibraryRow).toBeVisible();
    await expect(restoredLibraryRow).not.toContainText('Audio missing');
    const restoredRowOverflow = page.locator('[data-testid^="music-library-row-overflow-"]').first();
    await restoredRowOverflow.click();
    await page.locator('[data-testid^="music-library-row-rename-"]').click();
    await page.getByTestId('rename-music-title').fill('Renamed test audio');
    await page.getByTestId('rename-music-save').click();
    await expect(page.getByTestId('rename-music-prompt')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Renamed test audio,/ })).toBeVisible();
    await restoredRowOverflow.click();
    await page.locator('[data-testid^="music-library-row-rename-"]').click();
    await page.getByTestId('rename-music-title').fill('test-audio');
    await page.getByTestId('rename-music-save').click();
    await expect(page.getByRole('button', { name: /^test-audio,/ })).toBeVisible();
    await restoredLibraryRow.click();
    await page.getByTestId('sidebar-open-toggle').click();
    const layerNameInput = page.getByTestId('settings-layer-name-vocals');
    await expect(layerNameInput).toHaveValue('Annotations');
    await expect(page.getByTestId('settings-layer-name-drums')).toHaveCount(0);
    await layerNameInput.fill('Lead movement');
    await layerNameInput.press('Enter');
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('save-project').click();
    await expect(page.getByTestId('save-project-modal-glass')).toBeVisible();
    const projectName = page.getByTestId('save-project-name');
    await expect(projectName).not.toHaveValue('');
    await projectName.fill('');
    await expect(page.getByText('Project name is required', { exact: true })).toBeVisible();
    await expect(page.getByTestId('confirm-save-project')).toHaveAttribute('aria-disabled', 'true');
    await projectName.fill('A'.repeat(101));
    await expect(page.getByText('Project name must be 100 characters or fewer', { exact: true }))
      .toBeVisible();
    await expect(page.getByTestId('confirm-save-project')).toHaveAttribute('aria-disabled', 'true');
    await projectName.fill('Glass Surface Project');
    await expect(page.getByTestId('confirm-save-project')).not.toHaveAttribute('aria-disabled', 'true');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Saved “Glass Surface Project”');

    await page.getByTestId('load-project').click();
    for (const [testId, label] of [
      ['current-project-save', 'Save'],
      ['current-project-save-as-new', 'Save as New Project'],
      ['current-project-import-csv', 'Import CSV'],
      ['current-project-export-csv', 'Export CSV'],
    ] as const) {
      const action = page.getByTestId(testId);
      await expect(action.locator('svg')).toHaveCount(0);
      const actionBounds = await action.boundingBox();
      const labelBounds = await action.getByText(label, { exact: true }).boundingBox();
      expect(labelBounds?.x).toBeGreaterThanOrEqual(actionBounds?.x ?? 0);
      expect((labelBounds?.x ?? 0) + (labelBounds?.width ?? 0))
        .toBeLessThanOrEqual((actionBounds?.x ?? 0) + (actionBounds?.width ?? 0));
    }
    await page.getByTestId('current-project-save-as-new').click();
    await page.getByTestId('save-project-name').fill('Glass Surface Project 2');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.getByTestId('dock-toast')).toHaveText('Saved “Glass Surface Project 2”');

    await loadTestAudio(page, 'second-song.wav', 'test-audio.wav');
    await page.getByTestId('song-title-control').click();
    await page.getByRole('button', { name: /^test-audio,/ }).click();
    await expect(page.getByTestId('song-title-control')).toContainText('test-audio');
    await page.getByTestId('load-project').click();
    await expect(page.getByTestId('current-project-name')).toHaveText('Glass Surface Project 2');
    await page.getByText('Close', { exact: true }).click();
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('settings-layer-name-vocals')).toHaveValue('Lead movement');
    await page.getByTestId('sidebar-toggle').click();

    await page.getByTestId('wrapped-row-gesture-area-9').click({ position: { x: 50, y: 12 } });
    await page.getByTestId('add-marker').click();
    await page.getByTestId('song-title-control').click();
    await page.getByRole('button', { name: /^second-song,/ }).click();
    await expect(page.getByTestId('switch-guard-dialog')).toBeVisible();
    await page.getByTestId('switch-keep-draft').click();
    await expect(page.getByTestId('song-title-control')).toContainText('second-song');
    await page.getByTestId('song-title-control').click();
    await page.getByRole('button', { name: /^test-audio,/ }).click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);

    await page.getByTestId('load-project').click();
    await page.getByTestId('current-project-import-csv').click();
    const csvInput = page.locator('input[type="file"]').last();
    await expect(csvInput).toHaveAttribute('accept', /text\/csv/);
    await csvInput.setInputFiles({
      name: 'replace.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from([
        'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Annotation',
        'Vocals,250,0.250,1:1,"Entrance"',
      ].join('\n')),
    });
    await expect(page.getByTestId('csv-replace-confirm-glass')).toBeVisible();
    await expect(page.getByText(/Replace markers in/)).toBeVisible();
    await expect(page.getByTestId('csv-imported-counts')).toContainText('1 marker');
    await expect(page.getByTestId('csv-skipped-count')).toContainText('Skipped: 0 rows');
    await page.getByTestId('csv-replace-apply').click();
    await expect(page.getByTestId('dock-toast')).toContainText('CSV imported');
    await expect(page.getByTestId('dock-toast-action')).toHaveText('Undo');
    await page.getByTestId('dock-toast-action').click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);

    await page.getByTestId('load-project').click();
    await page.getByTestId('current-project-export-csv').click();
    await expect(page.getByTestId('export-modal-glass')).toBeVisible();
    await expect(page.getByText('Export Project', { exact: true }).last()).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.getByText('Includes timestamps, bar:beat and phrase:count timing, and annotations', { exact: true }))
      .toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(page.getByTestId('export-pdf')).toBeVisible();
    await expect(page.getByTestId('pdf-option-includeTimeline')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('pdf-option-includeTimeline').click();
    await expect(page.getByTestId('pdf-option-includeTimeline')).toHaveAttribute('aria-checked', 'false');
    await page.getByText('Cancel', { exact: true }).last().click();
    await page.getByText('Close', { exact: true }).click();

    await page.addInitScript(() => {
      localStorage.clear();
      const layer = (id: string, name: string, color: string) => ({
        id,
        name,
        color,
        markers: [],
        annotations: [],
        isVisible: true,
      });
      localStorage.setItem('beatnote_projects', JSON.stringify({
        legacyMissing: {
          version: '1.0.0',
          metadata: {
            name: 'Legacy Missing Project',
            bpm: 120,
            duration: 5000,
            stemCount: 6,
            createdAt: '2026-01-01T00:00:00.000Z',
            modifiedAt: '2026-01-02T00:00:00.000Z',
          },
          audio: { uri: 'blob:expired-audio', filename: 'test-audio.wav' },
          layers: [
            layer('vocals', 'Vocals', '#ef4444'),
            layer('drums', 'Drums', '#f97316'),
            layer('bass', 'Bass', '#eab308'),
            layer('piano', 'Piano', '#22c55e'),
            layer('guitar', 'Guitar', '#3b82f6'),
            layer('other', 'Other', '#a855f7'),
          ],
          settings: {
            viewMode: 'unified',
            showGridLines: true,
            layerSpecificNavigation: false,
          },
        },
      }));
    });
    await page.reload();
    await prepareFilePicker(page);
    await page.getByTestId('load-project').click();
    const legacyRow = page.locator('[data-testid^="project-row-"]')
      .filter({ hasText: 'Legacy Missing Project' });
    await expect(legacyRow).toContainText('Audio missing');
    await legacyRow.getByRole('button', { name: /More actions for Legacy Missing Project/ }).click();
    await page.getByText('Relink', { exact: true }).click();
    const relinkInput = page.locator('input[type="file"]').last();
    await relinkInput.setInputFiles(path.resolve('tests/fixtures/test-audio.wav'));
    await expect(page.getByTestId('project-relink-confirm')).toBeVisible();
    await page.getByTestId('confirm-relink-use-file').click();
    await expect(legacyRow).not.toContainText('Audio missing');
  });

  test('loop overview creates, toggles, clears, restores, and never seeks on tap', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page);

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
    await expect(page.getByTestId('loop-overview-range-provisional')).toBeVisible();
    await expect(page.getByTestId(/^wrapped-row-loop-\d+$/)).toHaveCount(0);
    await page.mouse.up();

    await expect(page.getByTestId('loop-overview-range-provisional')).toHaveCount(0);
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
