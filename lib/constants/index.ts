// Scene data structure
export interface Scene {
  id: string;
  name: string;
  image: string;
  video?: string;
  ambient: string;
  music: string;
}

// Timing constants (milliseconds)
export const TIMING = {
  SCENE_DURATION: 120000, // 2 minutes per scene
  CROSSFADE_DURATION: 3000, // 3 second crossfade
  IDLE_TIMEOUT: 5000, // 5 seconds of inactivity hides controls
  UI_FADE_DURATION: 300, // UI fade animation
} as const;

// Audio constants
export const AUDIO = {
  DEFAULT_VOLUME: 0.7,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  VOLUME_STEP: 0.1,
} as const;

// Placeholder scene data (we'll populate this in Phase 2)
export const SCENES: Scene[] = [];