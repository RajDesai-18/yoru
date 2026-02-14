"use client";

import { useEffect } from "react";

interface UseKeyboardOptions {
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onSpace?: () => void;
  onKeyF?: () => void;
  onKeyM?: () => void;
  onSlash?: () => void;
  onKeyR?: () => void;
}

export function useKeyboard({
  onLeft,
  onRight,
  onUp,
  onDown,
  onSpace,
  onKeyF,
  onKeyM,
  onSlash,
  onKeyR,
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
        case "ArrowUp":
          event.preventDefault();
          onUp?.();
          break;
        case "ArrowDown":
          event.preventDefault();
          onDown?.();
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
        case "Slash":
          event.preventDefault();
          onSlash?.();
          break;
        case "KeyR":
          event.preventDefault();
          onKeyR?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onLeft, onRight, onUp, onDown, onSpace, onKeyF, onKeyM, onSlash, onKeyR]);
}
