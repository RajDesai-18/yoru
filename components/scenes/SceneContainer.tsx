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
import { FXSelector } from "@/components/ui/FXSelector";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";
import VideoScene from "./VideoScene";
import { useVideoMode } from "@/hooks/useVideoMode";
import { useVisualFX } from "@/hooks/useVisualFX";
import { FXLayer } from "./FXLayer";

export function SceneContainer() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [manualOverride, setManualOverride] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showAmbientSelector, setShowAmbientSelector] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSwipeVolume, setShowSwipeVolume] = useState(false);
  const [showFXSelector, setShowFXSelector] = useState(false);

  const ambient = useAmbient();
  const { seen: instructionsSeen, markSeen: markInstructionsSeen } =
    useInstructionsSeen();

  const videoMode = useVideoMode();
  const visualFX = useVisualFX();

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
  const fxSelectorRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

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
  // Touch zones: left 20% = prev, right 80% = next, center = toggle UI / double-tap play
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

      if (showFXSelector) {
        setShowFXSelector(false);
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
        return;
      }

      if (x > rightZone) {
        nextScene();
        return;
      }

      // Center zone: single tap = toggle UI, double tap = play/pause
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      lastTapRef.current = now;

      if (timeSinceLastTap < 300) {
        // Double tap detected — cancel the single tap timer and play/pause
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        ambient.togglePlay();
      } else {
        // Wait to see if a second tap comes
        tapTimerRef.current = setTimeout(() => {
          setIsControlsVisible((prev) => !prev);
          tapTimerRef.current = null;
        }, 300);
      }
    },
    [
      showAmbientSelector,
      showFXSelector,
      showInstructions,
      nextScene,
      prevScene,
      ambient,
    ]
  );

  // Swipe up/down for volume — shows slider automatically
  const swipeVolumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSwipeVolumeStart = useCallback(() => {
    setShowSwipeVolume(true);
    if (swipeVolumeTimerRef.current) {
      clearTimeout(swipeVolumeTimerRef.current);
    }
  }, []);

  const handleSwipeVolumeChange = useCallback(
    (v: number) => {
      ambient.setVolume(v);
      // Reset auto-hide timer on each change
      if (swipeVolumeTimerRef.current) {
        clearTimeout(swipeVolumeTimerRef.current);
      }
      swipeVolumeTimerRef.current = setTimeout(() => {
        setShowSwipeVolume(false);
      }, 1500);
    },
    [ambient]
  );

  const { onTouchStart: volumeTouchStart, onTouchMove: volumeTouchMove } =
    useSwipeVolume({
      volume: ambient.volume,
      onVolumeChange: handleSwipeVolumeChange,
      onSwipeStart: handleSwipeVolumeStart,
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
    onKeyV: () => videoMode.toggleVideo(),
    onKeyX: () => visualFX.toggleFX(),
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
      if (
        showFXSelector &&
        fxSelectorRef.current &&
        !fxSelectorRef.current.contains(event.target as Node)
      ) {
        setShowFXSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAmbientSelector, showFXSelector]);

  const handleCloseInstructions = useCallback(() => {
    setShowInstructions(false);
    markInstructionsSeen();
  }, [markInstructionsSeen]);

  return (
    <div
      className="relative w-full min-h-dvh h-full overflow-hidden bg-black"
      onClick={handleSceneTap}
      onTouchStart={volumeTouchStart}
      onTouchMove={volumeTouchMove}
    >
      <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
        {SCENES.map((scene, index) => {
          const isActive = index === currentIndex;
          const showVideo = videoMode.shouldShowVideo(index);

          return (
            <div key={scene.id} className="absolute inset-0 w-full h-full">
              {/* Image layer — always rendered, fades out when video is active */}
              <Scene scene={scene} isActive={isActive && !showVideo} />

              {/* Video layer — only mounted when scene has video and video is enabled */}
              {scene.video && !videoMode.isTouch && (
                <VideoScene
                  scene={scene}
                  isActive={isActive && showVideo}
                  preload={
                    videoMode.videoEnabled &&
                    (index === (currentIndex + 1) % SCENES.length ||
                      index ===
                        (currentIndex - 1 + SCENES.length) % SCENES.length)
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      <FXOverlay />
      <FXLayer activeFX={visualFX.activeFX} />

      <SceneIndicator currentIndex={currentIndex} />

      <div ref={controlsRef} onClick={(e) => e.stopPropagation()}>
        <Controls
          isPlaying={ambient.isPlaying}
          isMuted={ambient.isMuted}
          volume={ambient.volume}
          isVisible={isControlsVisible}
          showSwipeVolume={showSwipeVolume}
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
          videoEnabled={videoMode.videoEnabled}
          sceneHasVideo={videoMode.sceneHasVideo(currentIndex)}
          onVideoToggle={videoMode.toggleVideo}
          isTouch={videoMode.isTouch}
          fxEnabled={visualFX.isActive}
          onFXSelectorToggle={() => setShowFXSelector(!showFXSelector)}
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

      <FXSelector
        ref={fxSelectorRef}
        currentFX={visualFX.selectedFX}
        onFXChange={(fxId) => {
          visualFX.setFX(fxId);
        }}
        isVisible={showFXSelector && isControlsVisible}
      />

      <KeyboardShortcuts
        isVisible={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        onReset={handleReset}
      />
      <MobileInstructions
        isVisible={showInstructions}
        onClose={handleCloseInstructions}
        onReset={handleReset}
      />
      <SplashScreen
        isVisible={showSplash}
        onEnter={() => setShowSplash(false)}
      />
    </div>
  );
}
