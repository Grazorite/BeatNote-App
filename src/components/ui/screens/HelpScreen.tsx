import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { helpScreenStyles as styles } from '../../../styles/components/screens/helpScreen';

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
      <View style={styles.header}>
        <Text style={styles.title}>
          BeatNote Help
        </Text>
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
            1. Load an audio file using "Load Song"
          </Text>
          <Text style={styles.text}>
            2. Select stem count (2, 4, or 6 layers) from sidebar
          </Text>
          <Text style={styles.text}>
            3. Choose active layer from horizontal selector
          </Text>
          <Text style={styles.text}>
            4. Add markers by clicking add markers button or pressing M
          </Text>
        </Section>

        <Section title="Keyboard Shortcuts">
          <ShortcutGroup title="Playback">
            <Shortcut keys="Space" description="Play/Pause" />
            <Shortcut keys="M" description="Add marker at current position" />
            <Shortcut keys="R" description="Toggle repeat mode" />
            <Shortcut keys="L" description="Toggle loop marker mode" />
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
            • <Text style={styles.boldText}>MIDI Export:</Text> For Logic Pro, Ableton, Pro Tools
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>CSV Export:</Text> For Excel, Adobe Audition
          </Text>
          <Text style={styles.text}>
            Files are saved to your Downloads folder
          </Text>
        </Section>

        <Section title="Layer System">
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Vocals:</Text> Red full-height lines (y: 0-300)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Drums:</Text> Cyan thick lines (y: 0-100, top section)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Bass:</Text> Purple lines (y: 200-300, bottom section)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Piano:</Text> Yellow circles (center, y: 150)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Guitar:</Text> Light brown circles (y: 220, center-bottom)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Other:</Text> Pink circles (y: 30, top)
          </Text>
        </Section>

        <Section title="Project Management">
          <Text style={styles.text}>
            • Projects save all markers and settings
          </Text>
          <Text style={styles.text}>
            • Audio files must be reloaded when opening projects
          </Text>
          <Text style={styles.text}>
            • Data persists between app sessions
          </Text>
          <Text style={styles.text}>
            • Export data as MIDI or CSV files
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