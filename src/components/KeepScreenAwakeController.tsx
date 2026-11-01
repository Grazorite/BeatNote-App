import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { useSettingsPreferences } from '../features/settings/preferences';
import { useStudioStore } from '../hooks/useStudioStore';

const TAG = 'beatnote-playback-preference';

const KeepScreenAwakeController: React.FC = () => {
  const { keepScreenOn } = useSettingsPreferences();
  const isPlaying = useStudioStore(state => state.isPlaying);
  const active = keepScreenOn === 'always' || (keepScreenOn === 'whilePlaying' && isPlaying);

  useEffect(() => {
    if (active) {
      void activateKeepAwakeAsync(TAG).catch(error => {
        console.error('Unable to keep the display awake', error);
      });
    } else {
      void deactivateKeepAwake(TAG).catch(error => {
        console.error('Unable to release the display wake lock', error);
      });
    }
    return () => {
      void deactivateKeepAwake(TAG).catch(() => undefined);
    };
  }, [active]);

  return null;
};

export default KeepScreenAwakeController;
