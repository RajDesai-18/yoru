"use client";

import { useRef, useCallback } from "react";

interface MobileVolumeSliderProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
    isVisible: boolean;
}

export function MobileVolumeSlider({
    volume,
    onVolumeChange,
    isVisible,
}: MobileVolumeSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    const getVolumeFromTouch = useCallback(
        (clientY: number) => {
            if (!trackRef.current) return volume;
            const rect = trackRef.current.getBoundingClientRect();
            // Invert: top = 1, bottom = 0
            const ratio = 1 - (clientY - rect.top) / rect.height;
            return Math.min(1, Math.max(0, ratio));
        },
        [volume]
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            e.stopPropagation();
            const touch = e.touches[0];
            if (!touch) return;
            onVolumeChange(getVolumeFromTouch(touch.clientY));
        },
        [getVolumeFromTouch, onVolumeChange]
    );

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            e.stopPropagation();
            const touch = e.touches[0];
            if (!touch) return;
            onVolumeChange(getVolumeFromTouch(touch.clientY));
        },
        [getVolumeFromTouch, onVolumeChange]
    );

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!trackRef.current) return;
            onVolumeChange(getVolumeFromTouch(e.clientY));
        },
        [getVolumeFromTouch, onVolumeChange]
    );

    const fillHeight = `${Math.round(volume * 100)}%`;

    return (
        <div
            className={`
        fixed bottom-24 left-1/2 -translate-x-1/2 z-40
        bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl
        px-4 py-4 flex flex-col items-center gap-2
        transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            <span className="text-white/40 text-[9px] tracking-widest uppercase">
                Vol
            </span>

            {/* Custom vertical slider track */}
            <div
                ref={trackRef}
                className="relative w-8 h-28 rounded-full bg-white/10 cursor-pointer overflow-hidden"
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {/* Fill */}
                <div
                    className="absolute bottom-0 left-0 right-0 bg-white/30 rounded-full transition-[height] duration-75"
                    style={{ height: fillHeight }}
                />

                {/* Thumb */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-lg shadow-black/30"
                    style={{ bottom: `calc(${fillHeight} - 10px)` }}
                />
            </div>

            <span className="text-white/40 text-[10px] font-mono">
                {Math.round(volume * 100)}
            </span>
        </div>
    );
}