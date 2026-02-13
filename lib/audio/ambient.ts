export const AMBIENT_SOUNDS = [
  {
    id: "none",
    name: "None",
    description: "Silence",
    src: null,
    category: "control",
    sceneId: "none",
  },
  {
    id: "rain-light",
    name: "Light Rain",
    description: "Gentle rain on window",
    src: "/audio/ambient/rain-light.mp3",
    category: "weather",
    sceneId: ["rain-1", "rain-2", "rain-3", "rain-4"],
  },
  {
    id: "rain-heavy",
    name: "Thunderstorm",
    description: "Heavy rain with thunder",
    src: "/audio/ambient/rain-heavy.mp3",
    category: "weather",
    sceneId: ["rain-1", "rain-2", "rain-3", "rain-4"],
  },
  {
    id: "ocean-waves",
    name: "Ocean Waves",
    description: "Rhythmic waves on beach",
    src: "/audio/ambient/ocean-waves.mp3",
    category: "nature",
    sceneId: ["ocean-1", "ocean-2"],
  },
  {
    id: "stream",
    name: "Stream",
    description: "Flowing water",
    src: "/audio/ambient/stream.mp3",
    category: "nature",
    sceneId: "stream-1",
  },
  {
    id: "waterfall",
    name: "Waterfall",
    description: "Cascading water",
    src: "/audio/ambient/waterfall.mp3",
    category: "nature",
    sceneId: "waterfall-1",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    description: "Crackling fire",
    src: "/audio/ambient/fireplace.mp3",
    category: "cozy",
    sceneId: ["fireplace-1", "fireplace-2"],
  },
  {
    id: "wind",
    name: "Wind",
    description: "Gentle breeze",
    src: "/audio/ambient/wind.mp3",
    category: "nature",
    sceneId: ["wind-1", "wind-2"],
  },
  {
    id: "night",
    name: "Night",
    description: "Nighttime ambience",
    src: "/audio/ambient/night.mp3",
    category: "nature",
    sceneId: ["night-1", "night-2", "night-3"],
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    description: "Café chatter and dishes",
    src: "/audio/ambient/coffee-shop.mp3",
    category: "urban",
    sceneId: ["coffee-1", "coffee-2"],
  },
  {
    id: "scifi-ambience",
    name: "Sci-Fi",
    description: "Futuristic ambience",
    src: "/audio/ambient/scifi-ambience.mp3",
    category: "atmospheric",
    sceneId: ["scifi-1", "scifi-2"],
  },
  {
    id: "handpan",
    name: "Handpan",
    description: "Melodic handpan tones",
    src: "/audio/ambient/handpan.mp3",
    category: "musical",
    sceneId: "handpan-1",
  },
  {
    id: "white-noise",
    name: "White Noise",
    description: "Pure white noise",
    src: "/audio/ambient/white-noise.mp3",
    category: "focus",
    sceneId: "white-noise-1",
  },
] as const;

export type AmbientSoundId = (typeof AMBIENT_SOUNDS)[number]["id"];

export const DEFAULT_AMBIENT: AmbientSoundId = "none";

export function getAmbientById(id: AmbientSoundId) {
  return AMBIENT_SOUNDS.find((sound) => sound.id === id) ?? AMBIENT_SOUNDS[0];
}

export function getAmbientsByCategory() {
  const grouped: Record<string, (typeof AMBIENT_SOUNDS)[number][]> = {};

  AMBIENT_SOUNDS.forEach((sound) => {
    if (!grouped[sound.category]) {
      grouped[sound.category] = [];
    }
    grouped[sound.category]!.push(sound);
  });

  return grouped;
}
