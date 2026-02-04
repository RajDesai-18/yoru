'use client';

import { useEffect } from 'react';

interface UseKeyboardOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onSpace?: () => void;
  onKeyA?: () => void;
  onKeyM?: () => void;
}

export function useKeyboard({
  onLeft,
  onRight,
  onSpace,
  onKeyA,
  onKeyM,
}: UseKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onRight?.();
          break;
        case 'Space':
          event.preventDefault();
          onSpace?.();
          break;
        case 'KeyA':
          event.preventDefault();
          onKeyA?.();
          break;
        case 'KeyM':
          event.preventDefault();
          onKeyM?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    console.log('⌨️ Keyboard listener attached');

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onLeft, onRight, onSpace, onKeyA, onKeyM]);
}