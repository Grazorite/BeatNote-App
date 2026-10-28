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

const syntheticClickWav = (bpm = 120, durationSeconds = 12): Buffer => {
  const sampleRate = 44_100;
  const sampleCount = Math.round(sampleRate * durationSeconds);
  const dataSize = sampleCount * 2;
  const wav = Buffer.alloc(44 + dataSize);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(36 + dataSize, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(dataSize, 40);

  const intervalSeconds = 60 / bpm;
  const leadingSilenceSeconds = 0.5;
  const clickLength = Math.round(sampleRate * 0.01);
  for (let beatSeconds = intervalSeconds;
    leadingSilenceSeconds + beatSeconds < durationSeconds - 0.02;
    beatSeconds += intervalSeconds) {
    const start = Math.round((leadingSilenceSeconds + beatSeconds) * sampleRate);
    for (let index = 0; index < clickLength; index++) {
      const fade = 1 - index / clickLength;
      const value = 0.6 * fade * Math.sin(index / sampleRate * 2 * Math.PI * 1_000);
      wav.writeInt16LE(Math.round(value * 32767), 44 + (start + index) * 2);
    }
  }
  return wav;
};

/** Import a deterministic click track for the retained automatic-BPM browser workflow. */
export async function loadSyntheticClickAudio(page: Page) {
  await prepareFilePicker(page);
  await page.getByTestId('song-title-control').click();
  await expect(page.getByTestId('music-library-sheet')).toBeVisible();
  await page.getByTestId('music-library-import').click();
  const fileInput = page.locator('input[type="file"]').last();
  await expect(fileInput).toBeAttached({ timeout: 5000 });
  await fileInput.setInputFiles({
    name: 'test-audio.wav',
    mimeType: 'audio/wav',
    buffer: syntheticClickWav(),
  });
  await expect(page.getByTestId('song-title-control')).toContainText('test-audio', { timeout: 10000 });
  await expect(page.getByTestId('music-library-sheet')).toHaveCount(0);
}

// Re-export everything else
export { Page, Locator, BrowserContext } from '@playwright/test';
