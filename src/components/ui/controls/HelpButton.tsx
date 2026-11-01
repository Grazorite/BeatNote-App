import React from 'react';
import { useStudioStore } from '../../../hooks/useStudioStore';
import SettingsNavigationRow from '../settings/SettingsNavigationRow';

const HelpButton: React.FC = () => {
  const { setShowHelpScreen } = useStudioStore();

  return (
    <SettingsNavigationRow
      testID="settings-help"
      label="Help & Support"
      onPress={() => setShowHelpScreen(true)}
    />
  );
};

export default HelpButton;
