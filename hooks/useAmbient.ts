/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from "react";
import { Howl } from "howler";
import { getAmbientById, type AmbientSoundId } from "@/lib/audio/ambient";
import { AMBIENT } from "@/lib/constants";

interface UseAmbientProps {
  initialSound?: AmbientSoundId;
  initialVolume?: number;
}

export function useAmbient({
  initialSound = "none",
  initialVolume = AMBIENT.DEFAULT_VOLUME,
}: UseAmbientProps = {}) {
  const [currentSound, setCurrentSound] =
    useState<AmbientSoundId>(initialSound);

  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  const howlRef = useRef<Howl | null>(null);
  const isPlayingRef = useRef(false);
  const volumeBeforeMuteRef = useRef(volume);
  const previousSoundRef = useRef<AmbientSoundId>("none");

  const isPlaying = currentSound !== "none" && !isPaused;

  // Restore preferences from localStorage
  useEffect(() => {
    const storedSound = localStorage.getItem(AMBIENT.STORAGE_KEY);
    if (storedSound) {
      setCurrentSound(storedSound as AmbientSoundId);
    }
    const storedVolume = localStorage.getItem(AMBIENT.VOLUME_STORAGE_KEY);
    if (storedVolume) {
      setVolume(parseFloat(storedVolume));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      howlRef.current?.unload();
    };
  }, []);

  // Handle sound changes
  useEffect(() => {
    const soundConfig = getAmbientById(currentSound);

    // Fade out and unload previous
    if (howlRef.current) {
      const oldHowl = howlRef.current;
      oldHowl.fade(oldHowl.volume(), 0, AMBIENT.CROSSFADE_DURATION);
      setTimeout(() => {
        oldHowl.unload();
      }, AMBIENT.CROSSFADE_DURATION);
      howlRef.current = null;
    }

    if (!soundConfig.src) {
      isPlayingRef.current = false;
      return;
    }

    const targetVolume = isMuted ? 0 : volume;

    const howl = new Howl({
      src: [soundConfig.src],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
      onload: () => {},
      onloaderror: (_id, error) => {
        console.error(`❌ Failed to load: ${soundConfig.name}`, error);
        setCurrentSound("none");
      },
      onplayerror: (_id, error) => {
        console.error(`❌ Playback error: ${soundConfig.name}`, error);
      },
    });

    howlRef.current = howl;

    if (!isPaused) {
      howl.play();
      howl.fade(0, targetVolume, AMBIENT.CROSSFADE_DURATION);
      isPlayingRef.current = true;
    }

    localStorage.setItem(AMBIENT.STORAGE_KEY, currentSound);
  }, [currentSound, isPaused]);

  // Handle volume changes (separate from sound loading)
  useEffect(() => {
    if (howlRef.current && isPlayingRef.current && !isMuted) {
      howlRef.current.volume(volume);
    }
    localStorage.setItem(AMBIENT.VOLUME_STORAGE_KEY, volume.toString());
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      if (currentSound === "none") {
        const resumeTo =
          previousSoundRef.current !== "none"
            ? previousSoundRef.current
            : "rain-light";
        setCurrentSound(resumeTo);
      } else {
        // Sound is loaded but not playing — start it
        if (howlRef.current) {
          const targetVolume = isMuted ? 0 : volume;
          howlRef.current.play();
          howlRef.current.fade(0, targetVolume, AMBIENT.CROSSFADE_DURATION);
          isPlayingRef.current = true;
        }
      }
    } else if (currentSound !== "none") {
      setIsPaused(true);
      previousSoundRef.current = currentSound;
      setCurrentSound("none");
    }
  }, [currentSound, isPaused, isMuted, volume]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (newMuted) {
        volumeBeforeMuteRef.current = volume;
        howlRef.current?.volume(0);
      } else {
        howlRef.current?.volume(volumeBeforeMuteRef.current);
      }
      return newMuted;
    });
  }, [volume]);

  const changeSound = useCallback((soundId: AmbientSoundId) => {
    setIsPaused(false);
    setCurrentSound(soundId);
  }, []);

  return {
    currentSound,
    setCurrentSound: changeSound,
    volume,
    setVolume,
    isMuted,
    isPlaying,
    togglePlay,
    toggleMute,
  };
}
