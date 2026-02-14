"use client";

import { forwardRef } from "react";
import {
  AMBIENT_SOUNDS,
  getAmbientsByCategory,
  type AmbientSoundId,
} from "@/lib/audio/ambient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AmbientSelectorProps {
  currentSound: AmbientSoundId;
  onSoundChange: (soundId: AmbientSoundId) => void;
  isVisible: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  control: "",
  weather: "Weather",
  nature: "Nature",
  cozy: "Cozy",
  urban: "Urban",
  atmospheric: "Atmospheric",
  musical: "Musical",
  focus: "Focus",
};

const CATEGORY_ORDER = [
  "control",
  "weather",
  "nature",
  "cozy",
  "urban",
  "atmospheric",
  "musical",
  "focus",
];

export const AmbientSelector = forwardRef<HTMLDivElement, AmbientSelectorProps>(
  ({ currentSound, onSoundChange, isVisible }, ref) => {
    const grouped = getAmbientsByCategory();

    return (
      <div
        ref={ref}
        className={`
                    fixed bottom-24 left-1/2 -translate-x-1/2
                    bg-black/40 backdrop-blur-md
                    border border-white/10 rounded-2xl
                    p-4 w-64
                    transition-all duration-500
                    ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
                `}
      >
        <div className="mb-4">
          <h3 className="text-white text-sm font-medium mb-1">Ambient Sound</h3>
          <p className="text-white/50 text-xs" suppressHydrationWarning>
            {AMBIENT_SOUNDS.find((s) => s.id === currentSound)?.description ||
              "Select a sound"}
          </p>
        </div>

        <ScrollArea className="h-80">
          <div className="space-y-3 pr-4">
            {CATEGORY_ORDER.map((category) => {
              const sounds = grouped[category];
              if (!sounds || sounds.length === 0) return null;
              const label = CATEGORY_LABELS[category];

              return (
                <div key={category}>
                  {label && (
                    <p className="text-white/30 text-[10px] font-medium uppercase tracking-widest px-3 mb-1">
                      {label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {sounds.map((sound) => (
                      <Button
                        key={sound.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onSoundChange(sound.id)}
                        suppressHydrationWarning
                        className={`
                                                    w-full justify-start text-sm font-medium transition-all duration-200
                                                    ${
                                                      currentSound === sound.id
                                                        ? "bg-white/20 text-white"
                                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                                    }
                                                `}
                      >
                        {sound.name}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

AmbientSelector.displayName = "AmbientSelector";
