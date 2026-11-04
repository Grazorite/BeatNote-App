import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { ReduceMotion, ReducedMotionConfig, useReducedMotion } from 'react-native-reanimated';

const MotionContext = createContext<boolean | null>(null);

/** Share the live system preference with native modals, core animations and illustrations. */
export function MotionPreferenceProvider({ children }: React.PropsWithChildren): React.ReactElement {
  const initialSystemSetting = useReducedMotion();
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    let acceptInitial = true;
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      acceptInitial = false;
      setReduced(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (acceptInitial) setReduced(value);
    }).catch(() => { if (acceptInitial) setReduced(true); });
    return () => {
      acceptInitial = false;
      listener.remove();
    };
  }, []);
  return (
    <MotionContext.Provider value={reduced}>
      {reduced !== null && reduced !== initialSystemSetting && (
        <ReducedMotionConfig mode={reduced ? ReduceMotion.Always : ReduceMotion.Never} />
      )}
      {children}
    </MotionContext.Provider>
  );
}

/** Null while the system preference is loading. */
export const useMotionPreference = (): boolean | null => useContext(MotionContext);
