import { useCallback, useEffect, useRef, useState } from "react";
import type { SpotifyPlaybackState, SpotifyPlayer } from "@/types/spotify";

interface SpotifyNowPlaying {
  trackName: string;
  artistName: string;
  albumArt: string;
  duration: number;
  position: number;
}

interface UseSpotifyPlayerReturn {
  isReady: boolean;
  isPlaying: boolean;
  nowPlaying: SpotifyNowPlaying | null;
  deviceId: string | null;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
}

export function useSpotifyPlayer(
  accessToken: string | null
): UseSpotifyPlayerReturn {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<SpotifyNowPlaying | null>(null);
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

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
            return;
          }

          setIsPlaying(!state.paused);

          const track = state.track_window.current_track;
          setNowPlaying({
            trackName: track.name,
            artistName: track.artists.map((a) => a.name).join(", "),
            albumArt: track.album.images[0]?.url ?? "",
            duration: track.duration_ms,
            position: state.position,
          });
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
    await playerRef.current?.seek(positionMs);
  }, []);

  return {
    isReady,
    isPlaying,
    nowPlaying,
    deviceId,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    seek,
  };
}
