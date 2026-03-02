"use client";

import Image from "next/image";
import { Music } from "lucide-react";

interface NowPlayingProps {
  trackName: string;
  artistName: string;
  albumArt: string;
  isVisible: boolean;
}

export function NowPlaying({
  trackName,
  artistName,
  albumArt,
  isVisible,
}: NowPlayingProps) {
  return (
    <div
      className={`
        fixed top-6 left-6 z-30
        flex items-center gap-3
        transition-all duration-500
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {albumArt ? (
        <Image
          src={albumArt}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-cover shadow-lg"
          unoptimized
        />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10">
          <Music size={20} className="text-white/40" />
        </div>
      )}
      <div className="min-w-0 max-w-48">
        <p className="truncate text-sm font-medium text-white/90">
          {trackName}
        </p>
        <p className="truncate text-xs text-white/50">{artistName}</p>
      </div>
    </div>
  );
}
