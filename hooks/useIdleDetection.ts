import { useEffect, useRef, useCallback } from "react";

interface UseIdleDetectionOptions {
  onIdle: () => void;
  onActive: () => void;
  timeout?: number; // milliseconds
  enabled?: boolean;
}

export function useIdleDetection({
  onIdle,
  onActive,
  timeout = 3000,
  enabled = true,
}: UseIdleDetectionOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIdleRef = useRef(false);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If was idle, trigger active callback
    if (isIdleRef.current) {
      isIdleRef.current = false;
      onActive();
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      isIdleRef.current = true;
      onIdle();
    }, timeout);
  }, [onIdle, onActive, timeout]);

  useEffect(() => {
    if (!enabled) {
      // Cleanup and trigger active state when disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isIdleRef.current) {
        isIdleRef.current = false;
        onActive();
      }
      return;
    }

    // Start timer on mount
    resetTimer();

    // Listen for user activity
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled, resetTimer, onActive]);
}
