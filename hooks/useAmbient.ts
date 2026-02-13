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
  

  const howlRef = useRef<Howl | null>(null);
  const isPlayingRef = useRef(false);
  const volumeBeforeMuteRef = useRef(volume);
  const previousSoundRef = useRef<AmbientSoundId>("none");

  const isPlaying = currentSound !== "none";

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
      onload: () => {
        console.log(`✅ Ambient: ${soundConfig.name}`);
      },
      onloaderror: (_id, error) => {
        console.error(`❌ Failed to load: ${soundConfig.name}`, error);
        setCurrentSound("none");
      },
      onplayerror: (_id, error) => {
        console.error(`❌ Playback error: ${soundConfig.name}`, error);
      },
    });

    howlRef.current = howl;
    howl.play();
    howl.fade(0, targetVolume, AMBIENT.CROSSFADE_DURATION);
    isPlayingRef.current = true;
    localStorage.setItem(AMBIENT.STORAGE_KEY, currentSound);
  }, [currentSound]); // Only re-run when sound changes, not volume

  // Handle volume changes (separate from sound loading)
  useEffect(() => {
    if (howlRef.current && isPlayingRef.current && !isMuted) {
      howlRef.current.volume(volume);
    }
    localStorage.setItem(AMBIENT.VOLUME_STORAGE_KEY, volume.toString());
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current && currentSound !== "none") {
      // Pause: remember what was playing, then stop
      previousSoundRef.current = currentSound;
      setCurrentSound("none");
    } else {
      // Resume: restore previous sound (or default to first real sound)
      const resumeTo =
        previousSoundRef.current !== "none"
          ? previousSoundRef.current
          : "rain-light";
      setCurrentSound(resumeTo);
    }
  }, [currentSound]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (newMuted) {
        volumeBeforeMuteRef.current = volume;
        howlRef.current?.volume(0);
      } else {
        howlRef.current?.volume(volumeBeforeMuteRef.current);
      }
      console.log(newMuted ? "🔇 Ambient muted" : "🔊 Ambient unmuted");
      return newMuted;
    });
  }, [volume]);

  return {
    currentSound,
    setCurrentSound,
    volume,
    setVolume,
    isMuted,
    isPlaying,
    togglePlay,
    toggleMute,
  };
}
