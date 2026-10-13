import { StyleSheet } from 'react-native';

export const loopRangeOverviewStyles = StyleSheet.create({
  root: {
    width: '100%',
    height: 36,
    position: 'relative',
    overflow: 'visible',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  trackRegion: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  gestureSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  actionSlot: {
    width: 42,
    marginLeft: 4,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  accessibleSummary: {
    position: 'absolute',
    width: 1,
    height: 1,
    // Keep the summary effectively invisible without dropping it from iOS's accessibility tree.
    opacity: 0.01,
  },
  accessibleAction: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
