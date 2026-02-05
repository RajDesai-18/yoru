"use client";

import { SCENES } from "@/lib/constants";

interface SceneIndicatorProps {
  currentIndex: number;
}

export function SceneIndicator({ currentIndex }: SceneIndicatorProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      {SCENES.map((scene, index) => (
        <div
          key={scene.id}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? "w-8 bg-white"
              : "w-1.5 bg-white/30 hover:bg-white/50"
          }`}
          aria-label={`Scene ${index + 1}`}
        />
      ))}
    </div>
  );
}
