import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { helpScreenStyles as styles } from '../../../styles/components/screens/helpScreen';
import { useHelpScreenAnimation } from '../../../animations/screens/helpScreenAnimations';

interface HelpScreenProps {
  onClose: () => void;
}

const HelpScreen: React.FC<HelpScreenProps> = ({ onClose }) => {
  const { animatedStyle } = useHelpScreenAnimation();

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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
            2. Select stem count (2, 4, or 6 layers)
          </Text>
          <Text style={styles.text}>
            3. Choose active layer (Vocals, Drums, Bass, etc.)
          </Text>
          <Text style={styles.text}>
            4. Add markers by clicking "TAP" or pressing M
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
            Files are downloaded to your Downloads folder
          </Text>
        </Section>

        <Section title="Layer System">
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Vocals:</Text> Red full-height lines
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Drums:</Text> Cyan thick lines (top)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Bass:</Text> Purple lines (bottom)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Piano:</Text> Yellow circles (center)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Guitar:</Text> Brown circles (center-bottom)
          </Text>
          <Text style={styles.text}>
            • <Text style={styles.boldText}>Other:</Text> Orange circles (bottom)
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
        </Section>
      </ScrollView>
    </Animated.View>
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