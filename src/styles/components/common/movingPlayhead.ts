import { StyleSheet } from 'react-native';

/** Width of the static playhead artwork; wide enough for the 6-point underlay and the cap. */
export const MOVING_PLAYHEAD_WIDTH = 12;
export const MOVING_PLAYHEAD_CENTER = MOVING_PLAYHEAD_WIDTH / 2;

export const movingPlayheadStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MOVING_PLAYHEAD_WIDTH,
  },
});
