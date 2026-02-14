"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  isVisible: boolean;
  onClose: () => void;
  onReset: () => void;
}

const SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "M", action: "Mute / Unmute" },
  { key: "F", action: "Fullscreen" },
  { key: "←", action: "Previous Scene" },
  { key: "→", action: "Next Scene" },
  { key: "↑", action: "Volume Up" },
  { key: "↓", action: "Volume Down" },
  { key: "/", action: "Toggle Shortcuts" },
  { key: "R", action: "Reset Preferences" },
];

export function KeyboardShortcuts({
  isVisible,
  onClose,
  onReset,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!isVisible) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-72"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white text-sm font-medium mb-4 text-center tracking-wide uppercase">
          Keyboard Shortcuts
        </h3>

        <div className="space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between"
            >
              <span className="text-white/50 text-xs">{shortcut.action}</span>
              <kbd className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded min-w-8 text-center">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          className="mt-4 w-full text-xs text-white/40 hover:text-white/70 py-2 border border-white/10 hover:border-white/20 rounded-lg transition-colors"
        >
          Reset Preferences
        </button>
      </div>
    </div>
  );
}