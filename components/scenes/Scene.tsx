"use client";

import { Scene as SceneType } from "@/lib/constants";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface SceneProps {
  scene: SceneType;
  isActive: boolean;
}

export default function Scene({ scene, isActive }: SceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch((error) => {
        console.error("Video playback failed:", error);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 3 }}
      className="absolute inset-0 w-full h-full"
    >
      {scene.video ? (
        <video
          ref={videoRef}
          src={scene.video}
          poster={scene.image}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src={scene.image}
          alt={scene.name}
          fill
          priority={isActive}
          className="object-cover"
        />
      )}
    </motion.div>
  );
}
