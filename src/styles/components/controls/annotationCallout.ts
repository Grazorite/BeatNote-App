import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const annotationCalloutStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    alignSelf: 'center',
    zIndex: 12,
    width: '62%',
    maxWidth: 280,
    minHeight: 36,
    maxHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
