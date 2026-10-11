import { StyleSheet } from 'react-native';

import { colors } from '../../common';

export const loopOverviewTrackStyles = StyleSheet.create({
  track: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: colors.loopTrack,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
  },
});
