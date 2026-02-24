import { useRef, useCallback } from "react";

interface UseSwipeVolumeOptions {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onSwipeStart?: () => void;
  sensitivity?: number;
}

export function useSwipeVolume({
  volume,
  onVolumeChange,
  onSwipeStart,
  sensitivity = 500,
}: UseSwipeVolumeOptions) {
  const touchStartY = useRef(0);
  const startVolume = useRef(0);
  const isVerticalSwipe = useRef(false);
  const touchStartX = useRef(0);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchStartY.current = touch.clientY;
      touchStartX.current = touch.clientX;
      startVolume.current = volume;
      isVerticalSwipe.current = false;
    },
    [volume]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const deltaY = touchStartY.current - touch.clientY;
      const deltaX = touch.clientX - touchStartX.current;

      // Only activate after 20px vertical movement AND vertical dominates horizontal
      if (!isVerticalSwipe.current) {
        if (Math.abs(deltaY) > 20 && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
          isVerticalSwipe.current = true;
          onSwipeStart?.();
        }
        return;
      }

      const volumeDelta = deltaY / sensitivity;
      const newVolume = Math.min(
        1,
        Math.max(0, startVolume.current + volumeDelta)
      );
      onVolumeChange(newVolume);
    },
    [onVolumeChange, onSwipeStart, sensitivity]
  );

  return { onTouchStart, onTouchMove };
}
