import { StyleSheet } from 'react-native';

import { colors, dimensions } from '../../common';

export const aboutSettingsStyles = StyleSheet.create({
  stack: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  stackPage: {
    ...StyleSheet.absoluteFillObject,
  },
  identity: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 22,
    marginBottom: 18,
  },
  sparkle: {
    position: 'absolute',
    top: 38,
    left: 38,
    width: 20,
    height: 20,
  },
  appName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  version: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  aboutContent: {
    flexGrow: 1,
  },
  feedbackButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: dimensions.borderRadius,
  },
  feedbackText: {
    color: colors.onAccent,
    fontSize: 15,
    fontWeight: '600',
  },
  licencesLink: {
    alignSelf: 'center',
    marginTop: 'auto',
    minHeight: 44,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  licencesLinkText: {
    color: colors.textSecondary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  privacyCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  privacyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  privacyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  licenceIntro: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  licenceCard: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: dimensions.borderRadius,
  },
  licenceHeader: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  licenceBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  licenceTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  licencePackages: {
    color: colors.accent,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  licenceNotice: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
