import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { BeatNoteIcon } from '../../icons';
import { helpScreenStyles as styles } from '../../../styles/components/screens/helpScreen';
import GlassBackdrop from '../controls/GlassBackdrop';
import { colors } from '../../../styles/common';

interface HelpScreenProps {
  visible: boolean;
  onClose: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
      <GlassBackdrop gradientId="help-modal-glass" radius={16} testID="help-modal-glass" />
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BeatNoteIcon name="help" size={24} color={colors.accent} />
          <Text style={styles.title}>
            BeatNote Help
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>

          <ScrollView style={styles.scrollContainer}>
        <Section title="Getting Started">
          <Text style={styles.text}>
            1. Choose an audio file from the top bar
          </Text>
          <Text style={styles.text}>
            2. Play or scrub to a moment you want to mark
          </Text>
          <Text style={styles.text}>
            3. Add a marker and type a movement cue or note
          </Text>
          <Text style={styles.text}>
            4. Save your work as a BeatNote project
          </Text>
        </Section>

        <Section title="Keyboard Shortcuts">
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
            <Shortcut keys="T" description="Focus text input field" />
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

        <Section title="Annotation Lane">
          <Text style={styles.text}>
            V1 uses one annotation lane for all markers and movement notes.
          </Text>
        </Section>

        <Section title="Project Management">
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
        </Section>
          </ScrollView>
        </View>
      </View>
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
