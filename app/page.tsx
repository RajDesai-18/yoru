"use client";

import { SceneContainer } from "@/components/scenes/SceneContainer";
import { FXOverlay } from "@/components/scenes/FXOverlay";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function Home() {
  return (
    <ErrorBoundary>
      <main className="relative w-screen h-dvh overflow-hidden">
        <SceneContainer />
        <FXOverlay />
      </main>
    </ErrorBoundary>
  );
}
