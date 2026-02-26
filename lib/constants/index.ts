export interface Scene {
  id: string;
  name: string;
  image: string;
  mobileImage?: string;
  video?: string;
  soundId: string;
  objectPosition?: string;
}

export const TIMING = {
  SCENE_DURATION: 120000,
  CROSSFADE_DURATION: 3000,
  IDLE_TIMEOUT: 5000,
  UI_FADE_DURATION: 300,
} as const;

export const SCENES: Scene[] = [
  // Rain — Light
  {
    id: "rain-1",
    name: "Rain 1",
    image: "/scenes/rain-1.png",
    mobileImage: "/scenes/rain-1-mobile.png",
    video: "/scenes/videos/rain-1.mp4",
    soundId: "rain-light",
    objectPosition: "70% center",
  },
  {
    id: "rain-2",
    name: "Rain 2",
    image: "/scenes/rain-2.png",
    video: "/scenes/videos/rain-2.mp4",
    soundId: "rain-light",
  },
  // Rain — Heavy
  {
    id: "rain-3",
    name: "Rain 3",
    image: "/scenes/rain-3.png",
    mobileImage: "/scenes/rain-3-mobile.png",
    video: "/scenes/videos/rain-3.mp4",
    soundId: "rain-heavy",
  },
  {
    id: "rain-4",
    name: "Rain 4",
    image: "/scenes/rain-4.png",
    video: "/scenes/videos/rain-4.mp4",
    soundId: "rain-heavy",
  },
  // Ocean / Water
  {
    id: "ocean-1",
    name: "Ocean 1",
    image: "/scenes/ocean-1.png",
    video: "/scenes/videos/ocean-1.mp4",
    soundId: "ocean-waves",
  },
  {
    id: "ocean-2",
    name: "Ocean 2",
    image: "/scenes/ocean-2.png",
    video: "/scenes/videos/ocean-2.mp4",
    soundId: "ocean-waves",
  },
  {
    id: "stream-1",
    name: "Stream",
    image: "/scenes/stream-1.png",
    mobileImage: "/scenes/stream-1-mobile.png",
    soundId: "stream",
  },
  {
    id: "waterfall-1",
    name: "Waterfall",
    image: "/scenes/waterfall-1.png",
    mobileImage: "/scenes/waterfall-1-mobile.png",
    soundId: "waterfall",
  },
  // Cozy
  {
    id: "fireplace-1",
    name: "Fireplace 1",
    image: "/scenes/fireplace-1.png",
    mobileImage: "/scenes/fireplace-1-mobile.png",
    soundId: "fireplace",
  },
  {
    id: "fireplace-2",
    name: "Fireplace 2",
    image: "/scenes/fireplace-2.png",
    soundId: "fireplace",
  },
  {
    id: "coffee-shop-1",
    name: "Coffee Shop 1",
    image: "/scenes/coffee-shop-1.png",
    mobileImage: "/scenes/coffee-shop-1-mobile.png",
    soundId: "coffee-shop",
  },
  {
    id: "coffee-shop-2",
    name: "Coffee Shop 2",
    image: "/scenes/coffee-shop-2.png",
    soundId: "coffee-shop",
  },
  // Nature / Night
  {
    id: "night-1",
    name: "Night 1",
    image: "/scenes/night-1.png",
    soundId: "night",
  },
  {
    id: "night-2",
    name: "Night 2",
    image: "/scenes/night-2.png",
    mobileImage: "/scenes/night-2-mobile.png",
    soundId: "night",
  },
  {
    id: "night-3",
    name: "Night 3",
    image: "/scenes/night-3.png",
    soundId: "night",
  },
  {
    id: "wind-1",
    name: "Wind 1",
    image: "/scenes/wind-1.png",
    mobileImage: "/scenes/wind-1-mobile.png",
    soundId: "wind",
  },
  {
    id: "wind-2",
    name: "Wind 2",
    image: "/scenes/wind-2.png",
    mobileImage: "/scenes/wind-2-mobile.png",
    soundId: "wind",
  },
  // Atmospheric
  {
    id: "scifi-1",
    name: "Sci-Fi 1",
    image: "/scenes/scifi-1.png",
    mobileImage: "/scenes/scifi-1-mobile.png",
    soundId: "scifi-ambience",
  },
  {
    id: "scifi-2",
    name: "Sci-Fi 2",
    image: "/scenes/scifi-2.png",
    soundId: "scifi-ambience",
  },
  {
    id: "handpan-1",
    name: "Handpan",
    image: "/scenes/handpan-1.png",
    soundId: "handpan",
  },
  {
    id: "white-noise-1",
    name: "White Noise",
    image: "/scenes/white-noise-1.png",
    soundId: "white-noise",
  },
];

export const AUDIO = {
  CROSSFADE_DURATION: 500,
  DEFAULT_VOLUME: 0.7,
  FADE_STEP: 0.05,
} as const;

export const AMBIENT = {
  DEFAULT_VOLUME: 0.5,
  CROSSFADE_DURATION: 300,
  STORAGE_KEY: "yoru-ambient-sound",
  VOLUME_STORAGE_KEY: "yoru-ambient-volume",
} as const;

export const VIDEO = {
  STORAGE_KEY: "yoru-video-enabled",
} as const;

export type FXId = "none" | "bokeh" | "fireflies" | "particles";

export interface FXOption {
  id: FXId;
  name: string;
}

export const FX_OPTIONS: FXOption[] = [
  { id: "none", name: "None" },
  { id: "bokeh", name: "Bokeh" },
  { id: "particles", name: "Particles" },
  {
    id: "fireflies",
    name: "Fireflies",
  },
];

export const VISUAL_FX = {
  STORAGE_KEY: "yoru-fx-selected",
  DEFAULT_FX: "none" as FXId,
} as const;
