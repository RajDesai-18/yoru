/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { forwardRef, useEffect, useCallback, useState, useRef } from "react";
import {
  AMBIENT_SOUNDS,
  getAmbientsByCategory,
  type AmbientSoundId,
} from "@/lib/audio/ambient";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

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
    const [isTouch, setIsTouch] = useState(false);
    const dragStartY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setIsTouch(isTouchDevice());
    }, []);

    // Prevent body scroll when bottom sheet is open on mobile
    useEffect(() => {
      if (isTouch && isVisible) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }, [isTouch, isVisible]);

    // Swipe down to close bottom sheet
    const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      dragStartY.current = touch.clientY;
    }, []);

    const handleSheetTouchEnd = useCallback(
      (e: React.TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const deltaY = touch.clientY - dragStartY.current;
        // Swipe down more than 80px to close
        if (deltaY > 80) {
          onSoundChange(currentSound); // keep current, just close
          // We need a way to close — trigger click outside
          document.dispatchEvent(
            new MouseEvent("mousedown", { bubbles: true })
          );
        }
      },
      [currentSound, onSoundChange]
    );

    const soundList = (
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
                      w-full justify-start text-sm font-medium transition-all duration-200 min-h-11
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
    );

    // Mobile: bottom sheet
    if (isTouch) {
      return (
        <>
          {/* Backdrop */}
          <div
            className={`
              fixed inset-0 z-40 bg-black/50 transition-opacity duration-300
              ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
            onClick={() =>
              document.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
              )
            }
          />

          {/* Bottom sheet */}
          <div
            ref={(node) => {
              sheetRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              bg-black/70 backdrop-blur-xl
              border-t border-white/10
              rounded-t-2xl
              transition-transform duration-300 ease-out
              pb-[env(safe-area-inset-bottom,0px)]
              ${isVisible ? "translate-y-0" : "translate-y-full"}
            `}
            style={{ maxHeight: "60dvh" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3">
              <h3 className="text-white text-sm font-medium mb-1">
                Ambient Sound
              </h3>
              <p className="text-white/50 text-xs" suppressHydrationWarning>
                {AMBIENT_SOUNDS.find((s) => s.id === currentSound)
                  ?.description || "Select a sound"}
              </p>
            </div>

            {/* Sound list */}
            <ScrollArea
              className="px-3"
              style={{ height: "calc(60dvh - 100px)" }}
            >
              {soundList}
            </ScrollArea>
          </div>
        </>
      );
    }

    // Desktop: floating panel (unchanged)
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

        <ScrollArea className="h-80">{soundList}</ScrollArea>
      </div>
    );
  }
);

AmbientSelector.displayName = "AmbientSelector";
