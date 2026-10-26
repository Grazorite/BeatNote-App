import React from 'react';
import { Platform, View } from 'react-native';
import Svg, { Line, Text } from 'react-native-svg';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { rhythmicGridStyles as styles } from '../../../styles/components/waveform/rhythmicGrid';
import { colors, dimensions } from '../../../styles/common';

interface RhythmicGridProps {
  width: number;
  pixelsPerSecond: number;
  overlayHeight?: number;
  showRuler?: boolean;
}

const RhythmicGrid: React.FC<RhythmicGridProps> = ({ width, pixelsPerSecond, overlayHeight = 300, showRuler = true }) => {
  // Optimized Zustand selectors
  const bpm = useStudioStore(state => state.bpm);
  const viewportStartTime = useStudioStore(state => state.viewportStartTime);
  const viewportDuration = useStudioStore(state => state.viewportDuration);
  const showGridLines = useStudioStore(state => state.showGridLines);
  const countSize = useStudioStore(state => state.countSize);
  
  const { rulerLines, majorLines } = React.useMemo(() => {
    const pixelsPerBeat = (pixelsPerSecond * 60) / bpm;
    const startBeat = Math.floor((viewportStartTime / 1000) * (bpm / 60));
    const endBeat = Math.ceil(((viewportStartTime + viewportDuration) / 1000) * (bpm / 60));
    
    const rulerHeight = dimensions.ruler.height;
    const rulerLines: React.ReactElement[] = [];
    const majorLines: Array<{ x: number; beat: number; isMiddle?: boolean }> = [];
  
    for (let beat = startBeat; beat <= endBeat; beat++) {
      const beatTimeMs = (beat / (bpm / 60)) * 1000;
      const x = ((beatTimeMs - viewportStartTime) / viewportDuration) * width;
      
      if (x >= 0 && x <= width) {
        const isPhraseBoundary = beat % countSize === 0;
        const isMiddleCount = countSize % 2 === 0
          && beat % countSize === countSize / 2;
        
        // Ruler lines (all beats)
        rulerLines.push(
          <Line
            key={`ruler-${beat}`}
            x1={x}
            y1={0}
            x2={x}
            y2={isPhraseBoundary ? rulerHeight : (isMiddleCount ? rulerHeight * 0.8 : rulerHeight * 0.6)}
            stroke={isPhraseBoundary ? colors.gridMajor : (isMiddleCount ? colors.gridMiddle : colors.gridMinor)}
            strokeWidth={isPhraseBoundary ? 2 : (isMiddleCount ? 1.5 : 1)}
            opacity={0.8}
          />
        );
        
        // Add measure numbers to ruler for major lines
        if (isPhraseBoundary) {
          rulerLines.push(
            <Text
              key={`measure-${beat}`}
              x={x + 3}
              y={rulerHeight - 3}
              fill={colors.text}
              fontSize={10}
              opacity={0.8}
              filter={Platform.OS === 'web' ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' : undefined}
            >
              {beat + 1}
            </Text>
          );
        }
        
        // Phrase boundaries extend into the waveform with the strongest weight.
        if (isPhraseBoundary) {
          majorLines.push({ x, beat });
        }
        
        if (isMiddleCount) {
          majorLines.push({ x, beat, isMiddle: true });
        }
      }
    }
    
    return { rulerLines, majorLines };
  }, [width, pixelsPerSecond, bpm, countSize, viewportStartTime, viewportDuration]);
  
  return (
    <View>
      {/* Ruler bar */}
      {showRuler && (
        <Svg width={width} height={dimensions.ruler.height} style={styles.ruler}>
          {rulerLines}
        </Svg>
      )}
      
      {/* Major lines overlay for waveform */}
      {showGridLines && overlayHeight > 0 && (
        <Svg width={width} height={overlayHeight} style={styles.majorLines}>
          {majorLines.map(({ x, beat, isMiddle }: { x: number; beat: number; isMiddle?: boolean }) => (
            <Line
              key={`major-${beat}`}
              x1={x}
              y1={0}
              x2={x}
              y2={overlayHeight}
              stroke={isMiddle ? colors.gridMinor : colors.gridMajor}
              strokeWidth={1}
              opacity={isMiddle ? 0.2 : 0.3}
            />
          ))}
        </Svg>
      )}
    </View>
  );
};



// Memoize RhythmicGrid to prevent re-renders when only playhead changes
export default React.memo(RhythmicGrid, (prevProps, nextProps) => {
  return (
    prevProps.width === nextProps.width &&
    prevProps.pixelsPerSecond === nextProps.pixelsPerSecond &&
    prevProps.overlayHeight === nextProps.overlayHeight &&
    prevProps.showRuler === nextProps.showRuler
  );
});
