/* eslint-disable react-hooks/set-state-in-effect */
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
  Info,
  Film,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";
import { MobileVolumeSlider } from "@/components/ui/MobileVolumeSlider";

interface ControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isVisible: boolean;
  showSwipeVolume?: boolean;
  currentSoundName?: string;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onFullscreen: () => void;
  onAmbientSelectorToggle?: () => void;
  onShortcutsToggle?: () => void;
  onInstructionsToggle?: () => void;
  videoEnabled?: boolean;
  sceneHasVideo?: boolean;
  onVideoToggle?: () => void;
  isTouch?: boolean;
  fxEnabled?: boolean;
  onFXSelectorToggle?: () => void;
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
  onInstructionsToggle,
  showSwipeVolume,
  videoEnabled,
  sceneHasVideo,
  onVideoToggle,
  fxEnabled,
  onFXSelectorToggle,
}: ControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  // Auto-hide mobile volume slider after 3 seconds of no interaction
  useEffect(() => {
    if (!showMobileVolume) return;
    const timer = setTimeout(() => setShowMobileVolume(false), 3000);
    return () => clearTimeout(timer);
  }, [showMobileVolume, volume]);

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume <= 0.3 ? Volume1 : Volume2;

  return (
    <>
      {/* Current sound name */}
      {currentSoundName && currentSoundName !== "None" && (
        <div
          className={`
            fixed bottom-20 sm:bottom-26 left-1/2 -translate-x-1/2 z-30
            text-white text-[10px] sm:text-xs font-light tracking-widest uppercase
            text-center
            pb-[env(safe-area-inset-bottom,0px)]
            transition-all duration-500
            ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          {currentSoundName}
        </div>
      )}

      {/* Mobile vertical volume slider — shows on tap OR swipe */}
      {isTouch && (
        <MobileVolumeSlider
          volume={volume}
          onVolumeChange={onVolumeChange}
          isVisible={showMobileVolume || !!showSwipeVolume}
        />
      )}

      {/* Controls bar */}
      <div
        className={`
          fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30
          bg-black/40 backdrop-blur-md
          border border-white/10 rounded-full
          px-2 sm:px-4 py-1.5 sm:py-2
          flex items-center gap-1 sm:gap-3
          pb-[max(0.375rem,env(safe-area-inset-bottom,0.375rem))] sm:pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]
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
                className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-10 min-w-10 sm:min-h-11 sm:min-w-11"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? "Pause (Space)" : "Play (Space)"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-5 sm:h-6 bg-white/10" />

        {/* Volume */}
        <div
          className="relative flex items-center gap-1 sm:gap-2"
          onMouseEnter={() => !isTouch && setShowVolumeSlider(true)}
          onMouseLeave={() => !isTouch && setShowVolumeSlider(false)}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isTouch) {
                      setShowMobileVolume((prev) => !prev);
                    } else {
                      onMuteToggle();
                    }
                  }}
                  onDoubleClick={() => {
                    if (isTouch) onMuteToggle();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-10 min-w-10 sm:min-h-11 sm:min-w-11"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  <VolumeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? "Unmute (M)" : "Mute (M)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Desktop: hover-expand horizontal slider */}
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

        <div className="w-px h-5 sm:h-6 bg-white/10" />

        {/* Ambient selector */}
        {onAmbientSelectorToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAmbientSelectorToggle}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-10 min-w-10 sm:min-h-11 sm:min-w-11"
                  aria-label="Select ambient sound"
                >
                  <Radio className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ambient Sounds</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Video toggle — desktop only */}
        {onVideoToggle && !isTouch && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onVideoToggle}
                  disabled={!sceneHasVideo}
                  className={`
                        hover:bg-white/10 transition-colors
                        min-h-10 min-w-10 sm:min-h-11 sm:min-w-11
                        hidden sm:inline-flex
                        ${
                          videoEnabled && sceneHasVideo
                            ? "text-white"
                            : "text-white/40"
                        }
                        ${!sceneHasVideo ? "opacity-30 cursor-not-allowed" : ""}
                    `}
                  aria-label={
                    videoEnabled
                      ? "Disable video scenes"
                      : "Enable video scenes"
                  }
                >
                  <Film className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {!sceneHasVideo
                    ? "No video for this scene"
                    : videoEnabled
                      ? "Disable Video (V)"
                      : "Enable Video (V)"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* FX selector toggle */}
        {onFXSelectorToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onFXSelectorToggle}
                  className={`
                        hover:bg-white/10 transition-colors
                        min-h-10 min-w-10 sm:min-h-11 sm:min-w-11
                        ${fxEnabled ? "text-white" : "text-white/40"}
                    `}
                  aria-label="Visual effects"
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visual Effects (X)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Instructions — mobile only */}
        {isTouch && onInstructionsToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onInstructionsToggle}
            className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-10 min-w-10"
            aria-label="Instructions"
          >
            <Info className="h-4 w-4" />
          </Button>
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
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 hidden sm:inline-flex"
                  aria-label="Keyboard shortcuts"
                >
                  <span className="text-xs sm:text-sm font-medium">/</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shortcuts (/)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Fullscreen — desktop only */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFullscreen}
                className="text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-10 min-w-10 sm:min-h-11 sm:min-w-11 hidden sm:inline-flex"
                aria-label="Toggle fullscreen"
              >
                <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fullscreen (F)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Attribution badge */}
      <div
        className={`
          fixed bottom-1 right-2 sm:bottom-1 sm:right-4 z-20
          text-white/25 text-[9px] sm:text-[10px] font-light tracking-wide
          pr-[env(safe-area-inset-right,0px)]
          pb-[env(safe-area-inset-bottom,0px)]
          transition-all duration-500
          ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        Visuals AI-generated · Music via{" "}
        <a
          href="https://pixabay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white/40 transition-colors"
        >
          Pixabay
        </a>
      </div>
    </>
  );
}
