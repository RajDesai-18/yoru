"use client";

import { Scene as SceneType } from "@/lib/constants";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SceneProps {
  scene: SceneType;
  isActive: boolean;
}

export default function Scene({ scene, isActive }: SceneProps) {
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

  const imageSrc = useMobile ? scene.mobileImage! : scene.image;
  const position = scene.objectPosition || "center";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 3 }}
      className="absolute inset-0 w-full h-full"
    >
      <Image
        src={imageSrc}
        alt={scene.name}
        fill
        priority={isActive}
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: position }}
      />
    </motion.div>
  );
}