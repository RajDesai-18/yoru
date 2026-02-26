"use client";

import type { FXId } from "@/lib/constants";
import { BokehOverlay } from "./fx/BokehOverlay";
import { FirefliesOverlay } from "./fx/FirefliesOverlay";
import { ParticlesOverlay } from "./fx/ParticlesOverlay";

interface FXLayerProps {
  activeFX: FXId;
}

export function FXLayer({ activeFX }: FXLayerProps) {
  switch (activeFX) {
    case "bokeh":
      return <BokehOverlay />;
    case "particles":
      return <ParticlesOverlay />;
    case "fireflies":
      return <FirefliesOverlay />;
    default:
      return null;
  }
}
