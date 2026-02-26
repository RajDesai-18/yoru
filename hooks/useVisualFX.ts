/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { VISUAL_FX, FX_OPTIONS } from "@/lib/constants";
import type { FXId } from "@/lib/constants";

export function useVisualFX() {
  const [selectedFX, setSelectedFX] = useState<FXId>(VISUAL_FX.DEFAULT_FX);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);

    const stored = localStorage.getItem(VISUAL_FX.STORAGE_KEY);
    if (stored && FX_OPTIONS.some((fx) => fx.id === stored)) {
      setSelectedFX(stored as FXId);
    }

    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  const setFX = useCallback((id: FXId) => {
    setSelectedFX(id);
    localStorage.setItem(VISUAL_FX.STORAGE_KEY, id);
  }, []);

  const toggleFX = useCallback(() => {
    setSelectedFX((prev) => {
      const next = prev === "none" ? "particles" : "none";
      localStorage.setItem(VISUAL_FX.STORAGE_KEY, next);
      return next;
    });
  }, []);

  const activeFX = reducedMotion ? "none" : selectedFX;

  return {
    selectedFX,
    activeFX,
    reducedMotion,
    setFX,
    toggleFX,
    isActive: activeFX !== "none",
  };
}
