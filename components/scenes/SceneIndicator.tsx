"use client";

import { SCENES } from "@/lib/constants";

interface SceneIndicatorProps {
  currentIndex: number;
}

export function SceneIndicator({ currentIndex }: SceneIndicatorProps) {
  const currentScene = SCENES[currentIndex];
  if (!currentScene) return null;
  const soundScenes = SCENES.filter((s) => s.soundId === currentScene.soundId);
  const positionInGroup =
    soundScenes.findIndex((s) => s.id === currentScene.id) + 1;

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
      {/* Dots for scenes in current sound group */}
      <div className="flex gap-1.5">
        {soundScenes.map((scene, index) => (
          <div
            key={scene.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === positionInGroup - 1
                ? "w-6 bg-white"
                : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Text counter */}
      <span className="text-white/50 text-xs font-light tracking-wide">
        {positionInGroup} / {soundScenes.length}
      </span>
    </div>
  );
}
