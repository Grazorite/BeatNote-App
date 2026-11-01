import React from 'react';
import { Text, View } from 'react-native';
import type { Layer } from '../../../hooks/useStudioStore';
import WaveformCanvas from './WaveformCanvas';
import { waveformDetailPanelStyles as styles } from '../../../styles/components/waveform/waveformDetailPanel';
import HeaderBackButton from '../common/HeaderBackButton';

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
        <HeaderBackButton
          accessibilityLabel="Back from waveform details"
          label="Back"
          testID="waveform-detail-close"
          onPress={onClose}
        />
        <Text style={styles.title}>Waveform details</Text>
        <View style={styles.headerSide} />
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
