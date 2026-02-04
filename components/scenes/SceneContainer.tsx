"use client";

import { SCENES, TIMING } from "@/lib/constants";
import { useState, useEffect } from "react";
import Scene from "./Scene";

export function SceneContainer() {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

    // Auto-advance scenes every 2 minutes
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSceneIndex((prev) => (prev + 1) % SCENES.length);
        }, TIMING.SCENE_DURATION);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full bg-black overflow-hidden">
            {SCENES.map((scene, index) => (
                <Scene
                    key={scene.id}
                    scene={scene}
                    isActive={index === currentSceneIndex}
                />
            ))}
        </div>
    );
}