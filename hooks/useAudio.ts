"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Howl } from "howler";
import { SCENES, AUDIO } from "@/lib/constants";

interface UseAudioOptions {
  sceneIndex: number;
}

interface AudioLayers {
  ambient: Howl | null;
  music: Howl | null;
}

export function useAudio({ sceneIndex }: UseAudioOptions) {
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [volumeState, setVolumeStateUpdate] = useState<number>(
    AUDIO.DEFAULT_VOLUME
  );
  const [isMutedState, setIsMutedState] = useState(false);
  const [ambientEnabledState, setAmbientEnabledState] = useState(true);
  const [musicEnabledState, setMusicEnabledState] = useState(true);

  const audioRef = useRef<AudioLayers>({ ambient: null, music: null });
  const isPlayingRef = useRef(false);
  const volumeRef = useRef<number>(AUDIO.DEFAULT_VOLUME);
  const isMutedRef = useRef(false);
  const ambientEnabledRef = useRef(true);
  const musicEnabledRef = useRef(true);
  const prevSceneRef = useRef(sceneIndex);
  const isLoadedRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const pauseTimeoutRef = useRef<{
    ambient?: NodeJS.Timeout;
    music?: NodeJS.Timeout;
  }>({});

  // Create a Howl instance
  const createHowl = useCallback((src: string, onLoad?: () => void): Howl => {
    return new Howl({
      src: [src],
      loop: true,
      volume: 0,
      preload: true,
      onload: onLoad,
    });
  }, []);

  // Fade audio volume
  const fadeAudio = useCallback((howl: Howl, to: number, duration: number) => {
    const from = howl.volume();
    howl.fade(from, to, duration);
  }, []);

  // Start playback for both layers
  const startPlayback = useCallback(() => {
    // Cancel any pending pauses
    if (pauseTimeoutRef.current.ambient) {
      clearTimeout(pauseTimeoutRef.current.ambient);
      pauseTimeoutRef.current.ambient = undefined;
    }
    if (pauseTimeoutRef.current.music) {
      clearTimeout(pauseTimeoutRef.current.music);
      pauseTimeoutRef.current.music = undefined;
    }

    const { ambient, music } = audioRef.current;
    const volume = isMutedRef.current ? 0 : volumeRef.current;

    if (ambient && ambientEnabledRef.current) {
      ambient.volume(0);
      ambient.play();
      fadeAudio(ambient, volume, 300);
    }

    if (music && musicEnabledRef.current) {
      music.volume(0);
      music.play();
      fadeAudio(music, volume, 300);
    }

    isPlayingRef.current = true;
    setIsPlayingState(true);
    pendingPlayRef.current = false;
    console.log("▶️ Audio playing");
  }, [fadeAudio]);

  // Load initial audio (runs once on mount)
  useEffect(() => {
    isLoadedRef.current = false;
    pendingPlayRef.current = false;

    const scene = SCENES[sceneIndex];
    if (!scene) return;

    console.log("🎵 Loading audio:", scene.ambient, scene.music);

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        console.log("✅ Both tracks loaded");
        isLoadedRef.current = true;

        if (pendingPlayRef.current) {
          console.log("⏳ Pending play, starting...");
          setTimeout(startPlayback, 50);
        }
      }
    };

    audioRef.current.ambient = createHowl(scene.ambient, onLoad);
    audioRef.current.music = createHowl(scene.music, onLoad);

    return () => {
      console.log("🧹 Cleanup: unloading audio");
      audioRef.current.ambient?.unload();
      audioRef.current.music?.unload();
      audioRef.current = { ambient: null, music: null };
      isLoadedRef.current = false;
      pendingPlayRef.current = false;
    };
  }, [sceneIndex, createHowl, startPlayback]);

  // Handle scene changes with crossfade
  useEffect(() => {
    if (prevSceneRef.current === sceneIndex) return;

    const prevScene = SCENES[prevSceneRef.current];
    const nextScene = SCENES[sceneIndex];

    if (!nextScene) return;

    const ambientChanged = prevScene?.ambient !== nextScene.ambient;
    const musicChanged = prevScene?.music !== nextScene.music;

    console.log("🔄 Scene changed:", prevSceneRef.current, "→", sceneIndex, {
      ambientChanged,
      musicChanged,
    });

    const volume = isMutedRef.current ? 0 : volumeRef.current;

    // Crossfade ambient if track changed
    if (ambientChanged) {
      const oldAmbient = audioRef.current.ambient;
      const newAmbient = createHowl(nextScene.ambient);

      if (oldAmbient) {
        fadeAudio(oldAmbient, 0, AUDIO.CROSSFADE_DURATION);
        setTimeout(() => oldAmbient.unload(), AUDIO.CROSSFADE_DURATION);
      }

      audioRef.current.ambient = newAmbient;
      if (isPlayingRef.current && ambientEnabledRef.current) {
        newAmbient.play();
        fadeAudio(newAmbient, volume, AUDIO.CROSSFADE_DURATION);
      }
    }

    // Crossfade music if track changed
    if (musicChanged) {
      const oldMusic = audioRef.current.music;
      const newMusic = createHowl(nextScene.music);

      if (oldMusic) {
        fadeAudio(oldMusic, 0, AUDIO.CROSSFADE_DURATION);
        setTimeout(() => oldMusic.unload(), AUDIO.CROSSFADE_DURATION);
      }

      audioRef.current.music = newMusic;
      if (isPlayingRef.current && musicEnabledRef.current) {
        newMusic.play();
        fadeAudio(newMusic, volume, AUDIO.CROSSFADE_DURATION);
      }
    }

    prevSceneRef.current = sceneIndex;
  }, [sceneIndex, createHowl, fadeAudio]);

  // Play audio
  const play = useCallback(() => {
    if (!isLoadedRef.current) {
      console.log("⏳ Audio not loaded, queuing...");
      isPlayingRef.current = true;
      setIsPlayingState(true);
      pendingPlayRef.current = true;
      return;
    }
    startPlayback();
  }, [startPlayback]);

  // Pause audio with fade out
  const pause = useCallback(() => {
    const { ambient, music } = audioRef.current;

    if (ambient) {
      fadeAudio(ambient, 0, 300);
      pauseTimeoutRef.current.ambient = setTimeout(() => {
        ambient.pause();
        pauseTimeoutRef.current.ambient = undefined;
      }, 300);
    }

    if (music) {
      fadeAudio(music, 0, 300);
      pauseTimeoutRef.current.music = setTimeout(() => {
        music.pause();
        pauseTimeoutRef.current.music = undefined;
      }, 300);
    }

    isPlayingRef.current = false;
    setIsPlayingState(false);
    console.log("⏸️ Audio paused");
  }, [fadeAudio]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pause();
    } else {
      play();
    }
  }, [play, pause]);

  // Set volume (0-1)
  const setVolume = useCallback((vol: number) => {
    volumeRef.current = vol;
    setVolumeStateUpdate(vol);
    if (!isMutedRef.current && isPlayingRef.current) {
      if (ambientEnabledRef.current) {
        audioRef.current.ambient?.volume(vol);
      }
      if (musicEnabledRef.current) {
        audioRef.current.music?.volume(vol);
      }
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    setIsMutedState(isMutedRef.current);
    const vol = isMutedRef.current ? 0 : volumeRef.current;

    if (ambientEnabledRef.current) {
      audioRef.current.ambient?.volume(vol);
    }
    if (musicEnabledRef.current) {
      audioRef.current.music?.volume(vol);
    }

    console.log(isMutedRef.current ? "🔇 Muted" : "🔊 Unmuted");
    return isMutedRef.current;
  }, []);

  // Toggle ambient layer
  const toggleAmbient = useCallback(() => {
    ambientEnabledRef.current = !ambientEnabledRef.current;
    setAmbientEnabledState(ambientEnabledRef.current);
    const ambient = audioRef.current.ambient;

    if (!ambient) return ambientEnabledRef.current;

    if (ambientEnabledRef.current && isPlayingRef.current) {
      ambient.volume(0);
      ambient.play();
      fadeAudio(ambient, isMutedRef.current ? 0 : volumeRef.current, 300);
      console.log("🌿 Ambient enabled");
    } else {
      fadeAudio(ambient, 0, 300);
      setTimeout(() => ambient.pause(), 300);
      console.log("🌿 Ambient disabled");
    }

    return ambientEnabledRef.current;
  }, [fadeAudio]);

  // Toggle music layer
  const toggleMusic = useCallback(() => {
    musicEnabledRef.current = !musicEnabledRef.current;
    setMusicEnabledState(musicEnabledRef.current);
    const music = audioRef.current.music;

    if (!music) return musicEnabledRef.current;

    if (musicEnabledRef.current && isPlayingRef.current) {
      music.volume(0);
      music.play();
      fadeAudio(music, isMutedRef.current ? 0 : volumeRef.current, 300);
      console.log("🎵 Music enabled");
    } else {
      fadeAudio(music, 0, 300);
      setTimeout(() => music.pause(), 300);
      console.log("🎵 Music disabled");
    }

    return musicEnabledRef.current;
  }, [fadeAudio]);

  return {
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    toggleAmbient,
    toggleMusic,
    isPlaying: isPlayingState,
    volume: volumeState,
    isMuted: isMutedState,
    ambientEnabled: ambientEnabledState,
    musicEnabled: musicEnabledState,
  };
}
