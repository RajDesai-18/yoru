"use client";

import { useState } from "react";
import Scene from "./Scene";
import { SceneIndicator } from "./SceneIndicator";
import { FXOverlay } from "./FXOverlay";
import { Controls } from "@/components/ui/Controls";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useAudio } from "@/hooks/useAudio";
import { useIdleDetection } from "@/hooks/useIdleDetection";
import { useFullscreen } from "@/hooks/useFullscreen";
import { SCENES } from "@/lib/constants";

export function SceneContainer() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(true);

    const audio = useAudio({ sceneIndex: currentIndex });
    const { toggleFullscreen } = useFullscreen();

    const nextScene = () => {
        setCurrentIndex((prev) => (prev + 1) % SCENES.length);
    };

    const prevScene = () => {
        setCurrentIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
    };

    // Idle detection
    useIdleDetection({
        onIdle: () => setIsControlsVisible(false),
        onActive: () => setIsControlsVisible(true),
        timeout: 3000,
        enabled: true,
    });

    // Keyboard shortcuts
    useKeyboard({
        onSpace: () => audio.togglePlay(),
        onLeft: prevScene,
        onRight: nextScene,
        onKeyA: () => audio.toggleAmbient(),
        onKeyM: () => audio.toggleMusic(),
        onKeyF: toggleFullscreen,
    });

    const handleVolumeChange = (value: number) => {
        audio.setVolume(value);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Scene layers */}
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
                isPlaying={audio.isPlaying}
                isMuted={audio.isMuted}
                volume={audio.volume}
                isAmbientEnabled={audio.ambientEnabled}
                isMusicEnabled={audio.musicEnabled}
                isVisible={isControlsVisible}
                onPlayPause={() => audio.togglePlay()}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={() => audio.toggleMute()}
                onAmbientToggle={() => audio.toggleAmbient()}
                onMusicToggle={() => audio.toggleMusic()}
                onFullscreen={toggleFullscreen}
            />
        </div>
    );
}
