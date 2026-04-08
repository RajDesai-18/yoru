"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import {
  Music,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Play,
  Pause,
} from "lucide-react";
import type { RepeatMode } from "@/lib/spotify/api";

interface NowPlayingProps {
  trackName: string;
  artistName: string;
  albumArt: string;
  isVisible: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  shuffleActive: boolean;
  onShuffleToggle: () => void;
  repeatMode: RepeatMode;
  onRepeatCycle: () => void;
  position: number;
  duration: number;
  onSeek: (positionMs: number) => void;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function NowPlaying({
  trackName,
  artistName,
  albumArt,
  isVisible,
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  shuffleActive,
  onShuffleToggle,
  repeatMode,
  onRepeatCycle,
  position,
  duration,
  onSeek,
}: NowPlayingProps) {
  const RepeatIcon = repeatMode === "track" ? Repeat1 : Repeat;
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || duration === 0) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const fraction = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width)
      );
      onSeek(Math.floor(fraction * duration));
    },
    [duration, onSeek]
  );

  return (
    <div
      className={`
        fixed top-6 left-6 z-30
        bg-black/40 backdrop-blur-md
        border border-white/10 rounded-2xl
        p-4
        transition-all duration-500
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
      `}
    >
      {/* Track info */}
      <div className="flex items-center gap-3">
        {albumArt ? (
          <Image
            src={albumArt}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-xl object-cover shadow-lg border border-white/10"
            unoptimized
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <Music size={22} className="text-white/30" />
          </div>
        )}
        <div className="min-w-0 max-w-44">
          <p className="truncate text-sm font-medium text-white/90">
            {trackName}
          </p>
          <p className="truncate text-xs text-white/40 mt-0.5">{artistName}</p>
        </div>
      </div>

      {/* Transport controls */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={onShuffleToggle}
          className={`rounded-lg p-1.5 transition-colors hover:bg-white/10 ${shuffleActive ? "text-[#1DB954]" : "text-white/30"
            }`}
          aria-label={shuffleActive ? "Disable shuffle" : "Enable shuffle"}
        >
          <Shuffle size={15} />
        </button>
        <button
          onClick={onPrevious}
          className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          aria-label="Previous track"
        >
          <SkipBack size={17} />
        </button>
        <button
          onClick={onPlayPause}
          className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={onNext}
          className="rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
          aria-label="Next track"
        >
          <SkipForward size={17} />
        </button>
        <button
          onClick={onRepeatCycle}
          className={`rounded-lg p-1.5 transition-colors hover:bg-white/10 ${repeatMode !== "off" ? "text-[#1DB954]" : "text-white/30"
            }`}
          aria-label={`Repeat: ${repeatMode}`}
        >
          <RepeatIcon size={15} />
        </button>
      </div>

      {/* Seek bar */}
      <div className="mt-3 flex items-center gap-2.5">
        <span className="text-[10px] tabular-nums text-white/25 w-8 text-right">
          {formatTime(position)}
        </span>
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="group relative h-1 flex-1 cursor-pointer rounded-full bg-white/10"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={position}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-colors group-hover:bg-white/50"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-white/60 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ left: `calc(${progress}% - 5px)` }}
          />
        </div>
        <span className="text-[10px] tabular-nums text-white/25 w-8">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}