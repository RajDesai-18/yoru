import { useCallback, useState } from "react";

export type AudioSource = "builtin" | "spotify";

interface UseAudioSourceReturn {
  source: AudioSource;
  setSource: (source: AudioSource) => void;
  isSpotify: boolean;
}

export function useAudioSource(): UseAudioSourceReturn {
  const [source, setSource] = useState<AudioSource>("builtin");

  const handleSetSource = useCallback((newSource: AudioSource) => {
    setSource(newSource);
  }, []);

  return {
    source,
    setSource: handleSetSource,
    isSpotify: source === "spotify",
  };
}
