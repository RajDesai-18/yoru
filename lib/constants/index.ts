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

// Scene data - 12 static images + 3 videos
export const SCENES: Scene[] = [
  // Video scenes (prioritize these for visual interest)
  {
    id: "scene-1",
    name: "Scene 1",
    image: "/scenes/scene-1.png",
    video: "/scenes/scene-1.mp4",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
  {
    id: "scene-2",
    name: "Scene 2",
    image: "/scenes/scene-2.png",
    video: "/scenes/scene-2.mp4",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
  {
    id: "scene-3",
    name: "Scene 3",
    image: "/scenes/scene-3.png",
    video: "/scenes/scene-3.mp4",
    ambient: "/audio/ambient-2.mp3",
    music: "/audio/music-2.mp3",
  },
  // Static image scenes
  {
    id: "scene-4",
    name: "Scene 4",
    image: "/scenes/scene-4.png",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
  {
    id: "scene-5",
    name: "Scene 5",
    image: "/scenes/scene-5.png",
    ambient: "/audio/ambient-2.mp3",
    music: "/audio/music-2.mp3",
  },
  {
    id: "scene-6",
    name: "Scene 6",
    image: "/scenes/scene-6.png",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
  {
    id: "scene-7",
    name: "Scene 7",
    image: "/scenes/scene-7.png",
    ambient: "/audio/ambient-2.mp3",
    music: "/audio/music-2.mp3",
  },
  {
    id: "scene-8",
    name: "Scene 8",
    image: "/scenes/scene-8.png",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
  {
    id: "scene-9",
    name: "Scene 9",
    image: "/scenes/scene-9.png",
    ambient: "/audio/ambient-2.mp3",
    music: "/audio/music-2.mp3",
  },
  {
    id: "scene-10",
    name: "Scene 10",
    image: "/scenes/scene-10.png",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
  {
    id: "scene-11",
    name: "Scene 11",
    image: "/scenes/scene-11.png",
    ambient: "/audio/ambient-2.mp3",
    music: "/audio/music-2.mp3",
  },
  {
    id: "scene-12",
    name: "Scene 12",
    image: "/scenes/scene-12.png",
    ambient: "/audio/ambient-1.mp3",
    music: "/audio/music-1.mp3",
  },
];

// Audio Configuration
export const AUDIO = {
  CROSSFADE_DURATION: 500, // ms - faster than visual fade for smoother transitions
  DEFAULT_VOLUME: 0.7, // 70% volume
  FADE_STEP: 0.05, // Volume increment during fade (smoother = smaller steps)
} as const;
