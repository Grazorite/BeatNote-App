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

  return { waveformData, loading };
};

export const generateWaveformPath = (peaks: number[], width: number, height: number, startTime: number = 0, duration: number, totalDuration: number): string => {
  if (peaks.length === 0) return '';
  
  const centerY = height / 2;
  const maxHeight = height * 0.45; // Use 45% of height for amplitude
  
  // Calculate which part of the waveform to render based on viewport
  const startRatio = startTime / totalDuration;
  const endRatio = (startTime + duration) / totalDuration;
  const startIndex = Math.floor(startRatio * peaks.length);
  const endIndex = Math.ceil(endRatio * peaks.length);
  
  const visiblePeaks = peaks.slice(startIndex, endIndex);
  if (visiblePeaks.length === 0) return '';
  
  // Adaptive sampling based on width
  const pixelsPerSample = width / visiblePeaks.length;
  const shouldDownsample = pixelsPerSample < 1;
  
  let path = `M 0 ${centerY}`;
  
  if (shouldDownsample) {
    // Downsample when we have more samples than pixels
    const samplesPerPixel = Math.ceil(visiblePeaks.length / width);
    
    for (let x = 0; x < width; x++) {
      const startIdx = Math.floor((x / width) * visiblePeaks.length);
      const endIdx = Math.min(startIdx + samplesPerPixel, visiblePeaks.length);
      
      // Find min/max in this pixel range for better detail
      let min = 1, max = 0;
      for (let i = startIdx; i < endIdx; i++) {
        const peak = visiblePeaks[i];
        min = Math.min(min, peak);
        max = Math.max(max, peak);
      }
      
      const minY = centerY - (min * maxHeight);
      const maxY = centerY - (max * maxHeight);
      const minYBottom = centerY + (min * maxHeight);
      const maxYBottom = centerY + (max * maxHeight);
      
      // Draw vertical line from min to max
      path += ` L ${x} ${maxY} L ${x} ${maxYBottom} L ${x} ${minYBottom} L ${x} ${minY}`;
    }
  } else {
    // Upsample when we have fewer samples than pixels
    for (let i = 0; i < visiblePeaks.length; i++) {
      const x = (i / (visiblePeaks.length - 1)) * width;
      const amplitude = visiblePeaks[i] * maxHeight;
      const y1 = centerY - amplitude;
      const y2 = centerY + amplitude;
      
      if (i === 0) {
        path = `M ${x} ${centerY}`;
      }
      
      path += ` L ${x} ${y1} L ${x} ${y2} L ${x} ${centerY}`;
    }
  }
  
  return path;
};
