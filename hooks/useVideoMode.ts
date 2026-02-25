/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { SCENES, VIDEO } from "@/lib/constants";
import { isTouchDevice } from "@/lib/utils/isTouchDevice";

export function useVideoMode() {
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isTouchDevice());
    const stored = localStorage.getItem(VIDEO.STORAGE_KEY);
    if (stored === "true" && !isTouchDevice()) {
      setVideoEnabled(true);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    setVideoEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(VIDEO.STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const sceneHasVideo = useCallback((sceneIndex: number): boolean => {
    const scene = SCENES[sceneIndex];
    return !!scene?.video;
  }, []);

  const shouldShowVideo = useCallback(
    (sceneIndex: number): boolean => {
      if (isTouch) return false;
      return videoEnabled && sceneHasVideo(sceneIndex);
    },
    [isTouch, videoEnabled, sceneHasVideo]
  );

  return {
    videoEnabled,
    toggleVideo,
    sceneHasVideo,
    shouldShowVideo,
    isTouch,
  };
}
