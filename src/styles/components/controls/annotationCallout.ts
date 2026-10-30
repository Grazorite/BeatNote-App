import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const annotationCalloutStyles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '62%',
    maxWidth: 280,
    minHeight: 36,
    maxHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  floating: {
    position: 'absolute',
    bottom: '100%',
    zIndex: 12,
    marginBottom: 6,
  },
  stacked: {
    position: 'relative',
    zIndex: 1,
  },
  text: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
