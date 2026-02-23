/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Scene from "./Scene";
import { SceneIndicator } from "./SceneIndicator";
import { FXOverlay } from "./FXOverlay";
import { useAmbient } from "@/hooks/useAmbient";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useSwipe } from "@/hooks/useSwipe";
import { AmbientSelector } from "@/components/ui/AmbientSelector";
import { Controls } from "@/components/ui/Controls";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import { useFullscreen } from "@/hooks/useFullscreen";
import { SCENES } from "@/lib/constants";
import { getAmbientById } from "@/lib/audio/ambient";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

export function SceneContainer() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [manualOverride, setManualOverride] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showAmbientSelector, setShowAmbientSelector] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const ambient = useAmbient();

  useEffect(() => {
    if (manualOverride) return;
    const sceneIndex = SCENES.findIndex(
      (s) => s.soundId === ambient.currentSound
    );
    if (sceneIndex !== -1) {
      setCurrentIndex(sceneIndex);
    }
  }, [ambient.currentSound, manualOverride]);

  const { toggleFullscreen } = useFullscreen();
  const ambientSelectorRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const nextScene = useCallback(() => {
    setManualOverride(true);
    setCurrentIndex((prev) => (prev + 1) % SCENES.length);
  }, []);

  const prevScene = useCallback(() => {
    setManualOverride(true);
    setCurrentIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  }, []);

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Tap-to-toggle for touch devices
  const handleSceneTap = useCallback(
    (e: React.MouseEvent) => {
      if (!isTouchDevice()) return;

      const target = e.target as HTMLElement;
      if (
        controlsRef.current?.contains(target) ||
        ambientSelectorRef.current?.contains(target)
      ) {
        return;
      }

      // Don't toggle if tapping on the backdrop (z-40 elements)
      if (
        target.closest("[class*='z-40']") ||
        target.closest("[class*='z-50']")
      ) {
        return;
      }

      if (showAmbientSelector) {
        setShowAmbientSelector(false);
        return;
      }

      setIsControlsVisible((prev) => !prev);
    },
    [showAmbientSelector]
  );

  // Swipe navigation
  const { onTouchStart, onTouchEnd } = useSwipe({
    onSwipeLeft: nextScene,
    onSwipeRight: prevScene,
  });

  useIdleDetection({
    onIdle: () => setIsControlsVisible(false),
    onActive: () => setIsControlsVisible(true),
    timeout: 3000,
    enabled: true,
  });

  useKeyboard({
    onSpace: () => ambient.togglePlay(),
    onLeft: prevScene,
    onRight: nextScene,
    onKeyF: toggleFullscreen,
    onKeyM: () => ambient.toggleMute(),
    onUp: () => ambient.setVolume(Math.min(ambient.volume + 0.1, 1)),
    onDown: () => ambient.setVolume(Math.max(ambient.volume - 0.1, 0)),
    onSlash: () => setShowShortcuts((prev) => !prev),
    onKeyR: handleReset,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showAmbientSelector &&
        ambientSelectorRef.current &&
        !ambientSelectorRef.current.contains(event.target as Node)
      ) {
        setShowAmbientSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAmbientSelector]);

  return (
    <div
      className="relative w-full h-dvh overflow-hidden bg-black"
      onClick={handleSceneTap}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
        {SCENES.map((scene, index) => (
          <Scene
            key={scene.id}
            scene={scene}
            isActive={index === currentIndex}
          />
        ))}
      </div>

      <FXOverlay />

      <SceneIndicator currentIndex={currentIndex} />

      <div ref={controlsRef}>
        <Controls
          isPlaying={ambient.isPlaying}
          isMuted={ambient.isMuted}
          volume={ambient.volume}
          isVisible={isControlsVisible}
          onPlayPause={() => ambient.togglePlay()}
          onVolumeChange={(value) => ambient.setVolume(value)}
          onMuteToggle={() => ambient.toggleMute()}
          onFullscreen={toggleFullscreen}
          currentSoundName={getAmbientById(ambient.currentSound).name}
          onAmbientSelectorToggle={() =>
            setShowAmbientSelector(!showAmbientSelector)
          }
          onShortcutsToggle={() => setShowShortcuts((prev) => !prev)}
        />
      </div>

      <AmbientSelector
        ref={ambientSelectorRef}
        currentSound={ambient.currentSound}
        onSoundChange={(soundId) => {
          setManualOverride(false);
          ambient.setCurrentSound(soundId);
        }}
        isVisible={showAmbientSelector && isControlsVisible}
      />
      <KeyboardShortcuts
        isVisible={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        onReset={handleReset}
      />
      <SplashScreen
        isVisible={showSplash}
        onEnter={() => setShowSplash(false)}
      />
    </div>
  );
}
