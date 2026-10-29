import React from 'react';
import { Modal, type ModalProps } from 'react-native';

export const APP_MODAL_ORIENTATIONS: NonNullable<ModalProps['supportedOrientations']> = [
  'portrait',
  'portrait-upside-down',
  'landscape-left',
  'landscape-right',
];

/** Native modal host that preserves BeatNote's portrait and landscape orientation contract. */
const AppModal: React.FC<ModalProps> = ({
  supportedOrientations = APP_MODAL_ORIENTATIONS,
  ...props
}) => (
  <Modal supportedOrientations={supportedOrientations} {...props} />
);

export default AppModal;
