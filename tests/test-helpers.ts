import { Page } from '@playwright/test';

export async function createTestAudioFile(page: Page): Promise<string> {
  // Create a data URL for a simple audio file
  const audioDataUrl = await page.evaluate(() => {
    // Create a simple WAV file
    const sampleRate = 44100;
    const duration = 5; // 5 seconds
    const frequency = 440; // A4 note
    const amplitude = 0.3;
    
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave data
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * amplitude;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    // Convert to base64 data URL
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  });
  
  return audioDataUrl;
}

export async function loadTestAudio(page: Page): Promise<void> {
  // Create test audio file
  const audioDataUrl = await createTestAudioFile(page);
  
  // Mock DocumentPicker and Audio for testing
  await page.evaluate((dataUrl) => {
    // Mock expo-document-picker
    (window as any).mockDocumentPicker = {
      getDocumentAsync: () => Promise.resolve({
        canceled: false,
        assets: [{
          uri: dataUrl,
          name: 'test-audio.wav',
          type: 'audio/wav',
          size: 1000
        }]
      })
    };
    
    // Mock expo-av Audio
    (window as any).mockAudio = {
      setAudioModeAsync: () => Promise.resolve(),
      Sound: {
        createAsync: () => Promise.resolve({
          sound: {
            getStatusAsync: () => Promise.resolve({
              isLoaded: true,
              durationMillis: 5000,
              positionMillis: 0
            }),
            setPositionAsync: () => Promise.resolve(),
            playAsync: () => Promise.resolve(),
            pauseAsync: () => Promise.resolve(),
            unloadAsync: () => Promise.resolve(),
            setOnPlaybackStatusUpdate: () => {}
          }
        })
      }
    };
    
    (window as any).testAudioUrl = dataUrl;
  }, audioDataUrl);
}

export async function simulateFileUpload(page: Page): Promise<void> {
  // Create a test audio file blob
  const audioBuffer = await page.evaluate(() => {
    const sampleRate = 44100;
    const duration = 2; // 2 seconds
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // Simple WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.3;
      const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      view.setInt16(44 + i * 2, intSample, true);
    }
    
    return Array.from(new Uint8Array(buffer));
  });
  
  // Create file from buffer
  const file = await page.evaluateHandle((bufferArray) => {
    const buffer = new Uint8Array(bufferArray);
    return new File([buffer], 'test-audio.wav', { type: 'audio/wav' });
  }, audioBuffer);
  
  // Store file for upload simulation
  await page.evaluate((fileHandle) => {
    (window as any).testAudioFile = fileHandle;
  }, file);
}

export async function waitForWaveformLoad(page: Page): Promise<void> {
  // Wait for waveform container or audio to be loaded
  try {
    await page.waitForSelector('[data-testid="waveform-container"]', { timeout: 5000 });
  } catch {
    // If no waveform container, wait for song loaded indicator
    await page.waitForSelector('text="♪ Song Loaded"', { timeout: 5000 });
  }
  
  // Wait for rendering
  await page.waitForTimeout(500);
}

export async function clickLoadSongAndWait(page: Page): Promise<void> {
  // Mock the file picker before clicking
  await loadTestAudio(page);
  
  // Click load song button
  const loadButton = page.getByText('Load Song');
  await loadButton.click();
  
  // Wait for song to load
  await page.waitForSelector('text="♪ Song Loaded"', { timeout: 5000 });
}