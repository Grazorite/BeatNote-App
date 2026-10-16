import React from 'react';
import { Modal, Platform, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BeatNoteIcon } from '../../icons';
import { helpScreenStyles as styles } from '../../../styles/components/screens/helpScreen';
import GlassBackdrop from '../controls/GlassBackdrop';
import { colors } from '../../../styles/common';

interface HelpScreenProps {
  visible: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ visible, onClose, embedded = false }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = Platform.OS === 'web' ? width < 768 : Math.min(width, height) < 768;

  const content = (
      <View style={[styles.overlay, isMobile && styles.mobileOverlay]}>
        <View style={[styles.modal, isMobile && styles.mobileModal]} testID="help-page">
      <GlassBackdrop gradientId="help-modal-glass" radius={isMobile ? 0 : 16} testID="help-modal-glass" />
      <View style={[
        styles.header,
        isMobile && styles.mobileHeader,
        isMobile && {
          paddingTop: Math.max(insets.top, 12),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}>
        <View style={styles.titleContainer}>
          <BeatNoteIcon name="help" size={24} color={colors.accent} />
          <Text style={styles.title}>
            Help & Shortcuts
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close help"
          testID="help-close"
        >
          {embedded && <BeatNoteIcon name="chevron-left" size={16} />}
          <Text style={styles.closeButtonText}>{embedded ? 'Back' : 'Close'}</Text>
        </TouchableOpacity>
      </View>

          <ScrollView
            style={[styles.scrollContainer, isMobile && styles.mobileScrollContainer]}
            contentContainerStyle={[
              styles.scrollContent,
              isMobile && { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
        <Section title="Start a Session">
          <Text style={styles.text}>
            1. Tap the music-note button and choose a song
          </Text>
          <Text style={styles.text}>
            2. Play the song, or tap and drag the waveform to seek
          </Text>
          <Text style={styles.text}>
            3. Add a marker at the playhead
          </Text>
          <Text style={styles.text}>
            4. At that marker, tap Annotation to add a movement cue
          </Text>
          <Text style={styles.text}>
            5. Save the session from the top bar
          </Text>
        </Section>

        <Section title="Mobile Controls">
          <Text style={styles.text}>
            • Previous and Next jump between markers
          </Text>
          <Text style={styles.text}>
            • Add Marker changes to Remove while you are at a marker
          </Text>
          <Text style={styles.text}>
            • Annotation is available only while the playhead is at a marker
          </Text>
          <Text style={styles.text}>
            • Inner Loop cycles through Off, Between Markers, and Selected Range
          </Text>
          <Text style={styles.text}>
            • Hold Delete Previous to restore a deletion or remove all earlier markers
          </Text>
        </Section>

        <Section title="Waveform & Overview">
          <Text style={styles.text}>
            • Tap or drag the waveform to seek without creating a marker
          </Text>
          <Text style={styles.text}>
            • Drag the overview handles to select and adjust a loop range
          </Text>
          <Text style={styles.text}>
            • Timed annotations appear briefly as playback reaches their markers
          </Text>
        </Section>

        <Section title="Keyboard Shortcuts (Web)">
          <ShortcutGroup title="Playback">
            <Shortcut keys="Space" description="Play/Pause" />
            <Shortcut keys="M" description="Add marker at current position" />
            <Shortcut keys="R" description="Toggle repeat mode" />
            <Shortcut keys="L" description="Toggle loop range" />
            <Shortcut keys="Shift + L" description="Toggle loop between markers" />
            <Shortcut keys="[ / ]" description="Set loop start / end at playhead" />
          </ShortcutGroup>

          <ShortcutGroup title="Navigation">
            <Shortcut keys="← →" description="Scroll timeline left/right" />
            <Shortcut keys="↑ ↓" description="Zoom in/out" />
            <Shortcut keys="Ctrl + ←" description="Skip to song start" />
            <Shortcut keys="Ctrl + →" description="Skip to song end" />
            <Shortcut keys="Ctrl + Shift + ←" description="Move to left marker" />
            <Shortcut keys="Ctrl + Shift + →" description="Move to right marker" />
          </ShortcutGroup>

          <ShortcutGroup title="Editing">
            <Shortcut keys="Ctrl + Z" description="Undo last marker" />
            <Shortcut keys="Ctrl + Shift + Z" description="Redo last marker" />
            <Shortcut keys="T" description="Open annotation editing at a marker" />
          </ShortcutGroup>
        </Section>

        <Section title="Export Options">
          <Text style={styles.text}>
            • <Text style={styles.boldText}>CSV Export:</Text> timestamps, BPM-derived bar:beat timing, and annotations
          </Text>
          <Text style={styles.text}>
            On iOS, choose a destination from the share sheet. Web exports download to your browser.
          </Text>
        </Section>

        <Section title="Projects & CSV">
          <Text style={styles.text}>
            • Projects save all markers and settings
          </Text>
          <Text style={styles.text}>
            • Open, rename, or delete saved work from Projects
          </Text>
          <Text style={styles.text}>
            • Data persists between app sessions
          </Text>
          <Text style={styles.text}>
            • Export or import BeatNote CSV files
          </Text>
          <Text style={styles.text}>
            • CSV includes timestamps, BPM-derived bar:beat timing, and annotations
          </Text>
        </Section>
          </ScrollView>
        </View>
      </View>
  );

  if (!visible) return null;
  if (embedded) return content;
  if (isMobile) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      {title}
    </Text>
    {children}
  </View>
);

const ShortcutGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.shortcutGroup}>
    <Text style={styles.shortcutGroupTitle}>
      {title}
    </Text>
    {children}
  </View>
);

const Shortcut: React.FC<{ keys: string; description: string }> = ({ keys, description }) => (
  <View style={styles.shortcutRow}>
    <Text style={styles.shortcutKeys}>
      {keys}
    </Text>
    <Text style={styles.shortcutDescription}>
      {description}
    </Text>
  </View>
);



export default HelpScreen;
