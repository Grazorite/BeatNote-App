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
    const bpmInput = page.getByTestId('project-bpm-input');
    await bpmInput.fill('156');
    await bpmInput.press('Enter');
    await expect(bpmInput).toHaveValue('156');
    await page.getByRole('button', { name: 'Increase BPM by 10' }).click();
    await expect(bpmInput).toHaveValue('166');
    await page.getByRole('button', { name: 'Decrease BPM by 10' }).click();
    await expect(bpmInput).toHaveValue('156');
    await bpmInput.fill('0');
    await bpmInput.press('Enter');
    await expect(page.getByText('Enter a number from 40 to 220. Your project BPM is still 156.')).toBeVisible();
    await bpmInput.fill('156');
    await bpmInput.press('Enter');
    await expect(page.getByTestId('dance-counts-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('bpm-settings-page-back').click();
    await page.getByTestId('settings-bpm-entry').click();
    await expect(page.getByTestId('project-bpm-input')).toHaveValue('156');
    await page.getByTestId('bpm-settings-page-back').click();

    await page.getByTestId('settings-playback').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('radio', { name: 'Skip seconds' })).toBeChecked();
    await expect(page.getByRole('radio', { name: '10 seconds', exact: true })).toBeChecked();
    await expect(page.getByTestId('pause-headset-toggle')).toHaveAttribute('aria-checked', 'true');
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
    await page.getByTestId('speed-preset-count-12').click();
    await expect(page.getByTestId('speed-range-settings')).toHaveCount(0);
    await expect(page.getByTestId('speed-preset-count-12')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('button-settings-page-back').click();

    await page.getByTestId('settings-data').click();
    await expect(page.getByTestId('data-imported-audio-summary')).toContainText('0 songs');
    await page.getByTestId('clear-derived-caches').click();
    await expect(page.getByTestId('clear-derived-caches-confirm')).toContainText(
      'Your songs, markers, manual timing and projects are kept.',
    );
    await page.getByTestId('clear-derived-caches-confirm').getByText('Cancel', { exact: true }).click();
    await expect(page.getByTestId('delete-all-projects')).toBeDisabled();
    await expect(page.getByTestId('delete-all-imported-audio')).toBeDisabled();
    await expect(page.getByTestId('delete-all-imported-audio').locator('xpath=following::*[@data-testid="delete-all-beatnote-data"][1]'))
      .toHaveCount(1);
    await page.getByTestId('delete-all-beatnote-data').click();
    const deleteAllDialog = page.getByTestId('delete-all-beatnote-data-confirm');
    await expect(page.getByTestId('confirm-delete-all-beatnote-data'))
      .toHaveAttribute('aria-disabled', 'true');
    await deleteAllDialog.getByTestId('delete-all-beatnote-data-confirm-confirmation-input')
      .fill('DELETE ALL DATA');
    await expect(page.getByTestId('confirm-delete-all-beatnote-data'))
      .not.toHaveAttribute('aria-disabled', 'true');
    await deleteAllDialog.getByText('Cancel', { exact: true }).click();
    await page.getByTestId('data-settings-page-back').click();

    await page.getByTestId('settings-pro').click();
    await expect(page.getByText('Find the BPM and line up your counts', { exact: true })).toBeInViewport();
    await page.getByTestId('pro-feature-1').click();
    await expect(page.getByText('Set your rehearsal speed', { exact: true })).toBeInViewport();
    await page.getByRole('button', { name: 'Show Timeline appearance features' }).click();
    await expect(page.getByTestId('pro-demo-appearance')).toBeInViewport();
    await expect(page.getByTestId('pro-plan-yearly')).toBeInViewport();
    await expect(page.getByTestId('pro-plan-monthly')).toBeInViewport();
    await page.getByTestId('pro-compare').click();
    await expect(page.getByTestId('pro-comparison-sheet')).toBeVisible();
    await expect(page.getByTestId('pro-comparison-sheet')).toContainText('Fine speed adjustment');
    await expect(page.getByTestId('pro-comparison-sheet')).not.toContainText('Apple Music');
    await page.getByTestId('pro-comparison-done').click();
    await expect(page.getByTestId('pro-comparison-sheet')).not.toBeVisible();
    await expect(page.getByText('S$19.98 yearly', { exact: true })).toBeVisible();
    await page.getByTestId('pro-plan-monthly').click();
    await expect(page.getByTestId('pro-plan-monthly')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('S$2.98 monthly', { exact: true })).toBeVisible();
    await expect(page.getByTestId('restore-purchases-placeholder')).toContainText('Unavailable');
    await page.getByTestId('pro-settings-page-back').click();

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
    await page.getByTestId('settings-about').click();
    await page.getByRole('button', { name: 'BeatNote icon' }).click();
    await expect(page.getByText('BeatNote for iOS', { exact: true })).toBeVisible();
    await expect(page.getByText('Version 1.0.0 (56)', { exact: true })).toBeVisible();
    const invite = 'https://t.me/+4edtI3WUOqZlN2U1';
    await page.context().route(invite, route => route.fulfill({ body: 'Telegram group invite' }));
    await expect(page.getByTestId('about-settings-page').getByRole('link', { name: 'Give feedback on Telegram' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Open Source Licences', exact: true }).click();
    const licencesPage = page.getByTestId('open-source-licences-page');
    await expect(licencesPage).toBeVisible();
    await expect(licencesPage.getByRole('button', { expanded: true })).toHaveCount(0);
    const expoLicence = licencesPage.getByRole('button', { name: 'Expo and Expo modules', exact: true });
    await expoLicence.click();
    await expect(licencesPage).toContainText('expo-audio 1.1.1');
    await licencesPage.getByRole('button', { name: 'React and React Native', exact: true }).click();
    await expect(licencesPage).toContainText('react-native 0.81.5');
    await expoLicence.click();
    await expect(licencesPage).not.toContainText('expo-audio 1.1.1');
    await expect(licencesPage).toContainText('react-native 0.81.5');
    await licencesPage.getByRole('button', { name: 'Lucide', exact: true }).click();
    await expect(licencesPage).toContainText('lucide-react-native 0.554.0');
    await expect(licencesPage).toContainText('Native: DoubleConversion');
    await expect(licencesPage).toContainText('Native: hermes-engine');
    await expect(licencesPage).toContainText('Permission is hereby granted');
    await swipeFromLeadingEdge();
    await expect(page.getByRole('link', { name: 'Open Source Licences', exact: true })).toBeInViewport();
    await swipeFromLeadingEdge();
    await expect(page.getByTestId('settings-title')).toBeVisible();

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
    const feedbackLink = page.getByTestId('help-page').getByRole('link', { name: 'Give feedback on Telegram' });
    await expect(feedbackLink).toBeInViewport();
    const [feedbackPage] = await Promise.all([
      page.waitForEvent('popup'),
      feedbackLink.click(),
    ]);
    await expect(feedbackPage).toHaveURL(invite);
    await feedbackPage.close();
    await expect(page.getByText('Start on iPhone', { exact: true })).toBeVisible();
    await expect(page.getByText('Playback & Markers', { exact: true })).toBeVisible();
    await swipeFromLeadingEdge();
    await expect(page.getByText('Start on iPhone', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('settings-title')).toBeVisible();
    await swipeFromLeadingEdge();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
  });
  test('Lite and Pro expose the intended feature gates', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadSyntheticClickAudio(page, 120, 72);

    const grid = page.getByTestId('dance-grid-row-0');
    const shortcut = page.getByTestId('timing-shortcut');
    await expect(shortcut).toHaveCount(0);
    await expect(grid).toHaveCount(0);
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-bpm-entry').click();
    await page.getByTestId('count-size-4').click();
    await page.getByTestId('dance-grid-toggle').click();
    await page.getByTestId('timing-shortcut-toggle').click();
    await page.getByTestId('bpm-settings-page-back').click();
    await page.getByTestId('settings-display').click();
    const laneName = page.getByTestId('settings-layer-name-vocals');
    await laneName.fill('Vocals');
    await page.getByTestId('settings-layer-save-vocals').click();
    await page.getByTestId('waveform-visibility-toggle').click();
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await expect(grid).toBeVisible();
    await expect(page.getByTestId('wrapped-row-peaks-0')).toBeVisible();
    await expect(shortcut).toBeVisible();
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('debug-tier-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('settings-bpm-entry')).toBeDisabled();
    await expect(page.getByTestId('settings-bpm-entry')).toContainText('Pro only');
    await expect(page.getByTestId('settings-display')).toBeDisabled();
    await expect(page.getByTestId('settings-display')).toContainText('Pro only');
    await page.getByTestId('settings-playback').click();
    await expect(page.getByTestId('continuous-play-toggle')).toBeDisabled();
    await expect(page.getByRole('radio', { name: '10 seconds', exact: true })).toBeDisabled();
    await expect(page.getByRole('radio', { name: 'Change songs' })).toBeDisabled();
    await expect(page.getByTestId('continuous-play-detail')).toHaveText('Pro only');
    await page.getByTestId('playback-settings-page-back').click();
    await page.getByTestId('settings-buttons').click();
    await expect(page.getByTestId('speed-count-settings')).toContainText('Pro only');
    await page.getByTestId('button-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await expect(page.getByTestId('wrapped-row-peaks-0')).toHaveCount(0);
    await expect(page.getByTestId('loop-overview-peaks')).toHaveCount(0);
    await expect(page.getByTestId('add-marker')).toBeEnabled();
    await expect(shortcut).toHaveCount(0);
    await expect(grid).toHaveCount(0);
    await page.getByTestId('playback-speed').click();
    await expect(page.getByTestId('playback-speed-preset-0.75')).toBeVisible();
    await expect(page.getByTestId('playback-speed-slider')).toHaveCount(0);
    await page.getByTestId('playback-speed-preset-0.75').click();
    await expect(page.getByTestId('lite-ad-space')).toHaveCount(0);

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('lite-ad-space')).toHaveCount(0);

    await page.setViewportSize({ width: 393, height: 852 });
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('debug-tier-toggle').click();
    const proPasswordDialog = page.getByTestId('debug-pro-password-dialog');
    const proPasswordInput = proPasswordDialog.getByTestId('debug-pro-password-dialog-confirmation-input');
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await proPasswordInput.fill('wrong');
    await expect(page.getByTestId('confirm-enable-debug-pro'))
      .toHaveAttribute('aria-disabled', 'true');
    await proPasswordInput.fill('bananas');
    await page.getByTestId('confirm-enable-debug-pro').click();
    await expect(proPasswordDialog).toHaveCount(0);
    await expect(page.getByTestId('settings-bpm-entry')).toBeEnabled();
    await page.getByTestId('settings-display').click();
    await expect(page.getByTestId('waveform-visibility-toggle')).toHaveAttribute('aria-checked', 'true');
    await expect(laneName).toBeEditable();
    await expect(laneName).toHaveValue('Vocals');
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('settings-buttons').click();
    await page.getByTestId('speed-preset-count-4').click();
    await page.getByTestId('button-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('playback-speed').click();
    await expect(page.getByTestId('playback-speed-slider')).toBeVisible();
    await expect(page.getByTestId('playback-speed-range-min')).toHaveText('0.25×');
    await expect(page.getByTestId('playback-speed-range-max')).toHaveText('2×');
    const longPress = async (testID: string) => {
      const bounds = await page.getByTestId(testID).boundingBox();
      if (!bounds) throw new Error(`${testID} is unavailable`);
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      // The control fires at 450 ms; leave enough headroom for a busy parallel browser worker.
      await page.waitForTimeout(700);
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
  test('track completion repeats, stops in Lite, and preserves drafts through Pro continuation', async ({ page }) => {
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

    // Freeze the short fixture before changing tiers; otherwise it can finish in Pro
    // while the settings drawer is still opening on a busy native-build host.
    await page.getByTestId('play-pause').click();
    await expect(page.getByTestId('play-pause')).toHaveAttribute('aria-label', 'Play song');
    await repeat.click();
    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('debug-tier-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('settings-page')).toHaveCount(0);
    await finishActiveTrack();
    await expect(page.getByTestId('play-pause')).toHaveAttribute('aria-label', 'Play song');
    await expect(title).toContainText('long-test-track');

    await page.getByTestId('sidebar-open-toggle').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('debug-tier-toggle').click();
    await page.getByTestId('debug-pro-password-dialog-confirmation-input').fill('bananas');
    await page.getByTestId('confirm-enable-debug-pro').click();
    await expect(page.getByTestId('debug-tier-toggle')).toHaveAttribute('aria-checked', 'true');
    await page.getByTestId('settings-playback').click();
    await page.getByTestId('continuous-play-toggle').click();
    await expect(page.getByTestId('continuous-play-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('playback-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    // Shuffle is itself a continuation intent in Pro, even when the separate Continuous Play
    // preference is off. A dirty named project must be flushed as a recoverable song draft without
    // blocking hands-free playback behind the manual switch guard or overwriting the project.
    await page.getByTestId('save-project').click();
    await page.getByTestId('save-project-name').fill('Shuffle Draft');
    await page.getByTestId('confirm-save-project').click();
    await page.getByTestId('add-marker').click();
    await page.getByTestId('shuffle-control').click();
    await finishActiveTrack();
    await expect.poll(async () => title.textContent()).not.toContain('long-test-track');
    await expect(page.getByTestId('switch-guard-dialog')).toHaveCount(0);
    await page.getByTestId('play-pause').click();
    await page.getByTestId('shuffle-control').click();
    await expect(page.getByTestId('shuffle-control')).toHaveAttribute('aria-pressed', 'false');
    await title.click();
    await page.getByRole('button', { name: /^long-test-track,/ }).click();
    await expect(page.getByTestId('track-switch-transition')).toHaveCount(0, { timeout: 1000 });
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);

    await finishActiveTrack();
    await expect(page.getByTestId('play-pause')).toHaveAttribute('aria-label', 'Play song');
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
      /Suggested: (?:119|120) BPM/,
      { timeout: 15000 },
    );
    await expect(page.getByTestId('bpm-suggestion-card')).not.toContainText(/Suggested: \d+\.\d+ BPM/);
    await page.getByRole('button', { name: 'Preview related tempos' }).click();
    await page.getByRole('button', { name: /Preview (?:179|180) BPM/ }).click();
    await expect(page.getByTestId('bpm-preview-status')).toContainText(/Previewing (?:179|180) BPM/);
    await page.getByTestId('bpm-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('timing-shortcut')).toHaveCount(0);
    const previewStatus = page.getByTestId('editor-bpm-preview');
    await expect(previewStatus).toHaveText(/Previewing (?:179|180) BPM · Project 120 BPM/);
    await previewStatus.click();
    await page.getByRole('button', { name: 'Cancel Preview' }).click();
    await page.getByTestId('bpm-settings-page-back').click();
    await expect(previewStatus).toHaveCount(0);
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-bpm-entry').click();
    await page.getByRole('button', { name: 'Preview', exact: true }).click();
    await page.getByRole('button', { name: 'Apply Preview' }).click();
    await page.getByTestId('dance-counts-toggle').click();
    await expect(page.getByTestId('dance-counts-enabled')).toHaveText('Look for counts beside the waveform and playback controls.');
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

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-bpm-entry').click();
    await expect(page.getByTestId('bpm-analysis-start')).toHaveText('Analyze Tempo');
    await page.getByTestId('bpm-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    const songTitleControl = page.getByTestId('song-title-control');
    await songTitleControl.click();
    await expect(page.getByRole('button', { name: /^test-audio,/ })).toBeVisible();
    await page.getByTestId('music-library-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    await expect(songTitleControl).toBeFocused();

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-display').click();
    await page.getByTestId('settings-layer-name-vocals').fill('Notes');
    await page.getByTestId('settings-layer-save-vocals').click();
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await page.getByTestId('save-project').click();
    await page.getByTestId('save-project-name').fill('Core Project');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.locator('[data-testid="dock-toast"]:visible')).toHaveText('Saved “Core Project”');
    await page.getByTestId('load-project').click();
    await page.getByTestId('current-project-save-as-new').click();
    await page.getByTestId('save-project-name').fill('Core Project Copy');
    await page.getByTestId('confirm-save-project').click();
    await expect(page.locator('[data-testid="dock-toast"]:visible')).toHaveText('Saved “Core Project Copy”');
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
    await expect(page.locator('[data-testid="dock-toast"]:visible')).toHaveText('Renamed project to “Renamed Current”');
    await expect(page.getByTestId('current-project-name')).toHaveText('Renamed Current');
    await page.getByTestId('projects-back').click();

    await loadTestAudio(page, 'second-song.wav', 'test-audio.wav');
    await songTitleControl.click();
    await page.getByTestId('music-library-sort-title').click();
    const ascendingTitles = await page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.textContent ?? ''));
    const ascendingIds = await page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.getAttribute('data-testid')!
        .replace('music-library-row-main-', '')));
    await expect.poll(() => page.evaluate(() => {
      const stored = localStorage.getItem('beatnote.queue.v1');
      if (stored === null) return null;
      const queue = JSON.parse(stored);
      return { sortKey: queue.sortKey, sortDirection: queue.sortDirection, order: queue.order };
    })).toEqual({ sortKey: 'title', sortDirection: 'ascending', order: ascendingIds });
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
    await expect.poll(() => page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => {
        const [first, second] = rows.map(row => row.getBoundingClientRect());
        return first.bottom <= second.top + 1;
      })).toBe(true);
    const expectedQueueOrder = await page.locator('[data-testid^="music-library-row-main-"]')
      .evaluateAll(rows => rows.map(row => row.getAttribute('data-testid')!
        .replace('music-library-row-main-', '')));
    const secondSongId = (await page.locator('[data-testid^="music-library-row-main-"]')
      .filter({ hasText: 'second-song' }).getAttribute('data-testid'))!
      .replace('music-library-row-main-', '');
    await expect.poll(() => page.evaluate(() => {
      const stored = localStorage.getItem('beatnote.queue.v1');
      if (stored === null) return null;
      const queue = JSON.parse(stored);
      return { order: queue.order, currentIndex: queue.currentIndex };
    })).toEqual({
      order: expectedQueueOrder,
      currentIndex: expectedQueueOrder.indexOf(secondSongId),
    });
    await testAudioRow.getByRole('button', { name: 'More actions for test-audio' }).click();
    await page.getByRole('menuitem', { name: 'Show Projects' }).click();
    await page.getByRole('button', { name: 'Back to Music Library' }).click();
    await expect(page.getByTestId('music-library-sheet')).toBeVisible();
    await page.getByTestId('music-library-sheet-backdrop').click({ position: { x: 10, y: 10 } });
    const holdTrackControl = async (testID: 'previous-track-control' | 'next-track-control') => {
      const control = page.getByTestId(testID);
      await control.click({ delay: 700 });
    };
    await holdTrackControl('previous-track-control');
    await expect(songTitleControl).toContainText('test-audio');
    await holdTrackControl('next-track-control');
    await expect(songTitleControl).toContainText('second-song');
    await holdTrackControl('previous-track-control');
    await expect(songTitleControl).toContainText('test-audio');

    await page.getByTestId('load-project').click();
    await expect(page.getByTestId('current-project-name')).toHaveText('Renamed Current');
    await page.getByTestId('projects-back').click();
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-display').click();
    await expect(page.getByTestId('settings-layer-name-vocals')).toHaveValue('Notes');
    const labelField = page.getByTestId('settings-layer-name-vocals');
    const storedLabel = (source: 'draft' | 'project') => page.evaluate(which => {
      const project = Object.entries(localStorage)
        .filter(([key]) => key.startsWith('beatnote.project.v2.'))
        .map(([, raw]) => JSON.parse(raw))
        .find(record => record.metadata.name === 'Renamed Current');
      if (!project) return null;
      const record = which === 'project' ? project
        : JSON.parse(localStorage.getItem('beatnote.draft.v1.' + project.musicItemId) ?? 'null')?.content;
      const layer = record?.layers.find((item: { id: string }) => item.id === 'vocals');
      return layer ? layer.customName ?? 'Annotations' : null;
    }, source);
    await expect.poll(() => storedLabel('project')).toBe('Notes');
    await page.getByTestId('settings-layer-reset-vocals').click();
    await expect(labelField).toHaveValue('Annotations');
    await expect.poll(() => storedLabel('draft')).toBe('Annotations');
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    await page.getByTestId('save-project').click();
    await expect.poll(() => storedLabel('project')).toBe('Annotations');
    await page.reload();
    await expect(songTitleControl).toContainText('test-audio');
    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-display').click();
    await expect(labelField).toHaveValue('Annotations');
    await labelField.fill('Footwork');
    await labelField.blur();
    await expect(page.getByTestId('settings-layer-save-vocals')).toBeEnabled();
    await page.getByTestId('settings-layer-save-vocals').click();
    await expect(page.getByTestId('settings-layer-save-vocals')).toBeDisabled();
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();

    await page.getByTestId('add-marker').click();
    await songTitleControl.click();
    await page.getByRole('button', { name: /^second-song,/ }).click();
    await expect(page.getByTestId('switch-guard-dialog')).toBeVisible();
    await expect(page.getByTestId('switch-change-summary')).toContainText('Annotation label: “Annotations” → “Footwork”');
    await expect(page.getByTestId('switch-change-summary')).toContainText('Markers: 1 added');
    await page.getByTestId('switch-keep-draft').click();
    await songTitleControl.click();
    const target = page.getByRole('button', { name: /^test-audio,/ });
    const targetId = (await target.getAttribute('data-testid'))!.replace('music-library-row-main-', '');
    await page.evaluate(key => {
      const getItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function (requestedKey) {
        if (requestedKey === key) {
          Storage.prototype.getItem = getItem;
          throw new Error('Simulated temporary draft read failure');
        }
        return getItem.call(this, requestedKey);
      };
    }, `beatnote.draft.v1.${targetId}`);
    await target.click();
    await expect(songTitleControl).toContainText('second-song');
    await page.getByRole('button', { name: 'Retry loading test-audio' }).click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);

    await page.getByTestId('load-project').click();
    await prepareFilePicker(page);
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
    const activeToast = page.locator('[data-testid="dock-toast"]:visible');
    await expect(activeToast).toContainText('CSV imported');
    await activeToast.getByTestId('dock-toast-action').click();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);
    await page.getByTestId('load-project').click();
    await expect(page.getByTestId('current-project-export-csv')).toHaveText('Export Project');
    await page.getByTestId('current-project-export-csv').click();
    await expect(page.getByText('Export Project', { exact: true }).last()).toBeVisible();
    await page.evaluate(() => {
      const capture = { html: '' };
      Object.defineProperty(window, '__beatnotePdfCapture', { value: capture, configurable: true });
      window.open = ((() => ({
        document: {
          open: () => undefined,
          write: (html: string) => { capture.html = html; },
          close: () => undefined,
        },
        addEventListener: () => undefined,
      })) as unknown) as typeof window.open;
    });
    await page.getByTestId('export-pdf').click();
    await page.getByTestId('app-prompt').getByRole('button', { name: 'OK' }).click();
    await expect.poll(() => page.evaluate(() => (
      (window as typeof window & { __beatnotePdfCapture?: { html: string } })
        .__beatnotePdfCapture?.html.includes('<svg class="timeline-waveform"') ?? false
    ))).toBe(true);
    await page.getByTestId('projects-back').click();

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-data').click();
    await page.getByTestId('delete-all-projects').click();
    const deleteProjectsDialog = page.getByTestId('delete-all-projects-confirm');
    await expect(page.getByTestId('confirm-delete-all-projects'))
      .toHaveAttribute('aria-disabled', 'true');
    await deleteProjectsDialog.getByTestId('delete-all-projects-confirm-confirmation-input')
      .fill('DELETE PROJECTS');
    await page.getByTestId('confirm-delete-all-projects').click();
    await expect(activeToast).toContainText('Deleted all saved projects');
    await expect.poll(() => page.evaluate(() => Object.keys(localStorage)
      .filter(key => key.startsWith('beatnote.project.v2.')).length)).toBe(0);

    await page.getByTestId('delete-all-imported-audio').click();
    const deleteAudioDialog = page.getByTestId('delete-all-imported-audio-confirm');
    await expect(page.getByTestId('confirm-delete-all-imported-audio'))
      .toHaveAttribute('aria-disabled', 'true');
    await deleteAudioDialog.getByTestId('delete-all-imported-audio-confirm-confirmation-input')
      .fill('DELETE IMPORTED AUDIO');
    await page.getByTestId('confirm-delete-all-imported-audio').click();
    await expect(activeToast).toContainText('Deleted all imported audio copies');
    await expect(page.getByTestId('data-imported-audio-summary')).toContainText('0 songs');

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
