import { useState, useEffect } from 'react';
import { extractWaveform, WaveformResolution } from '../services/waveformExtraction';
import { useStudioStore } from './useStudioStore';

export interface WaveformData {
  peaks: number[];
  duration: number;
  source: 'decoded';
}

// Simple cache for waveform data
const waveformCache = new Map<string, WaveformData>();
interface WaveformRequest {
  promise: Promise<WaveformData | null>;
  controller: AbortController;
  consumers: number;
}
const waveformRequestCache = new Map<string, WaveformRequest>();

/** Clear decoded in-memory peaks. Active requests may finish and repopulate their result. */
export const clearWaveformCache = (): void => {
  waveformCache.clear();
};

const loadWaveform = (
  audioUri: string,
  resolution: WaveformResolution,
): WaveformRequest => {
  const cacheKey = `${resolution}:${audioUri}`;
  const pending = waveformRequestCache.get(cacheKey);
  if (pending) {
    pending.consumers++;
    return pending;
  }
  const controller = new AbortController();
  const promise = extractWaveform({ audioUri, resolution, signal: controller.signal })
    .then(result => {
      if (controller.signal.aborted || !result?.peaks.length) return null;
      const data: WaveformData = { ...result, source: 'decoded' };
      waveformCache.set(cacheKey, data);
      // Each native result has at most 60,000 peaks. Retain only the most recent songs.
      if (waveformCache.size > 8) waveformCache.delete(waveformCache.keys().next().value!);
      return data;
    })
    .finally(() => {
      if (waveformRequestCache.get(cacheKey)?.controller === controller) waveformRequestCache.delete(cacheKey);
    });
  const request = { promise, controller, consumers: 1 };
  waveformRequestCache.set(cacheKey, request);
  return request;
};

export const useWaveformData = (
  audioUri: string | null,
  resolution: WaveformResolution = 'detailed',
) => {
  const switchPhase = useStudioStore(state => state.switchPhase);
  // A new URI is published before Expo Audio confirms that its player has loaded. Starting a
  // second AVAssetReader at that point can contend with playback setup for the same file and make
  // the Music Library transaction appear hung. Decode only after the switch coordinator is idle.
  const readyAudioUri = switchPhase === 'idle' ? audioUri : null;
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    let revealFrame: number | null = null;
    let finishFrame: number | null = null;
    if (!readyAudioUri) {
      setWaveformData(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${resolution}:${readyAudioUri}`;
    const cached = waveformCache.get(cacheKey);
    if (cached) {
      setWaveformData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setWaveformData(null);
    const request = loadWaveform(readyAudioUri, resolution);
    request.promise
      .then(data => {
        if (!active) return;
        // Let the progress state paint before publishing a potentially large peak array. Keep the
        // overlay through that render, then dismiss it on the following frame. This makes native
        // bridge transfer/path construction for long songs read as deliberate work, not a freeze.
        revealFrame = requestAnimationFrame(() => {
          if (!active) return;
          setWaveformData(data);
          finishFrame = requestAnimationFrame(() => {
            if (active) setLoading(false);
          });
        });
      })
      .catch(error => {
        if (active) {
          console.error('Waveform generation error:', error);
          setWaveformData(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
      request.consumers--;
      if (request.consumers === 0 && waveformRequestCache.get(cacheKey) === request) {
        waveformRequestCache.delete(cacheKey);
        request.controller.abort();
      }
      if (revealFrame !== null) cancelAnimationFrame(revealFrame);
      if (finishFrame !== null) cancelAnimationFrame(finishFrame);
    };
  }, [readyAudioUri, resolution]);

  return readyAudioUri ? { waveformData, loading } : { waveformData: null, loading: false };
};

/** Trace both edges once so a tinted waveform has no interior stroke seams. */
export const generateWaveformPath = (
  peaks: number[], width: number, height: number, startTime = 0, duration: number, totalDuration: number,
): string => {
  if (!peaks.length || !(width > 0 && height > 0 && duration > 0 && totalDuration > 0)) return '';
  const start = Math.max(0, startTime);
  const end = Math.min(totalDuration, startTime + duration);
  if (end <= start) return '';

  const first = Math.floor(start / totalDuration * peaks.length);
  const last = Math.min(peaks.length, Math.ceil(end / totalDuration * peaks.length));
  const left = (start - startTime) / duration * width;
  const span = (end - start) / duration * width;
  const columns = Math.min(last - first, Math.max(1, Math.ceil(span)));
  if (!columns) return '';
  const top: string[] = [];
  const bottom: string[] = [];
  for (let column = 0; column < columns; column++) {
    const from = first + Math.floor(column * (last - first) / columns);
    const to = first + Math.floor((column + 1) * (last - first) / columns);
    let peak = 0;
    for (let index = from; index < to; index++) peak = Math.max(peak, peaks[index]);
    const amplitude = Math.min(1, peak) * height * 0.45;
    const x = left + span * column / Math.max(1, columns - 1);
    top.push(`${x},${height / 2 - amplitude}`);
    bottom.push(`${x},${height / 2 + amplitude}`);
    if (columns === 1) {
      top.push(`${left + span},${height / 2 - amplitude}`);
      bottom.push(`${left + span},${height / 2 + amplitude}`);
    }
  }
  return `M${top.join(' L')} L${bottom.reverse().join(' L')} Z`;
};
