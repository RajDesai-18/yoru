import { SceneContainer } from "@/components/scenes/SceneContainer";
import { FXOverlay } from "@/components/scenes/FXOverlay";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <SceneContainer />
      <FXOverlay />
    </main>
  );
}