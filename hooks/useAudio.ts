'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Howl } from 'howler';
import { AUDIO, SCENE_AUDIO, type AudioLayer } from '@/lib/constants';

interface UseAudioProps {
  sceneIndex: number;
  onAudioReady?: () => void;
}

interface AudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  ambientEnabled: boolean;
  musicEnabled: boolean;
}

export function useAudio({ sceneIndex, onAudioReady }: UseAudioProps) {
  // Audio state
  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    volume: AUDIO.DEFAULT_VOLUME * 100, // Store as 0-100 for UI
    isMuted: false,
    ambientEnabled: true,
    musicEnabled: true,
  });

  // Howl instances (one for ambient, one for music)
  const ambientRef = useRef<Howl | null>(null);
  const musicRef = useRef<Howl | null>(null);

  // Track previous scene for crossfade detection
  const prevSceneRef = useRef<number>(sceneIndex);

  // Convert 0-100 volume to 0-1 for Howler
  const normalizedVolume = state.volume / 100;

  // Load audio for a specific layer
  const loadAudio = useCallback((layer: AudioLayer, src: string) => {
    const howl = new Howl({
      src: [src],
      html5: true, // Better for long tracks, enables streaming
      loop: true,
      volume: 0, // Start silent (we'll fade in)
      onload: () => {
        if (onAudioReady) onAudioReady();
      },
      onloaderror: (_id, error) => {
        console.error(`Failed to load ${layer}:`, error);
      },
    });

    return howl;
  }, [onAudioReady]);

  // Fade audio in/out
  const fade = useCallback((howl: Howl, from: number, to: number, duration: number) => {
    return new Promise<void>((resolve) => {
      howl.fade(from, to, duration);
      setTimeout(resolve, duration);
    });
  }, []);

  // Play/pause control
  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      ambientRef.current?.pause();
      musicRef.current?.pause();
    } else {
      if (state.ambientEnabled) ambientRef.current?.play();
      if (state.musicEnabled) musicRef.current?.play();
    }
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [state.isPlaying, state.ambientEnabled, state.musicEnabled]);

  // Volume control
  const setVolume = useCallback((newVolume: number) => {
    const normalized = newVolume / 100;
    ambientRef.current?.volume(state.ambientEnabled ? normalized : 0);
    musicRef.current?.volume(state.musicEnabled ? normalized : 0);
    setState((prev) => ({ ...prev, volume: newVolume }));
  }, [state.ambientEnabled, state.musicEnabled]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    ambientRef.current?.mute(newMuted);
    musicRef.current?.mute(newMuted);
    setState((prev) => ({ ...prev, isMuted: newMuted }));
  }, [state.isMuted]);

  // Layer toggles
  const toggleAmbient = useCallback(() => {
    const newEnabled = !state.ambientEnabled;
    if (newEnabled && state.isPlaying) {
      ambientRef.current?.play();
      ambientRef.current?.volume(normalizedVolume);
    } else {
      ambientRef.current?.volume(0);
    }
    setState((prev) => ({ ...prev, ambientEnabled: newEnabled }));
  }, [state.ambientEnabled, state.isPlaying, normalizedVolume]);

  const toggleMusic = useCallback(() => {
    const newEnabled = !state.musicEnabled;
    if (newEnabled && state.isPlaying) {
      musicRef.current?.play();
      musicRef.current?.volume(normalizedVolume);
    } else {
      musicRef.current?.volume(0);
    }
    setState((prev) => ({ ...prev, musicEnabled: newEnabled }));
  }, [state.musicEnabled, state.isPlaying, normalizedVolume]);

  // Load initial audio on mount
  useEffect(() => {
    const audioData = SCENE_AUDIO[sceneIndex];
    if (!audioData) return;

    ambientRef.current = loadAudio('ambient', audioData.ambient);
    musicRef.current = loadAudio('music', audioData.music);

    // Cleanup on unmount
    return () => {
      ambientRef.current?.unload();
      musicRef.current?.unload();
      ambientRef.current = null;
      musicRef.current = null;
    };
  }, [sceneIndex, loadAudio, fade, normalizedVolume, state.isPlaying, state.ambientEnabled, state.musicEnabled, state.volume]); // Only run once on mount

  // Handle scene changes with crossfade
  useEffect(() => {
    if (prevSceneRef.current === sceneIndex) return;

    const prevAudioData = SCENE_AUDIO[prevSceneRef.current];
    const nextAudioData = SCENE_AUDIO[sceneIndex];

    if (!nextAudioData || !prevAudioData) return;

    const ambientChanged = prevAudioData.ambient !== nextAudioData.ambient;
    const musicChanged = prevAudioData.music !== nextAudioData.music;

    const crossfadeAudio = async () => {
      const fadePromises: Promise<void>[] = [];
      const currentVolume = state.volume / 100; // Calculate here instead of using normalizedVolume

      if (ambientChanged && ambientRef.current) {
        fadePromises.push(
          fade(ambientRef.current, currentVolume, 0, AUDIO.CROSSFADE_DURATION).then(() => {
            ambientRef.current?.unload();
            ambientRef.current = loadAudio('ambient', nextAudioData.ambient);
            if (state.isPlaying && state.ambientEnabled) {
              ambientRef.current.play();
              fade(ambientRef.current, 0, currentVolume, AUDIO.CROSSFADE_DURATION);
            }
          })
        );
      }

      if (musicChanged && musicRef.current) {
        fadePromises.push(
          fade(musicRef.current, currentVolume, 0, AUDIO.CROSSFADE_DURATION).then(() => {
            musicRef.current?.unload();
            musicRef.current = loadAudio('music', nextAudioData.music);
            if (state.isPlaying && state.musicEnabled) {
              musicRef.current.play();
              fade(musicRef.current, 0, currentVolume, AUDIO.CROSSFADE_DURATION);
            }
          })
        );
      }

      await Promise.all(fadePromises);
    };

    crossfadeAudio();
    prevSceneRef.current = sceneIndex;
  }, [sceneIndex, loadAudio, fade, state.volume, state.isPlaying, state.ambientEnabled, state.musicEnabled]);

  return {
    ...state,
    togglePlay,
    setVolume,
    toggleMute,
    toggleAmbient,
    toggleMusic,
  };
}