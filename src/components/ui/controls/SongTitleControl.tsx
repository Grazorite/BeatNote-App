import React, { forwardRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { songTitleControlStyles as styles } from '../../../styles/components/controls/songTitleControl';
import { colors } from '../../../styles/common';
import { MAX_TEXT_SCALE } from '../../../utils/libraryConstants';
import { BeatNoteIcon } from '../../icons';

export interface SongTitleControlProps {
  isMobile: boolean;
  onOpen: () => void;
}

const SongTitleControl = forwardRef<
  React.ElementRef<typeof TouchableOpacity>,
  SongTitleControlProps
>(({ isMobile, onOpen }, ref) => {
  const [focused, setFocused] = useState(false);
  const currentMusicItemId = useStudioStore(state => state.currentMusicItemId);
  const currentItem = useStudioStore(state => (
    state.currentMusicItemId === null
      ? null
      : state.libraryItems[state.currentMusicItemId] ?? null
  ));
  const title = currentItem?.displayTitle ?? 'Choose Music';
  const missing = currentItem?.availability === 'missing';
  const accessibilityLabel = currentMusicItemId === null || currentItem === null
    ? 'Music library, no song chosen'
    : `Music library, current song ${currentItem.displayTitle}${missing ? ', audio missing' : ''}`;

  return (
    <TouchableOpacity
      ref={ref}
      style={[
        styles.control,
        isMobile ? styles.controlMobile : styles.controlDesktop,
        focused && styles.controlFocused,
      ]}
      onPress={onOpen}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens your music library"
      accessibilityState={{ disabled: false }}
      testID="song-title-control"
    >
      <Text
        style={styles.title}
        numberOfLines={1}
        ellipsizeMode="tail"
        maxFontSizeMultiplier={MAX_TEXT_SCALE}
      >
        {title}
      </Text>
      {missing && (
        <View style={styles.missing} accessible={false}>
          <BeatNoteIcon name="warning" size={18} color={colors.iconDestructive} />
          <Text
            style={styles.missingText}
            numberOfLines={1}
            maxFontSizeMultiplier={MAX_TEXT_SCALE}
          >
            Missing
          </Text>
        </View>
      )}
      <View style={styles.chevron} accessible={false}>
        <BeatNoteIcon name="chevron-down" size={18} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
});

SongTitleControl.displayName = 'SongTitleControl';

export default React.memo(SongTitleControl);
