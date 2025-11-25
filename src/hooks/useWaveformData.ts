import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export interface WaveformData {
  peaks: number[];
  duration: number;
}

const generateWaveformWeb = async (audioUri: string): Promise<WaveformData> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUri);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Use all channels for better representation
    const channelCount = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    
    // Calculate optimal sample count based on duration (aim for ~2-4 samples per pixel)
    const targetSamplesPerSecond = Math.min(200, Math.max(50, duration > 60 ? 100 : 150));
    const samples = Math.floor(duration * targetSamplesPerSecond);
    const samplesPerBlock = Math.floor(audioBuffer.length / samples);
    
    const peaks: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      const startSample = i * samplesPerBlock;
      const endSample = Math.min(startSample + samplesPerBlock, audioBuffer.length);
      
      let maxPeak = 0;
      let rmsSum = 0;
      let sampleCount = 0;
      
      // Process all channels
      for (let channel = 0; channel < channelCount; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        
        for (let j = startSample; j < endSample; j++) {
          const sample = channelData[j] || 0;
          const absSample = Math.abs(sample);
          
          // Track peak
          maxPeak = Math.max(maxPeak, absSample);
          
          // RMS calculation
          rmsSum += sample * sample;
          sampleCount++;
        }
      }
      
      // Use RMS for better visual representation, with peak limiting
      const rms = Math.sqrt(rmsSum / sampleCount);
      const normalizedPeak = Math.min(maxPeak * 0.7 + rms * 0.3, 1.0);
      
      peaks.push(normalizedPeak);
    }
    
    // Normalize peaks to prevent clipping
    const maxValue = Math.max(...peaks);
    if (maxValue > 0) {
      const normalizer = 0.95 / maxValue; // Leave 5% headroom
      for (let i = 0; i < peaks.length; i++) {
        peaks[i] *= normalizer;
      }
    }
    
    return { peaks, duration: duration * 1000 };
  } catch (error) {
    console.error('Web waveform generation failed:', error);
    return generateFallbackWaveform();
  }
};

const generateFallbackWaveform = (): WaveformData => {
  const peaks: number[] = [];
  for (let i = 0; i < 4000; i++) {
    const base = Math.sin(i * 0.01) * 0.5;
    const detail = Math.sin(i * 0.03) * 0.3;
    const noise = (Math.random() - 0.5) * 0.2;
    peaks.push(Math.abs(base + detail + noise));
  }
  return { peaks, duration: 180000 };
};

// Simple cache for waveform data
const waveformCache = new Map<string, WaveformData>();

export const useWaveformData = (audioUri: string | null) => {
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!audioUri) {
      setWaveformData(null);
      return;
    }

    // Check cache first
    const cached = waveformCache.get(audioUri);
    if (cached) {
      setWaveformData(cached);
      return;
    }

    setLoading(true);
    
    const generateWaveform = async () => {
      try {
        let data: WaveformData;
        if (Platform.OS === 'web') {
          data = await generateWaveformWeb(audioUri);
        } else {
          // Mobile fallback - in production, use server-side processing
          data = generateFallbackWaveform();
        }
        
        // Cache the result
        waveformCache.set(audioUri, data);
        setWaveformData(data);
      } catch (error) {
        console.error('Waveform generation error:', error);
        const fallback = generateFallbackWaveform();
        waveformCache.set(audioUri, fallback);
        setWaveformData(fallback);
      } finally {
        setLoading(false);
      }
    };

    generateWaveform();
  }, [audioUri]);

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