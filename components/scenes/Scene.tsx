"use client";

import { Scene as SceneType } from "@/lib/constants";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface SceneProps {
  scene: SceneType;
  isActive: boolean;
}

export default function Scene({ scene, isActive }: SceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [useMobile, setUseMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setUseMobile(window.innerWidth < 640 && !!scene.mobileImage);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [scene.mobileImage]);

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

  const imageSrc = useMobile ? scene.mobileImage! : scene.image;
  const position = scene.objectPosition || "center";

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
          poster={imageSrc}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={scene.name}
          fill
          priority={isActive}
          sizes={useMobile ? "100vw" : "100vw"}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      )}
    </motion.div>
  );
}