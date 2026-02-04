"use client";

import { useEffect } from "react";

export function useKeyboard(handlers: {
  onLeft?: () => void;
  onRight?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlers.onLeft?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          handlers.onRight?.();
          break;
        case " ":
          e.preventDefault();
          handlers.onSpace?.();
          break;
        case "Escape":
          e.preventDefault();
          handlers.onEscape?.();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}