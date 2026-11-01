import React from 'react';
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { helpScreenStyles as styles } from '../../../styles/components/screens/helpScreen';
import GlassBackdrop from '../controls/GlassBackdrop';
import AppModal from '../common/AppModal';
import HeaderBackButton from '../common/HeaderBackButton';

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
        <HeaderBackButton
          onPress={onClose}
          accessibilityLabel={embedded
            ? 'Back to Settings from Help and Support'
            : 'Back from Help and Support'}
          label={embedded ? 'Settings' : 'Back'}
          testID="help-close"
        />
        <Text style={styles.title} numberOfLines={1} testID="help-title">Help & Support</Text>
        <View style={styles.headerSide} />
      </View>

          <ScrollView
            style={[styles.scrollContainer, isMobile && styles.mobileScrollContainer]}
            contentContainerStyle={[
              styles.scrollContent,
              isMobile && { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
        <Section title="Start on iPhone">
          <Text style={styles.text}>
            1. Tap Choose Music, then import an audio file from Files or choose one from your library
          </Text>
          <Text style={styles.text}>
            2. Play the song, or tap and drag the timeline to seek
          </Text>
          <Text style={styles.text}>
            3. Add a marker at the playhead
          </Text>
          <Text style={styles.text}>
            4. At that marker, tap Annotation to add a movement cue
          </Text>
          <Text style={styles.text}>
            5. Save your project from the top bar
          </Text>
        </Section>

        <Section title="Playback & Markers">
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

        <Section title="Music Library">
          <Text style={styles.text}>
            • Track Previous/Next also seek by the signed seconds shown below each icon; choose tap and hold behaviour in Settings → Buttons
          </Text>
          <Text style={styles.text}>
            • Imported audio is copied into BeatNote; deleting it from BeatNote does not delete the original in Files
          </Text>
          <Text style={styles.text}>
            • Choose Custom Order, then drag the reorder handle beside a song to arrange your library
          </Text>
          <Text style={styles.text}>
            • Your custom order is saved even when you temporarily sort by title, date, or duration
          </Text>
        </Section>

        <Section title="Waveform & Overview">
          <Text style={styles.text}>
            • Tap or drag the timeline to seek without creating a marker
          </Text>
          <Text style={styles.text}>
            • Waveform artwork can be switched on in Settings and is off by default
          </Text>
          <Text style={styles.text}>
            • Solid timing bars keep seeking, markers, loops, and the playhead available when it is off
          </Text>
          <Text style={styles.text}>
            • Drag the overview handles to select and adjust a loop range
          </Text>
          <Text style={styles.text}>
            • Timed annotations appear briefly as playback reaches their markers
          </Text>
        </Section>

        <Section title="Tempo & Dance Counts">
          <Text style={styles.text}>
            • BeatNote may offer a local BPM and beat-anchor suggestion after import
          </Text>
          <Text style={styles.text}>
            • Preview a suggestion before applying it; analysis never changes your grid silently
          </Text>
          <Text style={styles.text}>
            • Use manual BPM, Set Count 1 Here, and anchor nudges whenever the suggestion needs correction
          </Text>
          <Text style={styles.text}>
            • Choose 4, 6, or 8 counts and show or hide dance-count guidance from Settings
          </Text>
        </Section>

        <Section title="Export Options">
          <Text style={styles.text}>
            • <Text style={styles.boldText}>CSV Export:</Text> timestamps, BPM-derived bar:beat timing, and annotations
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>PDF Export:</Text> a printable choreography sheet with selectable timeline, marker, count-grid, and notes sections
          </Text>
          <Text style={styles.text}>
            Choose Save to Files, AirDrop, or another destination from the iOS share sheet.
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
    <AppModal
      visible
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      {content}
    </AppModal>
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



export default HelpScreen;
