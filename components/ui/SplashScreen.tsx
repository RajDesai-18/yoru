"use client";

import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { SCENES } from "@/lib/constants";

interface SplashScreenProps {
  isVisible: boolean;
  onEnter: () => void;
}

export function SplashScreen({ isVisible, onEnter }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [zooming, setZooming] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 30, damping: 20 });
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    return smoothProgress.on("change", (v) => {
      const rounded = Math.round(v);
      setDisplayProgress(rounded);
      if (rounded >= 99 && assetsReady) {
        setDisplayProgress(100);
        setLoaded(true);
      }
    });
  }, [smoothProgress, assetsReady]);

  useEffect(() => {
    rawProgress.set(progress);
  }, [progress, rawProgress]);

  useEffect(() => {
    if (!isVisible) return;

    let loadedCount = 0;
    const total = SCENES.length;
    const minDelay = prefersReducedMotion ? 0 : 150;

    SCENES.forEach((scene, index) => {
      const img = new Image();
      img.src = scene.image;

      const onComplete = () => {
        setTimeout(() => {
          loadedCount++;
          setProgress(Math.round((loadedCount / total) * 100));
          if (loadedCount === total) {
            setAssetsReady(true);
          }
        }, minDelay * index);
      };

      img.onload = onComplete;
      img.onerror = onComplete;
    });
  }, [isVisible, prefersReducedMotion]);

  const fillY = displayProgress >= 99 ? -5 : 100 - displayProgress;
  const maskId = "wave-fill-mask";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black cursor-pointer"
          onClick={() => {
            if (loaded && !zooming) {
              if (prefersReducedMotion) {
                onEnter();
              } else {
                setZooming(true);
                setTimeout(() => onEnter(), 1200);
              }
            }
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: "easeInOut" }}
        >
          {/* SVG wave mask definition */}
          {!prefersReducedMotion && (
            <svg className="absolute" width="0" height="0">
              <defs>
                <mask id={maskId} maskContentUnits="objectBoundingBox">
                  <motion.g
                    animate={{ x: [0, -0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <rect
                      x="0"
                      y={fillY / 100}
                      width="2"
                      height="1"
                      fill="white"
                    />
                    <path
                      d={`
                        M 0 ${fillY / 100}
                        Q 0.05 ${fillY / 100 - 0.03} 0.1 ${fillY / 100}
                        Q 0.15 ${fillY / 100 + 0.03} 0.2 ${fillY / 100}
                        Q 0.25 ${fillY / 100 - 0.03} 0.3 ${fillY / 100}
                        Q 0.35 ${fillY / 100 + 0.03} 0.4 ${fillY / 100}
                        Q 0.45 ${fillY / 100 - 0.03} 0.5 ${fillY / 100}
                        Q 0.55 ${fillY / 100 + 0.03} 0.6 ${fillY / 100}
                        Q 0.65 ${fillY / 100 - 0.03} 0.7 ${fillY / 100}
                        Q 0.75 ${fillY / 100 + 0.03} 0.8 ${fillY / 100}
                        Q 0.85 ${fillY / 100 - 0.03} 0.9 ${fillY / 100}
                        Q 0.95 ${fillY / 100 + 0.03} 1.0 ${fillY / 100}
                        L 1.0 0 L 0 0 Z
                      `}
                      fill="black"
                    />
                  </motion.g>
                </mask>
              </defs>
            </svg>
          )}

          {/* 夜 with wavy liquid fill */}
          <motion.div
            className="relative select-none"
            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
            animate={
              zooming ? { opacity: 0, scale: 8 } : { opacity: 1, scale: 1 }
            }
            transition={
              zooming
                ? { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }
                : { duration: prefersReducedMotion ? 0 : 1, delay: prefersReducedMotion ? 0 : 0.3 }
            }
          >
            {prefersReducedMotion ? (
              <p
                className="text-white text-[20rem] leading-none"
                style={{
                  fontFamily: "'Clash Display', sans-serif",
                  fontWeight: 600,
                }}
              >
                夜
              </p>
            ) : (
              <>
                <p
                  className="text-white/10 text-[20rem] leading-none"
                  style={{
                    fontFamily: "'Clash Display', sans-serif",
                    fontWeight: 600,
                  }}
                >
                  夜
                </p>
                <p
                  className="absolute inset-0 text-white text-[20rem] leading-none"
                  style={{
                    fontFamily: "'Clash Display', sans-serif",
                    fontWeight: 600,
                    mask: `url(#${maskId})`,
                    WebkitMask: `url(#${maskId})`,
                  }}
                >
                  夜
                </p>
              </>
            )}
          </motion.div>

          {/* Percentage / Enter prompt */}
          <div className="mt-6 h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!loaded ? (
                <motion.p
                  key="loading"
                  className="text-white/60 text-md tracking-[0.3em] uppercase"
                  style={{
                    fontFamily: "'Clash Display', sans-serif",
                    fontWeight: 600,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  Loading {displayProgress}%
                </motion.p>
              ) : (
                <motion.p
                  key="enter"
                  className="text-white/60 ml-10 text-md tracking-[0.3em]"
                  style={{
                    fontFamily: "'Clash Display', sans-serif",
                    fontWeight: 600,
                  }}
                  initial={{ opacity: 0 }}
                  animate={
                    zooming
                      ? { opacity: 0 }
                      : prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: [0, 1, 0.5, 1] }
                  }
                  transition={
                    zooming
                      ? { duration: 0.3 }
                      : prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 2, repeat: Infinity }
                  }
                >
                  Click to enter
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}