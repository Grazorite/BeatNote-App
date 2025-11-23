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
    
    const channelData = audioBuffer.getChannelData(0);
    const samples = 4000; // Higher resolution for full waveform
    const blockSize = Math.floor(channelData.length / samples);
    const peaks: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(channelData[i * blockSize + j] || 0);
      }
      peaks.push(sum / blockSize);
    }
    
    return { peaks, duration: audioBuffer.duration * 1000 };
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
  const maxAmplitude = Math.max(...peaks);
  const scale = maxAmplitude > 0 ? (height * 0.4) / maxAmplitude : 1;
  
  // Calculate which part of the waveform to render based on viewport
  const startRatio = startTime / totalDuration;
  const endRatio = (startTime + duration) / totalDuration;
  const startIndex = Math.floor(startRatio * peaks.length);
  const endIndex = Math.ceil(endRatio * peaks.length);
  
  const visiblePeaks = peaks.slice(startIndex, endIndex);
  if (visiblePeaks.length === 0) return '';
  
  let path = `M 0 ${centerY}`;
  
  for (let i = 0; i < visiblePeaks.length; i++) {
    const x = (i / visiblePeaks.length) * width;
    const amplitude = visiblePeaks[i] * scale;
    const y1 = centerY - amplitude;
    const y2 = centerY + amplitude;
    
    path += ` L ${x} ${y1} L ${x} ${y2} L ${x} ${centerY}`;
  }
  
  return path;
};