'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Manages rate-limit countdown state for forms.
 * Call `triggerRateLimit(seconds)` when a 429 is detected.
 * While `isRateLimited` is true the form button should be disabled.
 */
export function useRateLimit() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const triggerRateLimit = useCallback((retryAfterSeconds: number) => {
    clear();
    setSecondsLeft(retryAfterSeconds);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clear();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => clear, []);

  return { isRateLimited: secondsLeft > 0, secondsLeft, triggerRateLimit };
}
