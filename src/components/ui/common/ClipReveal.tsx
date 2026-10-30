import React from 'react';
import { View } from 'react-native';

import { clipRevealStyles as styles } from '../../../styles/components/common/clipReveal';

interface ClipRevealProps {
  /** Visible width from the leading edge. */
  revealWidth: number;
  height: number;
  testID?: string;
  /** Fixed-size content; it must not depend on `revealWidth` so it is never redrawn. */
  children: React.ReactNode;
}

/**
 * Reveal the leading part of static content by clipping a view. Changing the clip width is a
 * compositing operation, unlike an SVG clip path, which forces the clipped geometry to re-rasterise.
 */
const ClipReveal: React.FC<ClipRevealProps> = ({ revealWidth, height, testID, children }) => (
  <View
    pointerEvents="none"
    style={[styles.container, { width: Math.max(0, revealWidth), height }]}
    testID={testID}
  >
    {children}
  </View>
);

export default ClipReveal;
