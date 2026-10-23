import { test as base, expect as baseExpect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

// Use base test without complex fixtures
export const test = base;

// Use base expect
export const expect = baseExpect;

export async function prepareFilePicker(page: Page) {
  await page.evaluate(() => {
    const pickerWindow = window as typeof window & { __beatNotePickerPrepared?: boolean };
    if (pickerWindow.__beatNotePickerPrepared) return;
    pickerWindow.__beatNotePickerPrepared = true;
    const dispatchEvent = HTMLInputElement.prototype.dispatchEvent;
    HTMLInputElement.prototype.dispatchEvent = function (event) {
      // Expo's web picker dispatches a synthetic click, which Chromium treats as cancellation.
      if (this.type === 'file' && event.type === 'click' && !event.isTrusted) return true;
      return dispatchEvent.call(this, event);
    };
  });
}

export async function loadTestAudio(
  page: Page,
  fixtureName: string = 'test-audio.wav',
  sourceFixtureName?: string,
) {
  await prepareFilePicker(page);
  await page.getByTestId('song-title-control').click();
  await expect(page.getByTestId('music-library-sheet')).toBeVisible();
  await page.getByTestId('music-library-import').click();

  const fileInput = page.locator('input[type="file"]').last();
  await expect(fileInput).toBeAttached({ timeout: 5000 });
  if (sourceFixtureName === undefined) {
    await fileInput.setInputFiles(path.resolve(`tests/fixtures/${fixtureName}`));
  } else {
    const source = readFileSync(path.resolve(`tests/fixtures/${sourceFixtureName}`));
    await fileInput.setInputFiles({
      name: fixtureName,
      mimeType: 'audio/wav',
      // A trailing WAV-safe nonce keeps the durable-library identity distinct.
      buffer: Buffer.concat([source, Buffer.from(fixtureName)]),
    });
  }
  await expect(page.getByTestId('song-title-control')).toContainText(
    path.parse(fixtureName).name,
    { timeout: 10000 },
  );
  await expect(page.getByTestId('music-library-sheet')).toHaveCount(0);
}

// Re-export everything else
export { Page, Locator, BrowserContext } from '@playwright/test';
