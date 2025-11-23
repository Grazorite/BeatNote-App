import { StyleSheet } from 'react-native';
import { colors } from '../../common';

export const animatedToggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
  },
});