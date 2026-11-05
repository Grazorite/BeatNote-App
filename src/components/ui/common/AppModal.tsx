import React from 'react';
import { AppPromptHost } from './AppPrompt';
import { Modal, type ModalProps } from 'react-native';
import { useMotionPreference } from '../../../animations/MotionPreference';

export const APP_MODAL_ORIENTATIONS: NonNullable<ModalProps['supportedOrientations']> = [
  'portrait',
  'portrait-upside-down',
  'landscape-left',
  'landscape-right',
];

/** Native modal host that preserves BeatNote's portrait and landscape orientation contract. */
const AppModal: React.FC<ModalProps> = ({
  supportedOrientations = APP_MODAL_ORIENTATIONS,
  animationType,
  ...props
}) => {
  const reduced = useMotionPreference();
  return <Modal {...props} supportedOrientations={supportedOrientations}
    animationType={reduced === false ? animationType : 'none'}>
    {props.children}
    {props.visible !== false && <AppPromptHost />}
  </Modal>;
};

export default AppModal;
