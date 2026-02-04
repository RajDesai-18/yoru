"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Music,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isAmbientEnabled: boolean;
  isMusicEnabled: boolean;
  isVisible: boolean;
  onPlayPause: () => void;
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onAmbientToggle: () => void;
  onMusicToggle: () => void;
  onFullscreen: () => void;
}

export function Controls({
  isPlaying,
  isMuted,
  volume,
  isAmbientEnabled,
  isMusicEnabled,
  isVisible,
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onAmbientToggle,
  onMusicToggle,
  onFullscreen,
}: ControlsProps) {
  const [isVolumeSliderVisible, setIsVolumeSliderVisible] = useState(false);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "fixed bottom-12 left-1/2 -translate-x-1/2",
          "flex items-center gap-2",
          "px-6 py-3 rounded-full",
          "bg-black/40 backdrop-blur-md border border-white/10",
          "transition-all duration-200 ease-out",
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Play/Pause */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPlayPause}
              className={cn(
                "transition-all",
                isPlaying
                  ? "text-white bg-white/10 hover:bg-white/20"
                  : "text-white/70 hover:bg-white/10"
              )}
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
            <p>{isPlaying ? "Pause" : "Play"} (Space)</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-white/20" />

        {/* Volume Control */}
        <div
          className="flex items-center gap-2"
          onMouseEnter={() => setIsVolumeSliderVisible(true)}
          onMouseLeave={() => setIsVolumeSliderVisible(false)}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onMuteToggle}
                className="text-white hover:bg-white"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMuted ? "Unmute" : "Mute"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Volume Slider */}
          <div
            className={cn(
              "transition-all duration-300 ease-out overflow-hidden",
              isVolumeSliderVisible ? "w-24 opacity-100" : "w-0 opacity-0"
            )}
          >
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={(values) => {
                const newVolume = values[0];
                if (newVolume !== undefined) {
                  onVolumeChange(newVolume / 100);
                }
              }}
              max={100}
              step={1}
              className="cursor-pointer"
              aria-label="Volume"
            />
          </div>
        </div>

        <div className="w-px h-6 bg-white/20" />

        {/* Layer Toggles */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAmbientToggle}
              className={cn(
                "transition-all",
                isAmbientEnabled
                  ? "text-white bg-white/10 hover:bg-white/20"
                  : "text-white/40 hover:bg-white/5"
              )}
              aria-label="Toggle Ambient Layer"
              aria-pressed={isAmbientEnabled}
            >
              <Waves className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ambient Layer (A)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMusicToggle}
              className={cn(
                "transition-all",
                isMusicEnabled
                  ? "text-white bg-white/10 hover:bg-white/20"
                  : "text-white/40 hover:bg-white/5"
              )}
              aria-label="Toggle Music Layer"
              aria-pressed={isMusicEnabled}
            >
              <Music className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Music Layer (M)</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-white/20" />

        {/* Fullscreen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreen}
              className="text-white hover:bg-white/10"
              aria-label="Toggle Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Fullscreen (F)</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
