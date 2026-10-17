import React from 'react';
import { BeatNoteIcon } from '../../icons';
import { colors } from '../../../styles/common';
import DockButton from './DockButton';

interface AnnotationDockButtonProps {
  songLoaded: boolean;
  atMarker: boolean;
  hasAnnotation: boolean;
  compact?: boolean;
  onPress: () => void;
}

/** Open the focused annotation editor only while the playhead is at a marker. */
const AnnotationDockButton: React.FC<AnnotationDockButtonProps> = ({
  songLoaded,
  atMarker,
  hasAnnotation,
  compact,
  onPress,
}) => (
  <DockButton
    compact={compact}
    testID="annotation-control"
    label={songLoaded ? (hasAnnotation ? 'Edit annotation' : 'Add annotation') : 'Add annotation unavailable'}
    hint={songLoaded
      ? (atMarker ? 'Opens the annotation editor for the marker at the playhead' : 'Add a marker at the playhead first')
      : 'Load a song first'}
    state={songLoaded ? 'inactive' : 'unavailable'}
    onPress={onPress}
  >
    <BeatNoteIcon name="annotation" size={20} color={songLoaded ? colors.text : colors.textSecondary} />
  </DockButton>
);

export default React.memo(AnnotationDockButton);
