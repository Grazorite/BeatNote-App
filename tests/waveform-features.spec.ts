import { test, expect, loadSyntheticClickAudio, loadTestAudio } from './setup';

test.describe('Critical annotation workflow', () => {
  test('creates markers only from controls and saves a mobile annotation', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.evaluate(() => {
      const prototype = AudioContext.prototype as AudioContext & {
        decodeAudioData: (audioData: ArrayBuffer) => Promise<AudioBuffer>;
      };
      const decodeAudioData = prototype.decodeAudioData;
      prototype.decodeAudioData = async function (audioData: ArrayBuffer) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return decodeAudioData.call(this, audioData);
      };
    });
    await loadSyntheticClickAudio(page, 120, 150, 'long-waveform.wav');

    await expect(page.getByTestId('loop-overview-peaks')).toHaveCount(0);

    await page.getByTestId('sidebar-open-toggle').click();
    await page.getByTestId('settings-display').click();
    await expect(page.getByTestId('waveform-visibility-toggle')).toHaveAttribute('aria-checked', 'false');
    await page.getByTestId('waveform-visibility-toggle').click();
    await page.getByTestId('display-settings-page-back').click();
    await page.getByTestId('sidebar-toggle').click();
    const waveformLoading = page.getByTestId('waveform-loading-overlay');
    await expect(waveformLoading).toBeVisible();
    await expect(waveformLoading).toContainText('Preparing waveform');
    await expect(waveformLoading).toContainText('Long songs can take a moment');
    await expect(waveformLoading).toHaveAttribute('aria-label', 'Preparing waveform. Long songs can take a moment.');
    await expect(page.getByTestId('loop-overview-peaks')).toBeVisible({ timeout: 15_000 });

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
    await expect(page.locator('[data-testid="dock-toast"]:visible')).toHaveText('Add a marker first');
    await expect(page.getByTestId('annotation-editor-input')).not.toBeVisible();
    const toastSlotBounds = await page.getByTestId('dock-toast-slot').boundingBox();
    const annotationSlotBounds = await page.getByTestId('annotation-callout-slot').boundingBox();
    expect(toastSlotBounds).not.toBeNull();
    expect(annotationSlotBounds).not.toBeNull();
    if (toastSlotBounds && annotationSlotBounds) {
      expect(toastSlotBounds.y).toBeGreaterThanOrEqual(annotationSlotBounds.y - 2);
    }

    await gestureArea.click({ position: { x: box.width * 0.6, y: 12 } });
    await expect.poll(markerCount).toBe(0);
    await page.getByTestId('add-marker').click();
    await expect.poll(markerCount).toBe(1);
    await expect(page.locator('[data-testid^="loop-overview-marker-vocals-"]').first()).toHaveAttribute('fill', 'none');

    await expect(annotationButton).toBeEnabled();
    await annotationButton.click();
    await page.getByTestId('annotation-editor-input').fill('Turn together');
    await page.getByTestId('save-annotation').click();

    const annotationDot = page.locator('[data-testid^="wrapped-row-annotation-vocals-"]').first();
    await expect(annotationDot).toHaveAttribute('fill', '#c084fc');
    await expect(page.locator('[data-testid^="loop-overview-annotation-vocals-"]').first()).toHaveAttribute('fill', '#c084fc');
    await expect(page.getByTestId('annotation-callout')).toContainText('Turn together');

    await page.getByTestId('add-marker').click();
    await expect.poll(markerCount).toBe(0);
    await page.waitForTimeout(150);
    const fadingOpacity = await page.getByTestId('annotation-callout').evaluate(element => (
      Number.parseFloat(window.getComputedStyle(element).opacity)
    ));
    expect(fadingOpacity).toBeGreaterThan(0);
    expect(fadingOpacity).toBeLessThan(1);
    const activeToast = page.locator('[data-testid="dock-toast"]:visible');
    await expect(activeToast).toContainText('Marker removed');
    await activeToast.getByTestId('dock-toast-action').click();
    await expect.poll(markerCount).toBe(1);
    await expect(page.locator('[data-testid^="loop-overview-annotation-vocals-"]').first()).toBeVisible();

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height - 12);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height - 12, { steps: 5 });
    await page.mouse.up();
    await expect.poll(markerCount).toBe(1);

    // Exercise real playback with delayed native-clock samples, then explicitly seek back.
    const markerTime = Number((await annotationDot.getAttribute('data-testid'))?.split('-').pop());
    await gestureArea.click({ position: { x: box.width * 0.2, y: 12 } });
    await page.evaluate(time => {
      const original = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'currentTime')!;
      const clock = window as typeof window & { annotationTestClock: number };
      clock.annotationTestClock = time / 1000;
      Object.defineProperty(HTMLMediaElement.prototype, 'currentTime', {
        ...original,
        get() { return clock.annotationTestClock; },
      });
    }, markerTime - 200);
    const sampleClock = async (time: number) => {
      await page.evaluate(value => {
        (window as typeof window & { annotationTestClock: number }).annotationTestClock = value / 1000;
      }, time);
      await page.waitForTimeout(160);
    };
    const watchNextPlaybackCallout = async () => {
      await page.evaluate(() => {
        const targetWindow = window as typeof window & {
          annotationPlaybackCalloutSeen?: boolean;
          annotationPlaybackObserver?: MutationObserver;
        };
        targetWindow.annotationPlaybackObserver?.disconnect();
        targetWindow.annotationPlaybackCalloutSeen = false;
        const recordCallout = () => {
          const callout = document.querySelector('[data-testid="annotation-callout"]');
          if (!callout?.textContent?.includes('Turn together')) return;
          targetWindow.annotationPlaybackCalloutSeen = true;
          targetWindow.annotationPlaybackObserver?.disconnect();
        };
        targetWindow.annotationPlaybackObserver = new MutationObserver(recordCallout);
        targetWindow.annotationPlaybackObserver.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
        });
        recordCallout();
      });
    };
    const expectPlaybackCallout = async () => {
      await expect.poll(() => page.evaluate(() => (
        (window as typeof window & { annotationPlaybackCalloutSeen?: boolean })
          .annotationPlaybackCalloutSeen === true
      ))).toBe(true);
    };
    await watchNextPlaybackCallout();
    await page.getByTestId('play-pause').click();
    await sampleClock(markerTime + 10);
    await expectPlaybackCallout();
    await expect(page.getByTestId('annotation-callout')).toHaveCount(0, { timeout: 4000 });
    for (const time of [markerTime - 800, markerTime + 20, markerTime - 50, markerTime + 30]) {
      await sampleClock(time);
      await expect(page.getByTestId('annotation-callout')).toHaveCount(0);
    }
    await page.getByTestId('play-pause').click();
    await sampleClock(markerTime - 200);
    await gestureArea.click({ position: { x: box.width * 0.2, y: 12 } });
    await watchNextPlaybackCallout();
    await page.getByTestId('play-pause').click();
    await sampleClock(markerTime + 10);
    await expectPlaybackCallout();
    await page.getByTestId('play-pause').click();

    await page.getByRole('button', { name: 'Annotation: Turn together', exact: true }).click();
    await expect(page.getByTestId('annotation-editor-input')).toHaveValue('Turn together');
  });

  test('preserves loaded marker data through portrait and landscape reflow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await loadTestAudio(page);
    await page.getByTestId('add-marker').click();

    await page.setViewportSize({ width: 740, height: 390 });
    await expect(page.getByTestId('landscape-control-rail')).toBeVisible();
    await expect(page.getByTestId('song-title-control')).toContainText('test-audio');
    await expect(page.getByTestId('grand-total-markers')).toContainText('1 marker');
    await page.getByTestId('annotation-control').click();
    await expect(page.getByTestId('annotation-keyboard-done')).toBeVisible();
    await expect(page.getByTestId('save-annotation')).toBeVisible();
    const editorBounds = await page.getByTestId('annotation-editor').boundingBox();
    expect(editorBounds).not.toBeNull();
    if (editorBounds) {
      expect(editorBounds.y).toBeGreaterThanOrEqual(0);
      expect(editorBounds.y + editorBounds.height).toBeLessThanOrEqual(390);
    }
    await page.getByText('Cancel', { exact: true }).click();

    await page.setViewportSize({ width: 393, height: 852 });
    await expect(page.getByTestId('portrait-control-dock')).toBeVisible();
    await expect(page.locator('[data-testid^="wrapped-row-marker-vocals-"]')).toHaveCount(1);
  });
});
