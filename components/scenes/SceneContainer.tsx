/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Scene from "./Scene";
import { SceneIndicator } from "./SceneIndicator";
import { FXOverlay } from "./FXOverlay";
import { useAmbient } from "@/hooks/useAmbient";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useSwipeVolume } from "@/hooks/useSwipeVolume";
import { AmbientSelector } from "@/components/ui/AmbientSelector";
import { Controls } from "@/components/ui/Controls";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import { useFullscreen } from "@/hooks/useFullscreen";
import { SCENES } from "@/lib/constants";
import { getAmbientById } from "@/lib/audio/ambient";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { SplashScreen } from "@/components/ui/SplashScreen";
import {
  MobileInstructions,
  useInstructionsSeen,
} from "@/components/ui/MobileInstructions";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

export function SceneContainer() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [manualOverride, setManualOverride] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showAmbientSelector, setShowAmbientSelector] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const ambient = useAmbient();
  const { seen: instructionsSeen, markSeen: markInstructionsSeen } =
    useInstructionsSeen();

  // Show instructions automatically on first visit (after splash)
  useEffect(() => {
    if (!showSplash && !instructionsSeen && isTouchDevice()) {
      const timer = setTimeout(() => setShowInstructions(true), 800);
      return () => clearTimeout(timer);
    }
  }, [showSplash, instructionsSeen]);

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

  // Touch zones: left 30% = prev, right 30% = next, center 40% = toggle UI
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

      if (showInstructions) {
        return;
      }

      const x = e.clientX;
      const width = window.innerWidth;
      const leftZone = width * 0.2;
      const rightZone = width * 0.8;

      if (x < leftZone) {
        prevScene();
      } else if (x > rightZone) {
        nextScene();
      } else {
        setIsControlsVisible((prev) => !prev);
      }
    },
    [showAmbientSelector, showInstructions, nextScene, prevScene]
  );

  // Swipe up/down for volume
  const { onTouchStart: volumeTouchStart, onTouchMove: volumeTouchMove } =
    useSwipeVolume({
      volume: ambient.volume,
      onVolumeChange: (v) => ambient.setVolume(v),
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

  const handleCloseInstructions = useCallback(() => {
    setShowInstructions(false);
    markInstructionsSeen();
  }, [markInstructionsSeen]);

  return (
    <div
      className="relative w-full h-dvh overflow-hidden bg-black"
      onClick={handleSceneTap}
      onTouchStart={volumeTouchStart}
      onTouchMove={volumeTouchMove}
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

      <div ref={controlsRef} onClick={(e) => e.stopPropagation()}>
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
          onInstructionsToggle={() => setShowInstructions((prev) => !prev)}
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
      <MobileInstructions
        isVisible={showInstructions}
        onClose={handleCloseInstructions}
      />
      <SplashScreen
        isVisible={showSplash}
        onEnter={() => setShowSplash(false)}
      />
    </div>
  );
}