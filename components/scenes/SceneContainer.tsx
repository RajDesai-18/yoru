"use client";

import { SCENES, TIMING } from "@/lib/constants";
import { useState, useEffect, useCallback } from "react";
import Scene from "./Scene";
import { useKeyboard } from "@/hooks/useKeyboard";
import { SceneIndicator } from "./SceneIndicator";

interface SceneContainerProps {
    onSceneChange?: (index: number) => void;
}

export function SceneContainer({onSceneChange}: SceneContainerProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    // Navigate to next scene
    const nextScene = useCallback(() => {
        setCurrentSceneIndex((prev) => {
            const newIndex = (prev + 1) % SCENES.length;
            onSceneChange?.(newIndex);
            return newIndex;
        });
    }, [onSceneChange]);

    // Navigate to previous scene
    const previousScene = useCallback(() => {
        setCurrentSceneIndex((prev) => {
            const newIndex = (prev - 1 + SCENES.length) % SCENES.length;
            onSceneChange?.(newIndex);
            return newIndex;
        });
    }, [onSceneChange]);

    // Keyboard navigation
    useKeyboard({
        onLeft: previousScene,
        onRight: nextScene,
    });

    useEffect(() => {
        const timer = setInterval(nextScene, TIMING.SCENE_DURATION);
        return () => clearInterval(timer);
    }, [nextScene]);

    return (
        <>
            <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
                {SCENES.map((scene, index) => (
                    <Scene
                        key={scene.id}
                        scene={scene}
                        isActive={index === currentSceneIndex}
                    />
                ))}
            </div>
            <SceneIndicator currentIndex={currentSceneIndex} />
        </>
    );
}