"use client";

import { useEffect } from "react";

interface UseKeyboardOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onSpace?: () => void;
  onKeyF?: () => void;
  onKeyM?: () => void;
}

export function useKeyboard({
  onLeft,
  onRight,
  onSpace,
  onKeyF,
  onKeyM,
}: UseKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case "ArrowLeft":
          event.preventDefault();
          onLeft?.();
          break;
        case "ArrowRight":
          event.preventDefault();
          onRight?.();
          break;
        case "Space":
          event.preventDefault();
          onSpace?.();
          break;
        case "KeyF":
          event.preventDefault();
          onKeyF?.();
          break;
        case "KeyM":
          event.preventDefault();
          onKeyM?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onLeft, onRight, onSpace, onKeyF, onKeyM]);
}
