"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Radio,
  Volume1,
} from "lucide-react";
import { useState } from "react";

interface ControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isVisible: boolean;
  currentSoundName?: string;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  onAmbientSelectorToggle?: () => void;
  onShortcutsToggle?: () => void;
}

export function Controls({
  isPlaying,
  isMuted,
  volume,
  isVisible,
  currentSoundName,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onFullscreen,
  onAmbientSelectorToggle,
  onShortcutsToggle,
}: ControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <>
      {/* Current sound name */}
      {currentSoundName && currentSoundName !== "None" && (
        <div
          className={`
            fixed bottom-26 sm:bottom-26 left-1/2 -translate-x-1/2 z-30
            text-white text-xs font-light tracking-widest uppercase
            pb-[env(safe-area-inset-bottom,0px)]
            transition-all duration-500
            ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          {currentSoundName}
        </div>
      )}

      {/* Controls bar */}
      <div
        className={`
          fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30
          bg-black/40 backdrop-blur-md
          border border-white/10 rounded-full
          px-2 sm:px-4 py-2
          flex items-center gap-1 sm:gap-3
          pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]
          transition-all duration-500
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"}
        `}
      >
        {/* Play/Pause */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPlayPause}
                className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-11 min-w-11"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? "Pause (Space)" : "Play (Space)"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-white/10" />

        {/* Volume — hover expand on desktop, always visible slider on mobile */}
        <div
          className="relative flex items-center gap-1 sm:gap-2"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMuteToggle}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-11 min-w-11"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : volume <= 0.3 ? (
                    <Volume1 className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute (M)" : "Mute (M)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile: always visible slider */}
          <div className="w-20 sm:hidden">
            <Slider
              value={[volume]}
              onValueChange={(values) => {
                const newVolume = values[0];
                if (newVolume !== undefined) {
                  onVolumeChange(newVolume);
                }
              }}
              max={1}
              step={0.01}
              className="w-20"
            />
          </div>

          {/* Desktop: hover-expand slider */}
          <div
            className={`
              hidden sm:block overflow-hidden transition-all duration-300
              ${showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0"}
            `}
          >
            <Slider
              value={[volume]}
              onValueChange={(values) => {
                const newVolume = values[0];
                if (newVolume !== undefined) {
                  onVolumeChange(newVolume);
                }
              }}
              max={1}
              step={0.01}
              className="w-24"
            />
          </div>
        </div>

        <div className="w-px h-6 bg-white/10" />

        {/* Ambient selector */}
        {onAmbientSelectorToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAmbientSelectorToggle}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-11 min-w-11"
                  aria-label="Select ambient sound"
                >
                  <Radio className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ambient Sounds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Shortcuts — desktop only */}
        {onShortcutsToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onShortcutsToggle}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-11 min-w-11 hidden sm:inline-flex"
                  aria-label="Keyboard shortcuts"
                >
                  <span className="text-sm font-medium">/</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shortcuts (/)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Fullscreen — desktop only (not supported on iOS Safari) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFullscreen}
                className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-11 min-w-11 hidden sm:inline-flex"
                aria-label="Toggle fullscreen"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fullscreen (F)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}