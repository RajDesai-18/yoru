'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Play, Pause, Volume2, VolumeX, Maximize, Radio } from 'lucide-react';
import { useState } from 'react';

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
}: ControlsProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <>
      {/* Current sound name */}
      {currentSoundName && currentSoundName !== "None" && (
        <div
          className={`
            fixed bottom-26 left-1/2 -translate-x-1/2 z-30
            text-white text-xs font-light tracking-widest uppercase
            transition-all duration-500
            ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          {currentSoundName}
        </div>
      )}
      <div
        className={`
        fixed bottom-10 left-1/2 -translate-x-1/2
        bg-black/40 backdrop-blur-md
        border border-white/10 rounded-full
        px-4 py-2
        flex items-center gap-3
        transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
      `}
      >

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onPlayPause}
                className="text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isPlaying ? 'Pause (Space)' : 'Play (Space)'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-white/10" />

        <div
          className="relative flex items-center gap-2"
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
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMuted ? 'Unmute (M)' : 'Mute (M)'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div
            className={`
            overflow-hidden transition-all duration-300
            ${showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}
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

        {onAmbientSelectorToggle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAmbientSelectorToggle}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFullscreen}
                className="text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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