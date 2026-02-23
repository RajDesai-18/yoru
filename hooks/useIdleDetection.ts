import { useEffect, useRef, useCallback } from "react";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

interface UseIdleDetectionOptions {
  onIdle: () => void;
  onActive: () => void;
  timeout?: number;
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isIdleRef.current) {
      isIdleRef.current = false;
      onActive();
    }

    timeoutRef.current = setTimeout(() => {
      isIdleRef.current = true;
      onIdle();
    }, timeout);
  }, [onIdle, onActive, timeout]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isIdleRef.current) {
        isIdleRef.current = false;
        onActive();
      }
      return;
    }

    // On touch devices, skip mouse-based idle detection entirely.
    // SceneContainer handles tap-to-toggle instead.
    if (isTouchDevice()) {
      return;
    }

    resetTimer();

    const events = ["mousemove", "mousedown", "keydown", "wheel"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

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
