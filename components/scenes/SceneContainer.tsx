/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import Scene from "./Scene";
import { SceneIndicator } from "./SceneIndicator";
import { FXOverlay } from "./FXOverlay";
import { useAmbient } from "@/hooks/useAmbient";
import { useKeyboard } from "@/hooks/useKeyboard";
import { AmbientSelector } from "@/components/ui/AmbientSelector";
import { Controls } from "@/components/ui/Controls";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import { useFullscreen } from "@/hooks/useFullscreen";
import { SCENES } from "@/lib/constants";

export function SceneContainer() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [manualOverride, setManualOverride] = useState(false);
    const [isControlsVisible, setIsControlsVisible] = useState(true);
    const [showAmbientSelector, setShowAmbientSelector] = useState(false);

    const ambient = useAmbient();
    
    useEffect(() => {
        if (manualOverride) return;
        const sceneIndex = SCENES.findIndex((s) => s.soundId === ambient.currentSound);
        if (sceneIndex !== -1) {
            setCurrentIndex(sceneIndex);
        }
    }, [ambient.currentSound, manualOverride]);
    
    const { toggleFullscreen } = useFullscreen();
    const ambientSelectorRef = useRef<HTMLDivElement>(null);

    const nextScene = () => {
        setManualOverride(true);
        setCurrentIndex((prev) => (prev + 1) % SCENES.length);
    };

    const prevScene = () => {
        setManualOverride(true);
        setCurrentIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
    };

    

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
        <div className="relative w-full h-screen overflow-hidden bg-black">
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

            <Controls
                isPlaying={ambient.isPlaying}
                isMuted={ambient.isMuted}
                volume={ambient.volume}
                isVisible={isControlsVisible}
                onPlayPause={() => ambient.togglePlay()}
                onVolumeChange={(value) => ambient.setVolume(value)}
                onMuteToggle={() => ambient.toggleMute()}
                onFullscreen={toggleFullscreen}
                onAmbientSelectorToggle={() =>
                    setShowAmbientSelector(!showAmbientSelector)
                }
            />

            <AmbientSelector
                ref={ambientSelectorRef}
                currentSound={ambient.currentSound}
                onSoundChange={(soundId) => {
                    setManualOverride(false);
                    ambient.setCurrentSound(soundId);
                }}
                isVisible={showAmbientSelector && isControlsVisible}
            />
        </div>
    );
}