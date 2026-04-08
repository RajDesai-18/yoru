/* eslint-disable react-hooks/purity */
import { useCallback, useEffect, useRef, useState } from "react";
import type { SpotifyPlaybackState, SpotifyPlayer } from "@/types/spotify";
import {
  setShuffle as apiSetShuffle,
  setRepeat as apiSetRepeat,
  type RepeatMode,
} from "@/lib/spotify/api";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface SpotifyNowPlaying {
  trackName: string;
  artistName: string;
  albumArt: string;
  duration: number;
  position: number;
  trackUri: string;
}

export interface QueueTrack {
  id: string;
  name: string;
  artists: string;
  albumArt: string;
  uri: string;
  duration: string;
}

interface UseSpotifyPlayerReturn {
  isReady: boolean;
  isPlaying: boolean;
  nowPlaying: SpotifyNowPlaying | null;
  deviceId: string | null;
  shuffleActive: boolean;
  repeatMode: RepeatMode;
  position: number;
  duration: number;
  queue: QueueTrack[];
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  cycleRepeat: () => Promise<void>;
}

const REPEAT_CYCLE: RepeatMode[] = ["off", "context", "track"];

export function useSpotifyPlayer(
  accessToken: string | null
): UseSpotifyPlayerReturn {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const tokenRef = useRef(accessToken);
  const positionRef = useRef(0);
  const isPlayingRef = useRef(false);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUpdateRef.current;
      const newPosition = Math.min(positionRef.current + elapsed, duration);
      positionRef.current = newPosition;
      lastUpdateRef.current = Date.now();
      setPosition(newPosition);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.getElementById("spotify-sdk");
    if (!script) {
      const s = document.createElement("script");
      s.id = "spotify-sdk";
      s.src = "https://sdk.scdn.co/spotify-player.js";
      s.async = true;
      document.body.appendChild(s);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Yoru",
        getOAuthToken: (cb) => {
          if (tokenRef.current) cb(tokenRef.current);
        },
        volume: 0.5,
      });

      player.addListener(
        "ready" as string,
        ((data: { device_id: string }) => {
          setDeviceId(data.device_id);
          setIsReady(true);
        }) as (data: never) => void
      );

      player.addListener(
        "not_ready" as string,
        (() => {
          setIsReady(false);
          setDeviceId(null);
        }) as (data: never) => void
      );

      player.addListener(
        "player_state_changed" as string,
        ((state: SpotifyPlaybackState | null) => {
          if (!state) {
            setIsPlaying(false);
            setNowPlaying(null);
            setPosition(0);
            setDuration(0);
            setQueue([]);
            return;
          }

          setIsPlaying(!state.paused);
          setShuffleActive(state.shuffle);
          setRepeatMode(
            state.repeat_mode === 2
              ? "track"
              : state.repeat_mode === 1
                ? "context"
                : "off"
          );

          positionRef.current = state.position;
          lastUpdateRef.current = Date.now();
          setPosition(state.position);
          setDuration(state.duration);

          const track = state.track_window.current_track;
          setNowPlaying({
            trackName: track.name,
            artistName: track.artists.map((a) => a.name).join(", "),
            albumArt: track.album.images[0]?.url ?? "",
            duration: track.duration_ms,
            position: state.position,
            trackUri: track.uri,
          });

          const queueTracks = state.track_window.next_tracks.map((t) => ({
            id: t.id,
            name: t.name,
            artists: t.artists.map((a) => a.name).join(", "),
            albumArt: t.album.images[t.album.images.length - 1]?.url ?? "",
            uri: t.uri,
            duration: formatDuration(t.duration_ms),
          }));
          setQueue(queueTracks);
        }) as (data: never) => void
      );

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }

    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
      setIsReady(false);
      setDeviceId(null);
      setNowPlaying(null);
      setPosition(0);
      setDuration(0);
      setQueue([]);
    };
  }, [accessToken]);

  const togglePlay = useCallback(async () => {
    await playerRef.current?.togglePlay();
  }, []);

  const nextTrack = useCallback(async () => {
    await playerRef.current?.nextTrack();
  }, []);

  const previousTrack = useCallback(async () => {
    await playerRef.current?.previousTrack();
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    await playerRef.current?.setVolume(volume);
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    positionRef.current = positionMs;
    lastUpdateRef.current = Date.now();
    setPosition(positionMs);
    await playerRef.current?.seek(positionMs);
  }, []);

  const toggleShuffle = useCallback(async () => {
    if (!tokenRef.current) return;
    const newState = !shuffleActive;
    try {
      await apiSetShuffle(tokenRef.current, newState);
      setShuffleActive(newState);
    } catch (err) {
      console.error("Failed to toggle shuffle:", err);
    }
  }, [shuffleActive]);

  const cycleRepeat = useCallback(async () => {
    if (!tokenRef.current) return;
    const currentIndex = REPEAT_CYCLE.indexOf(repeatMode);
    const nextMode = REPEAT_CYCLE[(currentIndex + 1) % REPEAT_CYCLE.length]!;
    try {
      await apiSetRepeat(tokenRef.current, nextMode);
      setRepeatMode(nextMode);
    } catch (err) {
      console.error("Failed to set repeat:", err);
    }
  }, [repeatMode]);

  return {
    isReady,
    isPlaying,
    nowPlaying,
    deviceId,
    shuffleActive,
    repeatMode,
    position,
    duration,
    queue,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    seek,
    toggleShuffle,
    cycleRepeat,
  };
}
