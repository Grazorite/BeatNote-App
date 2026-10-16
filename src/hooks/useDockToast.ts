import { useCallback, useEffect, useRef, useState } from 'react';

export interface DockToastAction {
  label: string;
  onPress: () => void;
}

export const useDockToast = (autoHideMs = 1500) => {
  const [toast, setToast] = useState<{
    message: string | null;
    action: DockToastAction | null;
    nonce: number;
  }>({ message: null, action: null, nonce: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, action: DockToastAction | null = null) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(current => ({ message, action, nonce: current.nonce + 1 }));
    timerRef.current = setTimeout(() => {
      setToast(current => ({ ...current, message: null, action: null }));
      timerRef.current = null;
    }, action ? Math.max(autoHideMs, 5000) : autoHideMs);
  }, [autoHideMs]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { ...toast, show };
};
