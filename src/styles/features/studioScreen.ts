import { StyleSheet } from 'react-native';
import { colors } from '../common';

export const studioScreenStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewCollapsed: {
    marginLeft: 60,
  },
  scrollViewExpanded: {
    marginLeft: 280,
  },
  scrollContent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 50,
    paddingTop: 20,
  },
});