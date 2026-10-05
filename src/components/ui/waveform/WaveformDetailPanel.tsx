import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Layer } from '../../../hooks/useStudioStore';
import WaveformCanvas from './WaveformCanvas';
import { waveformDetailPanelStyles as styles } from '../../../styles/components/waveform/waveformDetailPanel';

interface WaveformDetailPanelProps {
  audioUri?: string;
  layers: Layer[];
  onSeek: (position: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  onClose: () => void;
}

const WaveformDetailPanel: React.FC<WaveformDetailPanelProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
  onClose,
}) => {
  return (
    <View style={styles.panel} testID="waveform-detail-panel">
      <View style={styles.header}>
        <Text style={styles.title}>Waveform details</Text>
        <Pressable
          accessibilityLabel="Close waveform details"
          accessibilityRole="button"
          testID="waveform-detail-close"
          style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
          onPress={onClose}
        >
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
      <WaveformCanvas
        audioUri={audioUri}
        layers={layers}
        onSeek={onSeek}
        onScrubStart={onScrubStart}
        onScrubEnd={onScrubEnd}
      />
    </View>
  );
};

export default WaveformDetailPanel;
