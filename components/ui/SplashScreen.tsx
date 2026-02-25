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
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

interface SplashScreenProps {
  isVisible: boolean;
  onEnter: () => void;
}

export function SplashScreen({ isVisible, onEnter }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 30, damping: 20 });
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

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
  const waveAmp = 0.045;

  const kanjiStyle = {
    fontFamily: "'Clash Display', sans-serif",
    fontWeight: 600 as const,
  };
  const subtitleStyle = {
    fontFamily: "'Clash Display', sans-serif",
  };

  // Mobile: use clip-path for fill animation (more reliable than SVG mask on iOS)
  const clipPercent = Math.max(0, 100 - displayProgress);

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
          transition={{
            duration: prefersReducedMotion ? 0 : 1.2,
            ease: "easeInOut",
          }}
        >
          {/* SVG wave mask — desktop only */}
          {!prefersReducedMotion && !isTouch && (
            <svg className="absolute" width="0" height="0">
              <defs>
                <mask id={maskId} maskContentUnits="objectBoundingBox">
                  <motion.g
                    animate={{ x: [0, -0.5] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
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
                        Q 0.05 ${fillY / 100 - waveAmp} 0.1 ${fillY / 100}
                        Q 0.15 ${fillY / 100 + waveAmp} 0.2 ${fillY / 100}
                        Q 0.25 ${fillY / 100 - waveAmp} 0.3 ${fillY / 100}
                        Q 0.35 ${fillY / 100 + waveAmp} 0.4 ${fillY / 100}
                        Q 0.45 ${fillY / 100 - waveAmp} 0.5 ${fillY / 100}
                        Q 0.55 ${fillY / 100 + waveAmp} 0.6 ${fillY / 100}
                        Q 0.65 ${fillY / 100 - waveAmp} 0.7 ${fillY / 100}
                        Q 0.75 ${fillY / 100 + waveAmp} 0.8 ${fillY / 100}
                        Q 0.85 ${fillY / 100 - waveAmp} 0.9 ${fillY / 100}
                        Q 0.95 ${fillY / 100 + waveAmp} 1.0 ${fillY / 100}
                        L 1.0 0 L 0 0 Z
                      `}
                      fill="black"
                    />
                  </motion.g>
                </mask>
              </defs>
            </svg>
          )}

          {/* Kanji + subtitle */}
          <motion.div
            className="relative select-none flex flex-col items-center"
            initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
            animate={
              zooming ? { opacity: 0, scale: 8 } : { opacity: 1, scale: 1 }
            }
            transition={
              zooming
                ? { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }
                : {
                    duration: prefersReducedMotion ? 0 : 1,
                    delay: prefersReducedMotion ? 0 : 0.3,
                  }
            }
          >
            <div className="relative">
              {prefersReducedMotion ? (
                <p
                  className="text-white text-[9rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] leading-none"
                  style={kanjiStyle}
                >
                  夜
                </p>
              ) : isTouch ? (
                /* Mobile: clip-path based fill — no SVG mask issues */
                <>
                  <p
                    className="text-white/10 text-[9rem] sm:text-[14rem] leading-none"
                    style={kanjiStyle}
                  >
                    夜
                  </p>
                  <p
                    className="absolute inset-0 text-white text-[9rem] sm:text-[14rem] leading-none"
                    style={{
                      ...kanjiStyle,
                      clipPath: `inset(${clipPercent}% 0 0 0)`,
                      transition: "clip-path 0.3s ease-out",
                    }}
                  >
                    夜
                  </p>
                </>
              ) : (
                /* Desktop: wave mask fill */
                <>
                  <p
                    className="text-white/10 text-[9rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] leading-none"
                    style={kanjiStyle}
                  >
                    夜
                  </p>
                  <p
                    className="absolute inset-0 text-white text-[9rem] sm:text-[14rem] md:text-[18rem] lg:text-[22rem] leading-none"
                    style={{
                      ...kanjiStyle,
                      mask: `url(#${maskId})`,
                      WebkitMask: `url(#${maskId})`,
                    }}
                  >
                    夜
                  </p>
                </>
              )}
            </div>

            {/* Romanji + English subtitle */}
            <motion.div
              className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-5"
              initial={{ opacity: 0 }}
              animate={zooming ? { opacity: 0 } : { opacity: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.8,
                delay: prefersReducedMotion ? 0 : 0.8,
              }}
            >
              <span
                className="text-white/40 text-lg sm:text-xl tracking-[0.4em] uppercase"
                style={{ ...subtitleStyle, fontWeight: 500 }}
              >
                yoru
              </span>
              <span className="text-white/15 text-base sm:text-lg">·</span>
              <span
                className="text-white/25 text-lg sm:text-xl tracking-[0.3em] uppercase"
                style={{ ...subtitleStyle, fontWeight: 400 }}
              >
                night
              </span>
            </motion.div>
          </motion.div>

          {/* Loading / Enter prompt */}
          <div className="mt-8 sm:mt-10 h-6 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!loaded ? (
                <motion.p
                  key="loading"
                  className="text-white/60 text-xs sm:text-sm tracking-[0.3em] uppercase"
                  style={{ ...subtitleStyle, fontWeight: 600 }}
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
                  className="text-white/60 text-xs sm:text-sm tracking-[0.3em]"
                  style={{ ...subtitleStyle, fontWeight: 600 }}
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
                  {isTouch ? "Tap to enter" : "Click to enter"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
