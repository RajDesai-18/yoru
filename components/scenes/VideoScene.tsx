"use client";

import { Scene as SceneType } from "@/lib/constants";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface VideoSceneProps {
    scene: SceneType;
    isActive: boolean;
    preload?: boolean;
}

export default function VideoScene({ scene, isActive, preload }: VideoSceneProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            videoRef.current.play().catch(() => {
                setHasError(true);
            });
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isActive]);

    const position = scene.objectPosition || "center";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 3 }}
            className="absolute inset-0 w-full h-full"
        >
            {!hasError && scene.video ? (
                <video
                    ref={videoRef}
                    src={scene.video}
                    poster={scene.image}
                    loop
                    muted
                    playsInline
                    preload={isActive || preload ? "auto" : "none"}
                    onError={() => setHasError(true)}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: position }}
                />
            ) : (
                <Image
                    src={scene.image}
                    alt={scene.name}
                    fill
                    className="object-cover"
                    style={{ objectPosition: position }}
                />
            )}
        </motion.div>
    );
}