import { useState, useEffect } from 'react';
import { extractWaveform, WaveformResolution } from '../services/waveformExtraction';

export interface WaveformData {
  peaks: number[];
  duration: number;
  source: 'decoded';
}

// Simple cache for waveform data
const waveformCache = new Map<string, WaveformData>();
const waveformRequestCache = new Map<string, Promise<WaveformData | null>>();

const loadWaveform = (
  audioUri: string,
  resolution: WaveformResolution,
): Promise<WaveformData | null> => {
  const cacheKey = `${resolution}:${audioUri}`;
  const cached = waveformCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  const pending = waveformRequestCache.get(cacheKey);
  if (pending) return pending;

  const request = extractWaveform({ audioUri, resolution })
    .then(result => {
      if (!result || result.peaks.length === 0) return null;
      const data: WaveformData = { ...result, source: 'decoded' };
      waveformCache.set(cacheKey, data);
      return data;
    })
    .finally(() => waveformRequestCache.delete(cacheKey));
  waveformRequestCache.set(cacheKey, request);
  return request;
};

export const useWaveformData = (
  audioUri: string | null,
  resolution: WaveformResolution = 'detailed',
) => {
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (!audioUri) {
      setWaveformData(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${resolution}:${audioUri}`;
    const cached = waveformCache.get(cacheKey);
    if (cached) {
      setWaveformData(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setWaveformData(null);
    loadWaveform(audioUri, resolution)
      .then(data => {
        if (active) setWaveformData(data);
      })
      .catch(error => {
        console.error('Waveform generation error:', error);
        if (active) setWaveformData(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [audioUri, resolution]);

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
