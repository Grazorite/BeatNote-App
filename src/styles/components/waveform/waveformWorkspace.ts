import { StyleSheet } from 'react-native';
import { dimensions } from '../../common';

export const waveformWorkspaceStyles = StyleSheet.create({
  workspace: {
    width: '100%',
    alignSelf: 'center',
  },
  workspaceMobile: {
    flex: 1,
    minHeight: 0,
  },
  dockedWorkspace: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: dimensions.spacing.sm,
  },
  wrappedPane: {
    width: '100%',
  },
  paneMobile: {
    flex: 1,
    minHeight: 0,
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
