'use client';

import { useState, useEffect, useCallback } from 'react';
import { SCENES, TIMING } from '@/lib/constants';
import Scene from './Scene';
import { useAudio } from '@/hooks/useAudio';
import { useKeyboard } from '@/hooks/useKeyboard';
import { SceneIndicator } from './SceneIndicator';

export function SceneContainer() {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [ambientEnabled, setAmbientEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);

    // Audio system
    const audio = useAudio({ sceneIndex: currentSceneIndex });

    // Navigate to next scene
    const nextScene = useCallback(() => {
        setCurrentSceneIndex((prev) => (prev + 1) % SCENES.length);
    }, []);

    // Navigate to previous scene
    const previousScene = useCallback(() => {
        setCurrentSceneIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
    }, []);

    // Handle play/pause toggle
    const handleTogglePlay = useCallback(() => {
        const newIsPlaying = audio.togglePlay();
        setIsPlaying(newIsPlaying);
    }, [audio]);

    // Handle ambient toggle
    const handleToggleAmbient = useCallback(() => {
        const newEnabled = audio.toggleAmbient();
        setAmbientEnabled(newEnabled);
    }, [audio]);

    // Handle music toggle
    const handleToggleMusic = useCallback(() => {
        const newEnabled = audio.toggleMusic();
        setMusicEnabled(newEnabled);
    }, [audio]);

    // Keyboard navigation
    useKeyboard({
        onLeft: previousScene,
        onRight: nextScene,
        onSpace: handleTogglePlay,
        onKeyA: handleToggleAmbient,
        onKeyM: handleToggleMusic,
    });

    // Auto-cycle scenes
    useEffect(() => {
        const timer = setInterval(nextScene, TIMING.SCENE_DURATION);
        return () => clearInterval(timer);
    }, [nextScene]);

    return (
        <>
            {/* Scene layers */}
            <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
                {SCENES.map((scene, index) => (
                    <Scene
                        key={scene.id}
                        scene={scene}
                        isActive={index === currentSceneIndex}
                    />
                ))}
            </div>

            {/* Scene indicator dots */}
            <SceneIndicator currentIndex={currentSceneIndex} />

            {/* Debug info - remove in production */}
            <div className="fixed top-4 left-4 z-50 text-white/70 text-sm font-mono space-y-1">
                <div>Scene: {currentSceneIndex + 1}/{SCENES.length}</div>
                <div>{isPlaying ? '▶️ Playing' : '⏸️ Paused'} (Space)</div>
                <div>🌿 Ambient: {ambientEnabled ? 'ON' : 'OFF'} (A)</div>
                <div>🎵 Music: {musicEnabled ? 'ON' : 'OFF'} (M)</div>
                <div className="text-white/40 pt-2">← → to change scenes</div>
            </div>
        </>
    );
}