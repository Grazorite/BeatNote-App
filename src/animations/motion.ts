import { Easing } from 'react-native-reanimated';

/** Durations in milliseconds for movements that serve the same purpose. */
export const controlMs = 160;
export const feedbackMs = 180;
export const controlTransition = { duration: controlMs, easing: Easing.out(Easing.cubic) };
export const pageTransition = { duration: 280, easing: Easing.out(Easing.cubic) };
