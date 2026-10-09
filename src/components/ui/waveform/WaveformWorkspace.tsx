import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useWrappedRows } from '../../../hooks/useWrappedRows';
import { waveformWorkspaceStyles as styles } from '../../../styles/components/waveform/waveformWorkspace';
import WaveformDetailPanel from './WaveformDetailPanel';
import WrappedWaveform from './WrappedWaveform';

interface WaveformWorkspaceProps {
  audioUri: string | null;
  layers: Layer[];
  onSeek: (positionMs: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  isMobile: boolean;
  isLandscape: boolean;
}

const WaveformWorkspace: React.FC<WaveformWorkspaceProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
  isMobile,
  isLandscape,
}) => {
  const primaryView = useStudioStore(state => state.primaryView);
  const selectedRowIndex = useStudioStore(state => state.selectedRowIndex);
  const setPrimaryView = useStudioStore(state => state.setPrimaryView);
  const setSelectedRowIndex = useStudioStore(state => state.setSelectedRowIndex);
  const setViewportDuration = useStudioStore(state => state.setViewportDuration);
  const setViewportStartTime = useStudioStore(state => state.setViewportStartTime);
  const { rows, activeRowIndex } = useWrappedRows(1, isLandscape);
  const showDockedDetail = primaryView === 'detail' && (!isMobile || isLandscape);
  const showWrapped = primaryView === 'wrapped' || showDockedDetail;
  const showDetail = primaryView === 'detail';

  const selectRowForDetail = useCallback((rowIndex: number) => {
    const row = rows[rowIndex];
    if (!row) return;
    setSelectedRowIndex(rowIndex);
    setViewportDuration(row.endMs - row.startMs);
    setViewportStartTime(row.startMs);
    setPrimaryView('detail');
  }, [rows, setPrimaryView, setSelectedRowIndex, setViewportDuration, setViewportStartTime]);

  useEffect(() => {
    if (primaryView !== 'detail' || rows.length === 0) return;
    const nextIndex = selectedRowIndex == null
      ? Math.max(0, activeRowIndex)
      : Math.min(Math.max(0, selectedRowIndex), rows.length - 1);
    if (nextIndex !== selectedRowIndex) selectRowForDetail(nextIndex);
  }, [activeRowIndex, primaryView, rows.length, selectRowForDetail, selectedRowIndex]);

  const closeDetail = useCallback(() => {
    setPrimaryView('wrapped');
  }, [setPrimaryView]);

  return (
    <View
      style={[styles.workspace, isMobile && styles.workspaceMobile, showDockedDetail && styles.dockedWorkspace]}
      testID="waveform-workspace"
    >
      {showWrapped && (
        <View style={[styles.wrappedPane, isMobile && styles.paneMobile, showDockedDetail && styles.wrappedPaneDocked]}>
          <WrappedWaveform
            audioUri={audioUri || undefined}
            layers={layers}
            onSeek={onSeek}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            onSelectForDetail={selectRowForDetail}
            isMobile={isMobile}
          />
        </View>
      )}
      {showDetail && (
        <View style={[styles.detailPane, isMobile && styles.paneMobile, showDockedDetail && styles.detailPaneDocked]}>
          <WaveformDetailPanel
            audioUri={audioUri || undefined}
            layers={layers}
            onSeek={onSeek}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            onClose={closeDetail}
          />
        </View>
      )}
    </View>
  );
};

export default React.memo(WaveformWorkspace);
