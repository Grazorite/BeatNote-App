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
    await expect(page.locator('[data-testid^="wrapped-row-loop-outside-"]').first()).toBeVisible();
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

    await page.keyboard.press('Shift+l');
    await expect(page.getByTestId('loop-marker-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('loop-region-toggle')).toHaveAttribute('aria-pressed', 'false');

    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('loop-overview-range')).toHaveCount(0);
    await expect(page.getByTestId('loop-overview-clear')).toHaveAttribute('aria-label', 'Restore');
    await expect(page.getByTestId('loop-overview-clear')).toBeFocused();
    await page.getByTestId('loop-overview-clear').click();
    await expect(page.getByTestId('loop-overview-range')).toBeVisible();
  });

  // Studio Screen Tests
  test.describe('Studio Screen', () => {
    test('should load the studio screen', async ({ page }) => {
      await page.goto('/');
      
      // Check if main UI components are present
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });

    test('should show audio controls', async ({ page }) => {
      await page.goto('/');
      
      const loadButton = page.getByText('Load Song');
      await expect(loadButton).toBeVisible();
      await expect(loadButton).toBeEnabled();
      
      const markerButton = page.getByTestId('add-marker');
      await expect(markerButton).toBeVisible();
      await expect(markerButton).toBeDisabled();
    });

    test('should display layer information', async ({ page }) => {
      await page.goto('/');
      
      // Check if layer info is displayed with current format
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      await expect(page.getByText(/Grand Total:.*markers/)).toBeVisible();
    });

    test('should have tap button available', async ({ page }) => {
      await page.goto('/');
      
      const tapButton = page.getByTestId('add-marker');
      await expect(tapButton).toBeVisible();
    });
    
    test('should hide unfinished view mode controls', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('View Mode')).toHaveCount(0);
      await expect(page.getByText('Multitrack')).toHaveCount(0);
      await expect(page.getByTestId('layer-vocals')).toBeVisible();
    });
    
    test('should hide unfinished stem separation selector', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByText('Stem Separation')).toHaveCount(0);
      await expect(page.getByText('2 Stems')).toHaveCount(0);
      await expect(page.getByText('4 Stems')).toHaveCount(0);
      await expect(page.getByText('6 Stems')).toHaveCount(0);
    });
    
    test('should have help button with icon', async ({ page }) => {
      await page.goto('/');
      
      await expect(page.getByText('Help & Shortcuts')).toBeVisible();
    });
    
    test('should show BPM control', async ({ page }) => {
      await page.goto('/');
      
      // Look for BPM text and 120 value
      const bpmText = page.getByText('BPM');
      const bpmValue = page.getByText('120');
      
      // BPM control should be present
      await expect(bpmText).toBeVisible();
      await expect(bpmValue).toBeVisible();
    });
  });

  // UI Components Tests
  test.describe('UI Components', () => {
    test('should render main layout components', async ({ page }) => {
      await page.goto('/');
      
      // Check for essential UI components
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });
    
    test('should show tap button', async ({ page }) => {
      await page.goto('/');
      
      const tapButton = page.getByTestId('add-marker');
      await expect(tapButton).toBeVisible();
    });
    
    test('should handle tap button interaction', async ({ page }) => {
      await page.goto('/');
      await loadTestAudio(page);
      
      // Get initial marker count
      const initialMarkerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialMarkerCount = parseInt(initialMarkerText?.match(/\d+/)?.[0] || '0');
      
      // Click TAP button
      const tapButton = page.getByTestId('add-marker');
      await tapButton.click();
      
      // Wait for state update
      await page.waitForTimeout(100);
      
      // Verify marker count increased
      const newMarkerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newMarkerCount = parseInt(newMarkerText?.match(/\d+/)?.[0] || '0');
      
      expect(newMarkerCount).toBeGreaterThan(initialMarkerCount);
    });
    
    test('should show BPM control', async ({ page }) => {
      await page.goto('/');
      
      // Check for BPM control elements
      await expect(page.getByText('BPM')).toBeVisible();
      await expect(page.getByText('120')).toBeVisible();
      
      // Check for BPM adjustment buttons
      await expect(page.getByText('-5')).toBeVisible();
      await expect(page.getByText('+5')).toBeVisible();
    });
    
    test('should show modern toggles and selectors', async ({ page }) => {
      await page.goto('/');
      
      // Check for core UI elements that should always be visible
      await expect(page.getByText('Stem Separation')).toHaveCount(0);
      await expect(page.getByText('View Mode')).toHaveCount(0);
      
      // Check for at least some toggle options (they may be collapsed)
      const markerOptions = page.getByText('Marker Options');
      const canvasOptions = page.getByText('Canvas Options');
      
      // At least the headers should be visible
      await expect(markerOptions).toBeVisible();
      await expect(canvasOptions).toBeVisible();
    });
    
    test('should show timeline elements', async ({ page }) => {
      await page.goto('/');
      
      // Look for SVG elements which are used for waveform/timeline
      const svgElements = page.locator('svg');
      const hasSvg = await svgElements.count() > 0;
      
      // Should have at least some visual elements
      expect(hasSvg).toBe(true);
    });
  });

  // UI Layout Tests
  test.describe('UI Layout', () => {
    test('should render main layout without crashes', async ({ page }) => {
      await page.goto('/');
      
      // Basic smoke test - app should load without crashing
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByTestId('add-marker')).toBeVisible();
    });
    
    test('should show sidebar elements with layer selector', async ({ page }) => {
      await page.goto('/');
      
      // Check for layer selector elements
      const vocalsButton = page.getByTestId('layer-vocals');
      const otherButton = page.getByTestId('layer-other');
      
      await expect(vocalsButton).toBeVisible();
      await expect(otherButton).toBeVisible();
      
      // Check help text
      const helpText = page.getByText('Tap to select • Long press to hide/show', { exact: true });
      await expect(helpText).toBeVisible();
    });
    
    test('should check viewport dimensions', async ({ page }) => {
      await page.goto('/');
      
      // Get viewport info
      const viewportSize = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        bodyHeight: document.body.scrollHeight
      }));
      
      console.log('Viewport dimensions:', viewportSize);
      
      // Basic sanity checks
      expect(viewportSize.viewportWidth).toBeGreaterThan(0);
      expect(viewportSize.viewportHeight).toBeGreaterThan(0);
      expect(viewportSize.bodyHeight).toBeGreaterThan(0);
    });
  });
});
