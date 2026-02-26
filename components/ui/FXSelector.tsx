/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { forwardRef, useEffect, useCallback, useState, useRef } from "react";
import { FX_OPTIONS } from "@/lib/constants";
import type { FXId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

interface FXSelectorProps {
  currentFX: FXId;
  onFXChange: (fxId: FXId) => void;
  isVisible: boolean;
}

export const FXSelector = forwardRef<HTMLDivElement, FXSelectorProps>(
  ({ currentFX, onFXChange, isVisible }, ref) => {
    const [isTouch, setIsTouch] = useState(false);
    const dragStartY = useRef(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setIsTouch(isTouchDevice());
    }, []);

    useEffect(() => {
      if (isTouch && isVisible) {
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = "";
        };
      }
    }, [isTouch, isVisible]);

    const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      dragStartY.current = touch.clientY;
    }, []);

    const handleSheetTouchEnd = useCallback((e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaY = touch.clientY - dragStartY.current;
      if (deltaY > 80) {
        document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      }
    }, []);

    const fxList = (
      <div className="space-y-0.5">
        {FX_OPTIONS.map((fx) => (
          <Button
            key={fx.id}
            variant="ghost"
            size="sm"
            onClick={() => onFXChange(fx.id)}
            className={`
              w-full justify-between transition-all duration-200 min-h-11
              ${
                currentFX === fx.id
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            <span className="text-sm font-medium">{fx.name}</span>
          </Button>
        ))}
      </div>
    );

    // Mobile: bottom sheet
    if (isTouch) {
      return (
        <>
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
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-3">
              <h3 className="text-white text-sm font-medium mb-1">
                Visual Effects
              </h3>
            </div>

            <div className="px-3 pb-6">{fxList}</div>
          </div>
        </>
      );
    }

    // Desktop: floating panel
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
          <h3 className="text-white text-sm font-medium mb-1">
            Visual Effects
          </h3>
        </div>

        {fxList}
      </div>
    );
  }
);

FXSelector.displayName = "FXSelector";
