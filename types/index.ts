export type { Scene } from "@/lib/constants";

export interface AudioState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentScene: number;
}

export interface AudioControls {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextScene: () => void;
  previousScene: () => void;
}
