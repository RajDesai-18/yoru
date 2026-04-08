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
import { useSpotify } from "@/hooks/useSpotify";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useAudioSource } from "@/hooks/useAudioSource";
import { startPlayback } from "@/lib/spotify/api";
import SpotifySelector from "@/components/ui/SpotifySelector";
import { NowPlaying } from "@/components/ui/NowPlaying";

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
  const [showSpotifySelector, setShowSpotifySelector] = useState(false);
  const [activePlaylistUri, setActivePlaylistUri] = useState<string | null>(
    null
  );
  const [activeTrackUri, setActiveTrackUri] = useState<string | null>(null);
  const [spotifyVolume, setSpotifyVolume] = useState(0.5);
  const [spotifyMuted, setSpotifyMuted] = useState(false);
  const spotifyVolumeBeforeMute = useRef(0.5);

  const ambient = useAmbient();
  const { seen: instructionsSeen, markSeen: markInstructionsSeen } =
    useInstructionsSeen();

  const videoMode = useVideoMode();
  const visualFX = useVisualFX();
  const spotify = useSpotify();
  const spotifyPlayer = useSpotifyPlayer(spotify.accessToken);
  const audioSource = useAudioSource();
  const spotifySelectorRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (spotify.isConnected && spotifyPlayer.isReady) {
      audioSource.setSource("spotify");
    }
    if (!spotify.isConnected) {
      audioSource.setSource("builtin");
    }
  }, [spotify.isConnected, spotifyPlayer.isReady, audioSource]);

  useEffect(() => {
    if (spotifyPlayer.nowPlaying?.trackUri) {
      setActiveTrackUri(spotifyPlayer.nowPlaying.trackUri);
    }
  }, [spotifyPlayer.nowPlaying?.trackUri]);

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

  const handleSelectTrack = useCallback(
    async (playlistUri: string, trackUri: string, keepOpen?: boolean) => {
      if (
        !spotify.accessToken ||
        !spotifyPlayer.deviceId ||
        !spotifyPlayer.isReady
      )
        return;
      try {
        await startPlayback(
          spotify.accessToken,
          spotifyPlayer.deviceId,
          playlistUri,
          trackUri || undefined
        );
        setActivePlaylistUri(playlistUri);
        setActiveTrackUri(trackUri || null);
        if (!keepOpen) {
          setShowSpotifySelector(false);
        }
        audioSource.setSource("spotify");
      } catch (err) {
        console.error("Failed to start playback:", err);
      }
    },
    [
      spotify.accessToken,
      spotifyPlayer.deviceId,
      spotifyPlayer.isReady,
      audioSource,
    ]
  );

  const handlePlayPause = useCallback(() => {
    ambient.togglePlay();
  }, [ambient]);

  const handleSpotifyVolumeChange = useCallback(
    (volume: number) => {
      setSpotifyVolume(volume);
      setSpotifyMuted(false);
      spotifyPlayer.setVolume(volume);
    },
    [spotifyPlayer]
  );

  const handleSpotifyMuteToggle = useCallback(() => {
    if (spotifyMuted) {
      setSpotifyMuted(false);
      setSpotifyVolume(spotifyVolumeBeforeMute.current);
      spotifyPlayer.setVolume(spotifyVolumeBeforeMute.current);
    } else {
      spotifyVolumeBeforeMute.current = spotifyVolume;
      setSpotifyMuted(true);
      spotifyPlayer.setVolume(0);
    }
  }, [spotifyMuted, spotifyVolume, spotifyPlayer]);

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

      if (showSpotifySelector) {
        setShowSpotifySelector(false);
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

      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;
      lastTapRef.current = now;

      if (timeSinceLastTap < 300) {
        if (tapTimerRef.current) {
          clearTimeout(tapTimerRef.current);
          tapTimerRef.current = null;
        }
        handlePlayPause();
      } else {
        tapTimerRef.current = setTimeout(() => {
          setIsControlsVisible((prev) => !prev);
          tapTimerRef.current = null;
        }, 300);
      }
    },
    [
      showAmbientSelector,
      showFXSelector,
      showSpotifySelector,
      showInstructions,
      nextScene,
      prevScene,
      handlePlayPause,
    ]
  );

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
    onSpace: handlePlayPause,
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
      const target = event.target as Node;
      const isControlsClick = controlsRef.current?.contains(target);

      if (
        showAmbientSelector &&
        ambientSelectorRef.current &&
        !ambientSelectorRef.current.contains(target) &&
        !isControlsClick
      ) {
        setShowAmbientSelector(false);
      }
      if (
        showFXSelector &&
        fxSelectorRef.current &&
        !fxSelectorRef.current.contains(target) &&
        !isControlsClick
      ) {
        setShowFXSelector(false);
      }
      if (
        showSpotifySelector &&
        spotifySelectorRef.current &&
        !spotifySelectorRef.current.contains(target) &&
        !isControlsClick
      ) {
        setShowSpotifySelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAmbientSelector, showFXSelector, showSpotifySelector]);

  const handleCloseInstructions = useCallback(() => {
    setShowInstructions(false);
    markInstructionsSeen();
  }, [markInstructionsSeen]);

  const isPlaying = ambient.isPlaying;

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
              <Scene scene={scene} isActive={isActive && !showVideo} />

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

      <div
        ref={controlsRef}
        onClick={(e) => e.stopPropagation()}
        className="relative"
      >
        <Controls
          isPlaying={isPlaying}
          isMuted={ambient.isMuted}
          volume={ambient.volume}
          isVisible={isControlsVisible}
          showSwipeVolume={showSwipeVolume}
          onPlayPause={handlePlayPause}
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
          spotifyConnected={spotify.isConnected}
          onSpotifySelectorToggle={() =>
            setShowSpotifySelector((prev) => !prev)
          }
          spotifyVolume={spotifyVolume}
          spotifyMuted={spotifyMuted}
          onSpotifyVolumeChange={handleSpotifyVolumeChange}
          onSpotifyMuteToggle={handleSpotifyMuteToggle}
        />

        <SpotifySelector
          ref={spotifySelectorRef}
          isOpen={showSpotifySelector && isControlsVisible}
          isConnected={spotify.isConnected}
          isPlayerReady={spotifyPlayer.isReady}
          accessToken={spotify.accessToken}
          onConnect={spotify.connect}
          onDisconnect={spotify.disconnect}
          onSelectTrack={handleSelectTrack}
          activePlaylistUri={activePlaylistUri}
          activeTrackUri={activeTrackUri}
          queue={spotifyPlayer.queue}
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

      {spotifyPlayer.nowPlaying && (
        <NowPlaying
          trackName={spotifyPlayer.nowPlaying.trackName}
          artistName={spotifyPlayer.nowPlaying.artistName}
          albumArt={spotifyPlayer.nowPlaying.albumArt}
          isVisible={isControlsVisible}
          isPlaying={spotifyPlayer.isPlaying}
          onPlayPause={spotifyPlayer.togglePlay}
          onPrevious={spotifyPlayer.previousTrack}
          onNext={spotifyPlayer.nextTrack}
          shuffleActive={spotifyPlayer.shuffleActive}
          onShuffleToggle={spotifyPlayer.toggleShuffle}
          repeatMode={spotifyPlayer.repeatMode}
          onRepeatCycle={spotifyPlayer.cycleRepeat}
          position={spotifyPlayer.position}
          duration={spotifyPlayer.duration}
          onSeek={spotifyPlayer.seek}
        />
      )}

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