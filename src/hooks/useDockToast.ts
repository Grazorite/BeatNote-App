import { useCallback, useEffect, useRef, useState } from 'react';

export const useDockToast = (autoHideMs = 1500) => {
  const [toast, setToast] = useState<{ message: string | null; nonce: number }>({ message: null, nonce: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(current => ({ message, nonce: current.nonce + 1 }));
    timerRef.current = setTimeout(() => {
      setToast(current => ({ ...current, message: null }));
      timerRef.current = null;
    }, autoHideMs);
  }, [autoHideMs]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { ...toast, show };
};
