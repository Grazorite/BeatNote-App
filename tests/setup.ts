import { test as base, expect as baseExpect } from '@playwright/test';
import path from 'node:path';
import type { Page } from '@playwright/test';

// Use base test without complex fixtures
export const test = base;

// Use base expect
export const expect = baseExpect;

export async function loadTestAudio(page: Page, fixtureName: string = 'test-audio.wav') {
  await page.evaluate(() => {
    const dispatchEvent = HTMLInputElement.prototype.dispatchEvent;
    HTMLInputElement.prototype.dispatchEvent = function (event) {
      // Expo's web picker dispatches a synthetic click, which Chromium treats as cancellation.
      if (this.type === 'file' && event.type === 'click' && !event.isTrusted) return true;
      return dispatchEvent.call(this, event);
    };
  });
  await page.getByTestId('load-song').click();

  const fileInput = page.locator('input[type="file"]').last();
  await expect(fileInput).toBeAttached({ timeout: 5000 });
  await fileInput.setInputFiles(path.resolve(`tests/fixtures/${fixtureName}`));
  await expect(page.getByTestId('load-song')).toContainText('Song Loaded', { timeout: 10000 });
}

// Re-export everything else
export { Page, Locator, BrowserContext } from '@playwright/test';
