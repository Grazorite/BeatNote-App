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
          <Text style={styles.text}>1. Tap Choose Music. Pick a song from your library or import one from Files.</Text>
          <Text style={styles.text}>2. Play the song and tap Add Marker on a beat you want to remember.</Text>
          <Text style={styles.text}>3. At the marker, tap Annotation and write your cue.</Text>
          <Text style={styles.text}>4. Tap Save Project in the top bar.</Text>
        </Section>

        <Section title="Playback & Markers">
          <Text style={styles.text}>Use Previous Marker or Next Marker to jump to a cue. At a marker, Add Marker becomes Remove.</Text>
          <Text style={styles.text}>Tap Inner Loop to cycle between Off, Between Markers and Selected Range.</Text>
          <Text style={styles.text}>Hold Delete Previous to restore a marker or delete all earlier markers.</Text>
        </Section>

        <Section title="Music Library">
          <Text style={styles.text}>Importing makes a copy in BeatNote. Your original stays in Files.</Text>
          <Text style={styles.text}>Choose Custom Order and drag a song by its handle. You can switch sort order and come back to your arrangement.</Text>
          <Text style={styles.text}>Change what the track buttons do in Settings under Button Configuration.</Text>
        </Section>

        <Section title="Waveform & Overview">
          <Text style={styles.text}>Tap or drag the timeline to move through the song. Drag the overview handles to set a loop.</Text>
          <Text style={styles.text}>Turn on Show waveform in Display & Annotations to see the shape of the music.</Text>
          <Text style={styles.text}>During playback, each note appears when the playhead crosses its marker.</Text>
        </Section>

        <Section title="Tempo & Dance Counts">
          <Text style={styles.text}>In Pro, tap the BPM button beside the song title, or open Timing & BPM in Settings. Preview the suggested tempo before you apply it.</Text>
          <Text style={styles.text}>To line up a phrase, move the playhead to its first beat and tap Set Count 1 Here. Use the arrows for small adjustments.</Text>
          <Text style={styles.text}>Choose 4, 6 or 8 counts per phrase. Show dance grid draws dotted beats and a brighter line on Count 1, even with the waveform hidden. Show dance counts displays the phrase and count as you rehearse.</Text>
        </Section>

        <Section title="Projects & CSV">
          <Text style={styles.text}>Open Projects to save a version, return to a saved project or import markers from a BeatNote CSV.</Text>
        </Section>

        <Section title="Export Options">
          <Text style={styles.text}>Choose CSV for marker times, bars, beats, dance counts and notes.</Text>
          <Text style={styles.text}>Choose PDF for a printable rehearsal sheet. Select the sections you want, then tap Export PDF.</Text>
          <Text style={styles.text}>In the share sheet, choose AirDrop, Save to Files or another destination.</Text>
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
