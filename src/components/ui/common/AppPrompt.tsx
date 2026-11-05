import React, { useLayoutEffect, useRef } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { create } from 'zustand';
import { confirmDialogStyles as styles } from '../../../styles/components/modals/confirmDialog';
import GlassBackdrop from '../controls/GlassBackdrop';
import { useMotionPreference } from '../../../animations/MotionPreference';

interface PromptAction {
  text: string;
  style?: 'cancel' | 'destructive' | 'default';
  onPress?: () => void;
}
interface Prompt {
  title: string;
  message?: string;
  actions: PromptAction[];
}
const usePrompts = create<{ queue: Prompt[]; hosts: symbol[] }>(() => ({ queue: [], hosts: [] }));

export function showPrompt(title: string, message?: string, actions: PromptAction[] = [{ text: 'OK' }]) {
  usePrompts.setState(state => ({ queue: [...state.queue, { title, message, actions }] }));
}

// Present from the current modal on iOS, including prompts launched by a sheet.
export function AppPromptHost({ root = false }: { root?: boolean }) {
  const id = useRef(Symbol('prompt host')).current;
  useLayoutEffect(() => {
    if (root) return;
    usePrompts.setState(state => ({ hosts: [...state.hosts, id] }));
    return () => usePrompts.setState(state => ({ hosts: state.hosts.filter(host => host !== id) }));
  }, [id, root]);
  const prompt = usePrompts(state => (root ? !state.hosts.length : state.hosts.at(-1) === id)
    ? state.queue[0] : undefined);
  const reduced = useMotionPreference();
  if (!prompt) return null;
  const choose = (action?: PromptAction) => {
    if (usePrompts.getState().queue[0] !== prompt) return;
    usePrompts.setState(state => ({ queue: state.queue.slice(1) }));
    action?.onPress?.();
  };
  const cancel = prompt.actions.find(action => action.style === 'cancel');
  return (
    <Modal transparent visible accessibilityViewIsModal animationType={reduced === false ? 'fade' : 'none'}
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape-left', 'landscape-right']}
      onRequestClose={() => choose(cancel ?? (prompt.actions.length === 1 ? prompt.actions[0] : undefined))}>
      <View style={styles.overlay} testID="app-prompt">
        <View style={[styles.container, { maxHeight: '100%' }]}>
          <GlassBackdrop gradientId="app-prompt-glass" radius={16} />
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled">
            <Text accessibilityRole="header" style={styles.title}>{prompt.title}</Text>
            {prompt.message ? <Text selectable style={styles.message}>{prompt.message}</Text> : null}
            <View style={styles.actions}>
              {prompt.actions.map(action => (
                <TouchableOpacity key={action.text} accessibilityRole="button" onPress={() => choose(action)}
                  style={[styles.button, action.style === 'destructive' && styles.destructiveButton,
                    action.style === 'cancel' && styles.cancelButton]}>
                  <Text style={[styles.buttonText, !action.style && styles.primaryButtonText]}>{action.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
