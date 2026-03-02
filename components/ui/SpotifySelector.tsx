/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Music, Loader2, LogOut } from "lucide-react";
import { type SpotifyPlaylist, getUserPlaylists } from "@/lib/spotify/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

interface SpotifySelectorProps {
  isOpen: boolean;
  isConnected: boolean;
  accessToken: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSelectPlaylist: (uri: string) => void;
  activePlaylistUri: string | null;
}

const SpotifySelector = forwardRef<HTMLDivElement, SpotifySelectorProps>(
  function SpotifySelector(
    {
      isOpen,
      isConnected,
      accessToken,
      onConnect,
      onDisconnect,
      onSelectPlaylist,
      activePlaylistUri,
    },
    ref
  ) {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasFetched = useRef(false);

    useEffect(() => {
      if (!isOpen || !isConnected || !accessToken || hasFetched.current) return;
      hasFetched.current = true;
      setIsLoading(true);
      setError(null);

      getUserPlaylists(accessToken)
        .then(setPlaylists)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }, [isOpen, isConnected, accessToken]);

    useEffect(() => {
      if (!isConnected) {
        hasFetched.current = false;
        setPlaylists([]);
      }
    }, [isConnected]);

    const handleDragEnd = useCallback(
      (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 100) onDisconnect();
      },
      [onDisconnect]
    );

    const playlistList = (
      <div className="flex flex-col gap-1">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => onSelectPlaylist(playlist.uri)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
              activePlaylistUri === playlist.uri
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            {playlist.images?.[0] ? (
              <Image
                src={playlist.images[0].url}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
                <Music size={16} className="text-white/40" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{playlist.name}</p>
              <p className="text-xs text-white/40">
                {playlist.totalTracks} tracks
              </p>
            </div>
          </button>
        ))}
      </div>
    );

    const connectedHeader = (
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest text-white/50 uppercase">
          Playlists
        </span>
        <button
          onClick={onDisconnect}
          className="flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
          aria-label="Disconnect Spotify"
        >
          <LogOut size={12} />
          Disconnect
        </button>
      </div>
    );

    const connectedBody = (
      <>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-white/40" />
          </div>
        )}

        {error && (
          <p className="py-4 text-center text-xs text-red-400/70">{error}</p>
        )}

        {!isLoading && !error && playlistList}
      </>
    );

    const disconnectedContent = (
      <div className="flex flex-col items-center gap-4 py-6">
        <p className="text-sm text-white/50">
          Connect Spotify to play your playlists
        </p>
        <button
          onClick={onConnect}
          className="rounded-full bg-[#1DB954] px-6 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Connect Spotify
        </button>
        <p className="text-xs text-white/30">Requires Spotify Premium</p>
      </div>
    );

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile bottom sheet */}
            <motion.div
              ref={ref}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/10 bg-black/90 px-4 pb-6 pt-3 backdrop-blur-xl md:hidden"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
              {isConnected ? (
                <>
                  {connectedHeader}
                  <ScrollArea className="h-72">{connectedBody}</ScrollArea>
                </>
              ) : (
                disconnectedContent
              )}
            </motion.div>

            {/* Desktop floating panel */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-32 left-1/2 z-50 hidden w-100 -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 p-4 backdrop-blur-xl md:block"
            >
              {isConnected ? (
                <>
                  {connectedHeader}
                  <ScrollArea className="h-72">{connectedBody}</ScrollArea>
                </>
              ) : (
                disconnectedContent
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

export default SpotifySelector;
