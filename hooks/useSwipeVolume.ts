import { useRef, useCallback } from "react";

interface UseSwipeVolumeOptions {
  volume: number;
  onVolumeChange: (volume: number) => void;
  sensitivity?: number;
}

export function useSwipeVolume({
  volume,
  onVolumeChange,
  sensitivity = 200,
}: UseSwipeVolumeOptions) {
  const touchStartY = useRef(0);
  const startVolume = useRef(0);
  const isVerticalSwipe = useRef(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchStartY.current = touch.clientY;
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

      // Only activate after 15px vertical movement
      if (!isVerticalSwipe.current && Math.abs(deltaY) > 15) {
        isVerticalSwipe.current = true;
      }

      if (isVerticalSwipe.current) {
        const volumeDelta = deltaY / sensitivity;
        const newVolume = Math.min(
          1,
          Math.max(0, startVolume.current + volumeDelta)
        );
        onVolumeChange(newVolume);
      }
    },
    [onVolumeChange, sensitivity]
  );

  return { onTouchStart, onTouchMove };
}
