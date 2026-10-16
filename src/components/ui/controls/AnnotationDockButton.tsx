import React from 'react';
import { BeatNoteIcon } from '../../icons';
import { colors } from '../../../styles/common';
import DockButton from './DockButton';

interface AnnotationDockButtonProps {
  enabled: boolean;
  hasAnnotation: boolean;
  compact?: boolean;
  onPress: () => void;
}

/** Open the focused annotation editor only while the playhead is at a marker. */
const AnnotationDockButton: React.FC<AnnotationDockButtonProps> = ({
  enabled,
  hasAnnotation,
  compact,
  onPress,
}) => (
  <DockButton
    compact={compact}
    testID="annotation-control"
    label={enabled ? (hasAnnotation ? 'Edit annotation' : 'Add annotation') : 'Add annotation unavailable'}
    hint={enabled ? 'Opens the annotation editor for the marker at the playhead' : 'Move the playhead to a marker first'}
    state={enabled ? 'inactive' : 'unavailable'}
    onPress={onPress}
  >
    <BeatNoteIcon name="annotation" size={20} color={enabled ? colors.text : colors.textSecondary} />
  </DockButton>
);

export default React.memo(AnnotationDockButton);
