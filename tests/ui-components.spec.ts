import path from 'node:path';
import { test, expect, loadSyntheticClickAudio, loadTestAudio, prepareFilePicker } from './setup';

test.describe('UI Components & Layout', () => {
  test('mobile Settings expose functional V1 controls and truthful placeholders', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.getByTestId('sidebar-open-toggle').click();

    await expect(page.getByTestId('settings-page')).toBeVisible();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('settings-display').click();
    await expect(page.getByTestId('waveform-visibility-toggle'))
      .toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-layer-name-vocals')).toHaveValue('Annotations');
    await page.getByTestId('display-settings-page-back').click();

    await page.getByTestId('settings-bpm-entry').click();
    await expect(page.getByTestId('bpm-settings-page')).toBeVisible();
    await expect(page.getByText('Project BPM', { exact: true })).toBeVisible();
    await expect(page.getByTestId('dance-counts-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('bpm-settings-page-back').click();

    await page.getByTestId('settings-playback').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('pause-headset-toggle')).toHaveAttribute('aria-checked', 'true');
    const continuousToggleBounds = await page.getByTestId('continuous-play-toggle').boundingBox();
    const continuousCaptionBounds = await page.getByTestId('continuous-play-detail').boundingBox();
    if (!continuousToggleBounds || !continuousCaptionBounds) {
      throw new Error('Continuous-play setting geometry is unavailable');
    }
    expect(continuousCaptionBounds.y - (continuousToggleBounds.y + continuousToggleBounds.height))
      .toBeLessThan(12);
    await page.getByTestId('continuous-play-toggle').click();
    await page.getByTestId('pause-headset-toggle').click();
    await page.getByTestId('keep-screen-on-whilePlaying').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('pause-headset-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('keep-screen-on-whilePlaying'))
      .toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('playback-settings-page-back').click();

    await page.getByTestId('settings-buttons').click();
    await expect(page.getByTestId('seek-behaviour-tapSeekHoldTrack'))
      .toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('seek-duration-value')).toHaveValue('5');
    await page.getByTestId('seek-duration-increment').click();
    await expect(page.getByTestId('seek-duration-value')).toHaveValue('5.5');
    await page.getByTestId('seek-duration-value').fill('7.5');
    await page.getByTestId('seek-duration-value').press('Enter');
    await expect(page.getByTestId('seek-duration-value')).toHaveValue('7.5');
    await page.getByTestId('seek-behaviour-tapTrackHoldSeek').click();
    await expect(page.getByTestId('seek-behaviour-tapTrackHoldSeek'))
      .toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('speed-range-extended').click();
    await page.getByTestId('speed-preset-count-12').click();
    await expect(page.getByTestId('speed-range-extended')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('speed-preset-count-12')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('button-settings-page-back').click();

    await page.getByTestId('settings-data').click();
    await expect(page.getByTestId('data-imported-audio-summary')).toContainText('0 songs');
    await page.getByTestId('clear-derived-caches').click();
    await expect(page.getByTestId('clear-derived-caches-confirm')).toContainText(
      'Imported audio, markers, manual timing, and saved projects will remain.',
    );
    await page.getByTestId('clear-derived-caches-confirm').getByText('Cancel', { exact: true }).click();
    await page.getByTestId('data-settings-page-back').click();

    await page.getByTestId('settings-pro').click();
    await expect(page.getByText('S$19.98 yearly', { exact: true })).toBeVisible();
    await expect(page.getByTestId('restore-purchases-placeholder')).toContainText('Unavailable');
    await page.getByTestId('pro-settings-page-back').click();

    await page.getByTestId('settings-about').click();
    await expect(page.getByText('Version 1.0.0 (13)', { exact: true })).toBeVisible();
    await expect(page.getByTestId('about-send-feedback')).toBeVisible();
    await page.getByTestId('about-settings-page-back').click();

    await page.getByTestId('settings-playback').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('keep-screen-on-whilePlaying'))
      .toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('playback-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);

    await page.setViewportSize({ width: 740, height: 390 });
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-help').click();
    await expect(page.getByText('Start on iPhone', { exact: true })).toBeVisible();
    await expect(page.getByText('Playback & Markers', { exact: true })).toBeVisible();
    const swipeFromLeadingEdge = async () => {
      const edge = await page.getByTestId('settings-edge-swipe').boundingBox();
      if (!edge) throw new Error('Settings edge-swipe target is unavailable');
      const startX = edge.x + Math.min(8, edge.width / 2);
      const y = edge.y + edge.height / 2;
      await page.mouse.move(startX, y);
      await page.mouse.down();
      await page.mouse.move(startX + 120, y, { steps: 6 });
      await page.mouse.up();
    };
    await swipeFromLeadingEdge();
    await expect(page.getByText('Start on iPhone', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('settings-title')).toBeVisible();
    await swipeFromLeadingEdge();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
  });
  test('Lite and Pro expose the intended feature gates', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadTestAudio(page);

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('debug-tier-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-bpm-entry')).toBeDisabled();
    await expect(page.getByTestId('settings-bpm-entry')).toContainText('Pro only');
    await page.getByTestId('settings-playback').click();
    await expect(page.getByTestId('continuous-play-toggle')).toBeDisabled();
    await expect(page.getByTestId('continuous-play-detail')).toHaveText('Pro only');
    await page.getByTestId('playback-settings-page-back').click();
    await page.getByTestId('settings-buttons').click();
    await expect(page.getByTestId('speed-range-focused')).toBeDisabled();
    await expect(page.getByTestId('speed-range-settings')).toContainText('Pro only');
    await page.getByTestId('button-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await page.getByTestId('playback-speed').click();
    await expect(page.getByTestId('playback-speed-preset-0.75')).toBeVisible();
    await expect(page.getByTestId('playback-speed-slider')).toHaveCount(0);
    await page.getByTestId('playback-speed-preset-0.75').click();
    await expect(page.getByTestId('lite-ad-space')).toBeVisible();

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('lite-ad-space')).toBeVisible();

    await page.setViewportSize({ width: 393, height: 852 });
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('debug-tier-toggle').click();
    await expect(page.getByTestId('settings-bpm-entry')).toBeEnabled();
    await page.getByTestId('settings-buttons').click();
    await page.getByTestId('speed-range-extended').click();
    await page.getByTestId('speed-preset-count-4').click();
    await page.getByTestId('button-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('playback-speed').click();
    await expect(page.getByTestId('playback-speed-slider')).toBeVisible();
    await expect(page.getByTestId('playback-speed-range-min')).toHaveText('0.25×');
    await expect(page.getByTestId('playback-speed-range-max')).toHaveText('4×');
    const longPress = async (testID: string) => {
      const bounds = await page.getByTestId(testID).boundingBox();
      if (!bounds) throw new Error(`${testID} is unavailable`);
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(500);
      await page.mouse.up();
    };
    await longPress('playback-speed-preset-0.25');
    await expect(page.getByTestId('speed-preset-editor')).toBeVisible();
    await page.getByTestId('speed-preset-input').fill('0.3');
    await page.getByTestId('speed-preset-save').click();
    await expect(page.getByTestId('playback-speed-preset-0.3')).toBeVisible();
    await longPress('playback-speed-preset-0.3');
    await page.getByTestId('speed-preset-use-default').click();
    await expect(page.getByTestId('playback-speed-preset-0.25')).toBeVisible();
    await expect(page.getByTestId('lite-ad-space')).toHaveCount(0);
  });
  test('phone controls keep core editing and queue state through rotation', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.evaluate(() => {
      const monitoredWindow = window as typeof window & {
        __beatNoteAudioSettings?: { rate?: number; preservesPitch?: boolean };
      };
      monitoredWindow.__beatNoteAudioSettings = {};
      const rateDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype,
        'playbackRate',
      );
      const pitchDescriptor = Object.getOwnPropertyDescriptor(
        HTMLMediaElement.prototype,
        'preservesPitch',
      );
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
    await expect(title).toContainText('long-test-track');
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
    await expect(page.getByTestId('control-dock-glass')).toHaveCount(0);

    await expect(nextTrack).toContainText('+5s');
    await nextTrack.click();
    await expect(title).toContainText('long-test-track');
    await expect(page.getByTestId('playback-current-time')).toHaveText('Current: 0:05');
    await page.getByTestId('previous-track-control').click();
    await expect(page.getByTestId('playback-current-time')).toHaveText('Current: 0:00');

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-buttons').click();
    await page.getByTestId('seek-behaviour-tapTrackHoldSeek').click();
    await page.getByTestId('button-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await expect(nextTrack).not.toContainText('+5s');

    await nextTrack.click();
    await expect(title).toContainText('background-audio');
    await nextTrack.click();
    await expect(title).toContainText('test-audio');
    await expect(nextTrack).toBeEnabled();
    await expect(nextTrack).toHaveAccessibleName('Next track, hold to seek forward 5 seconds');
    await page.getByTestId('first-track-control').click();
    await expect(title).toContainText('long-test-track');

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-buttons').click();
    await page.getByTestId('seek-behaviour-tapSeekHoldTrack').click();
    await page.getByTestId('seek-duration-increment').click();
    await page.getByTestId('button-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await expect(page.getByTestId('next-track-control')).toContainText('+5.5s');
    await page.getByTestId('next-track-control').click();
    await expect(title).toContainText('long-test-track');
    await expect(page.getByTestId('playback-current-time')).toHaveText('Current: 0:05');
    await page.getByTestId('previous-track-control').click();
    await expect(page.getByTestId('playback-current-time')).toHaveText('Current: 0:00');

    const shuffle = page.getByTestId('shuffle-control');
    await shuffle.click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'true');
    await shuffle.click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'false');

    await page.getByTestId('add-marker').click();
    await page.getByTestId('annotation-control').click();
    await page.getByTestId('annotation-editor-input').fill('Rotation cue');
    await page.getByTestId('save-annotation').click();
    await expect(page.getByTestId('annotation-callout')).toContainText('Rotation cue');

    await page.getByTestId('playback-speed').click();
    await page.getByRole('button', { name: 'Select 0.75× playback speed' }).click();
    await expect(page.getByTestId('playback-speed')).toContainText('0.75×');
    await expect.poll(async () => page.evaluate(() => (
      window as typeof window & {
        __beatNoteAudioSettings?: { rate?: number; preservesPitch?: boolean };
      }
    ).__beatNoteAudioSettings)).toEqual({ rate: 0.75, preservesPitch: true });

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('control-dock-glass')).toHaveCount(0);
    await expect(page.getByTestId('annotation-callout')).toContainText('Rotation cue');
    await expect(page.getByTestId('playback-speed')).toContainText('0.75×');
    await expect(page.getByTestId('play-pause')).toBeEnabled();

    await page.setViewportSize({ width: 393, height: 852 });
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
    await expect(page.getByTestId('annotation-callout')).toContainText('Rotation cue');
  });
  test('track completion repeats, stops in Lite, and honours Continuous Play in Pro', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.evaluate(() => {
      const monitoredWindow = window as typeof window & {
        __beatNoteActiveAudio?: HTMLMediaElement;
      };
      const descriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
      if (!descriptor?.get || !descriptor.set) return;
      Object.defineProperty(HTMLMediaElement.prototype, 'playbackRate', {
        configurable: true,
        get: descriptor.get,
        set(value: number) {
          monitoredWindow.__beatNoteActiveAudio = this as HTMLMediaElement;
          descriptor.set?.call(this, value);
        },
      });
    });

    await loadTestAudio(page);
    await loadTestAudio(page, 'background-audio.wav', 'test-audio.wav');
    await loadTestAudio(page, 'long-test-track.wav', 'test-audio.wav');

    const title = page.getByTestId('song-title-control');
    const repeat = page.getByTestId('repeat-toggle');
    const finishActiveTrack = async () => {
      await page.evaluate(async () => {
        const monitoredWindow = window as typeof window & {
          __beatNoteActiveAudio?: HTMLMediaElement;
        };
        const audio = monitoredWindow.__beatNoteActiveAudio;
        if (!(audio instanceof HTMLMediaElement) || !Number.isFinite(audio.duration)) {
          throw new Error('Active audio element is unavailable');
        }
        // Start outside the player's 100 ms end-of-track tolerance. The 5 s fixture can end on its
        // own while the test toggles controls; a restart inside the tolerance would then never
        // clear the completion guard, so the next completion would be ignored.
        audio.currentTime = Math.max(0, audio.duration - 0.5);
        await audio.play();
      });
    };

    await expect(title).toContainText('long-test-track');
    await repeat.click();
    await finishActiveTrack();
    await expect(title).toContainText('long-test-track');
    await expect.poll(async () => page.getByTestId('playback-current-time').textContent())
      .toMatch(/^Current: 0:0[0-2]$/);

    await repeat.click();
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('debug-tier-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
    await finishActiveTrack();
    await expect(page.getByTestId('play-pause')).toHaveAttribute('aria-label', 'Play playback');
    await expect(title).toContainText('long-test-track');

    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('debug-tier-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('settings-playback').click();
    await page.getByTestId('continuous-play-toggle').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('playback-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
    await finishActiveTrack();
    await expect(page.getByTestId('play-pause')).toHaveAttribute('aria-label', 'Play playback');
    await expect(title).toContainText('long-test-track');

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-playback').click();
    await page.getByTestId('continuous-play-toggle').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('playback-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await finishActiveTrack();
    await expect.poll(async () => title.textContent()).not.toContain('long-test-track');
    await expect(page.getByTestId('track-switch-transition')).toHaveCount(0, { timeout: 1000 });
  });

  test('library, project, BPM, and CSV workflows persist their core outcomes', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadSyntheticClickAudio(page);

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-bpm-entry').click();
    await expect(page.getByTestId('bpm-suggestion-card')).toContainText(
      /Suggested: (?:119|120)(?:\.\d+)? BPM/,
      { timeout: 15000 },
    );
    await page.getByRole('button', { name: 'Preview' }).click();
    await page.getByRole('button', { name: 'Apply Preview' }).click();
    await page.getByTestId('dance-counts-toggle').click();
    await page.getByTestId('bpm-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('dance-count-display')).toContainText('Count 1');

    await expect.poll(() => page.evaluate(() => Object.entries(localStorage)
      .filter(([key]) => key.startsWith('beatnote.draft.v1.'))
      .some(([, raw]) => {
        try {
          return JSON.parse(raw).content?.settings?.showDanceCounts === true;
        } catch {
          return false;
        }
      }))).toBe(true);
    await page.reload();
    await expect(page.getByTestId('song-title-control')).toContainText('test-audio');
    await expect(page.getByTestId('dance-count-display')).toContainText('Count 1');

    const songTitleControl = page.getByTestId('song-title-control');
    await songTitleControl.click();
    await expect(page.getByRole('button', { name: /^test-audio,/ })).toBeVisible();
    await page.getByTestId('music-library-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(songTitleControl).toBeFocused();

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-display').click();
    await page.getByTestId('settings-layer-name-vocals').fill('Lead movement');
    await page.getByTestId('settings-layer-name-vocals').press('Enter');
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await page.getByTestId('save-project').click();
    await page.getByTestId('save-project-name').fill('Core Project');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.locator('[data-testid="dock-toast"][aria-live="polite"]')).toHaveText('Saved “Core Project”');
    await page.getByTestId('load-project').click();
    await page.getByTestId('current-project-save-as-new').click();
    await page.getByTestId('save-project-name').fill('Core Project Copy');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.locator('[data-testid="dock-toast"][aria-live="polite"]')).toHaveText('Saved “Core Project Copy”');
    await expect(page.getByTestId('save-project-name')).toHaveCount(0);
    await page.getByTestId('load-project').click();
    await expect(page.getByTestId('current-project-name')).toHaveText('Core Project Copy');
    await page.getByTestId('current-project-rename').click();
    const renameInput = page.getByTestId('save-project-name');
    await expect(renameInput).toHaveValue('Core Project Copy');
    await page.waitForTimeout(350);
    await renameInput.click();
    await renameInput.fill('Renamed Current');
    await expect(page.getByTestId('save-project-name')).toHaveValue('Renamed Current');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.locator('[data-testid="dock-toast"][aria-live="polite"]')).toHaveText('Renamed project to “Renamed Current”');
    await expect(page.getByTestId('current-project-name')).toHaveText('Renamed Current');
    await page.getByTestId('projects-back').click();

    await loadTestAudio(page, 'second-song.wav', 'test-audio.wav');
    await songTitleControl.click();
    await page.getByTestId('music-library-sort-title').click();
    const ascendingTitles = await page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.textContent ?? ''));
    await page.getByTestId('music-library-sort-title').click();
    await expect.poll(async () => page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.textContent ?? '')))
      .toEqual([...ascendingTitles].reverse());
    await page.getByTestId('music-library-sort-title').click();
    await expect.poll(async () => page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.textContent ?? '')))
      .toEqual(ascendingTitles);
    await page.getByTestId('music-library-sort-custom').click();
    await expect(page.locator('[data-testid^="music-library-row-reorder-"]')).toHaveCount(2);
    const testAudioRow = page.locator('[data-testid^="music-library-row-"]')
      .filter({ has: page.locator('[data-testid^="music-library-row-overflow-"]') })
      .filter({ hasText: 'test-audio' });
    const handle = testAudioRow.locator('[data-testid^="music-library-row-reorder-"]');
    const handleBounds = await handle.boundingBox();
    if (!handleBounds) throw new Error('Custom-order handle is unavailable');
    const titlesBeforeDrag = await page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.textContent ?? ''));
    await page.mouse.move(
      handleBounds.x + handleBounds.width / 2,
      handleBounds.y + handleBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      handleBounds.x + handleBounds.width / 2,
      handleBounds.y - 72,
      { steps: 6 },
    );
    const titlesWhileHeld = await page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.textContent ?? ''));
    expect(titlesWhileHeld).toEqual(titlesBeforeDrag);
    await page.mouse.up();
    await expect.poll(async () => page.locator('[data-testid^="music-library-row-main-"]')
      .first().textContent()).toContain('test-audio');
    await page.getByRole('button', { name: /^test-audio,/ }).click();

    await page.getByTestId('load-project').click();
    await expect(page.getByTestId('current-project-name')).toHaveText('Renamed Current');
    await page.getByTestId('projects-back').click();
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-display').click();
    await expect(page.getByTestId('settings-layer-name-vocals')).toHaveValue('Lead movement');
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await page.getByTestId('add-marker').click();
    await songTitleControl.click();
    await page.getByRole('button', { name: /^second-song,/ }).click();
    await expect(page.getByTestId('switch-guard-dialog')).toBeVisible();
    await page.getByTestId('switch-keep-draft').click();
    await songTitleControl.click();
    await page.getByRole('button', { name: /^test-audio,/ }).click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);

    await page.getByTestId('load-project').click();
    await page.getByTestId('current-project-import-csv').click();
    await page.locator('input[type="file"]').last().setInputFiles({
      name: 'replace.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from([
        'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Annotation',
        'Vocals,250,0.250,1:1,"Entrance"',
      ].join('\n')),
    });
    await expect(page.getByTestId('csv-imported-counts')).toContainText('1 marker');
    await page.getByTestId('csv-replace-apply').click();
    const activeToast = page.locator('[data-testid="dock-toast"][aria-live="polite"]');
    await expect(activeToast).toContainText('CSV imported');
    await activeToast.getByTestId('dock-toast-action').click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);
    await page.getByTestId('load-project').click();
    await page.getByTestId('current-project-export-csv').click();
    await expect(page.getByText('Export Project', { exact: true }).last()).toBeVisible();
    await page.getByText('Cancel', { exact: true }).last().click();
    await page.getByTestId('projects-back').click();

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
    await legacyRow.getByRole('button', { name: /More actions/ }).click();
    await page.getByText('Relink', { exact: true }).click();
    await page.locator('input[type="file"]').last()
      .setInputFiles(path.resolve('tests/fixtures/test-audio.wav'));
    await page.getByTestId('confirm-relink-use-file').click();
    await expect(legacyRow).not.toContainText('Audio missing');
  });
  test('loop range creates, switches mode, clears, and restores', async ({ page }) => {
    await page.goto('/');
    await loadTestAudio(page);

    const currentTime = page.getByTestId('playback-current-time');
    const beforeTap = await currentTime.textContent();
    const trackRegion = page.getByTestId('loop-overview-track-region');
    const trackBounds = await trackRegion.boundingBox();
    if (!trackBounds) throw new Error('Loop overview track is unavailable');

    await trackRegion.click({
      position: { x: trackBounds.width * 0.7, y: trackBounds.height / 2 },
    });
    await expect(currentTime).toHaveText(beforeTap ?? '');
    await expect(page.getByTestId('loop-overview-range')).toHaveCount(0);

    await page.mouse.move(
      trackBounds.x + trackBounds.width * 0.2,
      trackBounds.y + trackBounds.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      trackBounds.x + trackBounds.width * 0.5,
      trackBounds.y + trackBounds.height / 2,
      { steps: 8 },
    );
    await page.mouse.up();
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();

    const startHandle = page.getByTestId('loop-overview-handle-start');
    const startBeforeKey = Number(await startHandle.getAttribute('aria-valuenow'));
    await startHandle.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => Number(await startHandle.getAttribute('aria-valuenow')))
      .toBeGreaterThan(startBeforeKey);

    await page.keyboard.press('l');
    await expect(page.getByTestId('loop-region-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('loop-overview-outside-start')).toBeVisible();

    await page.keyboard.press('Shift+l');
    await expect(page.getByTestId('loop-marker-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('loop-region-toggle')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('loop-overview-marker-loop')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('loop-overview-range')).toHaveCount(0);
    await expect(page.getByTestId('loop-overview-clear')).toHaveAttribute('aria-label', 'Restore');
    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
  });
});
