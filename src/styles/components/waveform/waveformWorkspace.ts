import { StyleSheet } from 'react-native';
import { dimensions } from '../../common';

export const waveformWorkspaceStyles = StyleSheet.create({
  workspace: {
    width: '100%',
    alignSelf: 'center',
  },
  dockedWorkspace: {
    gap: dimensions.spacing.sm,
  },
  wrappedPane: {
    width: '100%',
  },
  detailPane: {
    width: '100%',
  },
  detailPaneDocked: {
    width: '100%',
  },
});
