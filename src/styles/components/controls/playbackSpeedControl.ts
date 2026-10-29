import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const playbackSpeedControlStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  label: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  chooser: {
    position: 'absolute',
    bottom: 50,
    right: -46,
    width: 280,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    zIndex: 30,
  },
  /** Slightly stronger glass: a translucent layer in the theme surface token laid behind
   *  the GlassBackdrop gradient so the chooser reads less washed-out while keeping the
   *  glass visual. */
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceGlass,
    opacity: 0.85,
    borderRadius: 14,
    zIndex: 0,
  },
  compactChooser: {
    bottom: -52,
    right: 52,
    width: 270,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  currentValue: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '800',
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderColumn: {
    flex: 1,
    minWidth: 0,
  },
  stepButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    backgroundColor: colors.surfaceRaised,
  },
  stepButtonDisabled: {
    opacity: 0.35,
  },
  stepButtonText: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '700',
  },
  sliderTouchArea: {
    height: 38,
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  sliderTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderEmphasis,
  },
  sliderFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    width: 21,
    height: 21,
    marginLeft: -10.5,
    borderRadius: 11,
    backgroundColor: colors.text,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginTop: -3,
    marginBottom: 10,
  },
  rangeLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  option: {
    width: '23%',
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceGlass,
  },
  optionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  optionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: colors.onAccent,
  },
  reset: {
    minHeight: 40,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderEmphasis,
    backgroundColor: colors.surfaceRaised,
  },
  resetText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
