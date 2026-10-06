import { StyleSheet } from 'react-native';
import { dimensions } from '../../common';

export const waveformWorkspaceStyles = StyleSheet.create({
  workspace: {
    width: '100%',
    alignSelf: 'center',
  },
  dockedWorkspace: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: dimensions.spacing.sm,
  },
  wrappedPane: {
    width: '100%',
  },
  wrappedPaneDocked: {
    flex: 1,
    minWidth: 0,
  },
  detailPane: {
    width: '100%',
  },
  detailPaneDocked: {
    flex: 1,
    minWidth: 0,
  },
});
