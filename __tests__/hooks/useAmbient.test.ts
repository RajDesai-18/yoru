import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAmbient } from "../../hooks/useAmbient";
import { AMBIENT } from "../../lib/constants";

// Mock Howler.js
const mockPlay = vi.fn();
const mockFade = vi.fn();
const mockVolume = vi.fn().mockReturnValue(0);
const mockUnload = vi.fn();

vi.mock("howler", () => ({
  Howl: class MockHowl {
    play = mockPlay;
    fade = mockFade;
    volume = mockVolume;
    unload = mockUnload;

    constructor(options: Record<string, unknown>) {
      if (typeof options.onload === "function") {
        setTimeout(() => (options.onload as () => void)(), 0);
      }
    }
  },
}));

describe("useAmbient", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useAmbient());

    expect(result.current.currentSound).toBe("none");
    expect(result.current.volume).toBe(AMBIENT.DEFAULT_VOLUME);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.isPlaying).toBe(false);
  });

  it("should accept custom initial values", () => {
    const { result } = renderHook(() =>
      useAmbient({ initialSound: "none", initialVolume: 0.8 })
    );

    expect(result.current.volume).toBe(0.8);
  });

  it("should restore sound from localStorage", () => {
    localStorage.setItem(AMBIENT.STORAGE_KEY, "rain-light");

    const { result } = renderHook(() => useAmbient());

    expect(result.current.currentSound).toBe("rain-light");
  });

  it("should restore volume from localStorage", () => {
    localStorage.setItem(AMBIENT.VOLUME_STORAGE_KEY, "0.3");

    const { result } = renderHook(() => useAmbient());

    expect(result.current.volume).toBe(0.3);
  });

  it("should update volume and persist to localStorage", () => {
    const { result } = renderHook(() => useAmbient());

    act(() => {
      result.current.setVolume(0.9);
    });

    expect(result.current.volume).toBe(0.9);
    expect(localStorage.getItem(AMBIENT.VOLUME_STORAGE_KEY)).toBe("0.9");
  });

  it("should toggle mute state", () => {
    const { result } = renderHook(() => useAmbient());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
  });

  it("should report isPlaying as false when paused", () => {
    const { result } = renderHook(() => useAmbient());

    expect(result.current.isPlaying).toBe(false);
  });

  it("should default to rain-light when toggling play with no previous sound", () => {
    const { result } = renderHook(() => useAmbient());

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.currentSound).toBe("rain-light");
    expect(result.current.isPlaying).toBe(true);
  });

  it("should pause and set sound to none when toggling play while playing", () => {
    const { result } = renderHook(() => useAmbient());

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentSound).toBe("none");
  });

  it("should resume previous sound after pause and play", () => {
    const { result } = renderHook(() => useAmbient());

    act(() => {
      result.current.setCurrentSound("fireplace");
    });

    expect(result.current.currentSound).toBe("fireplace");

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.currentSound).toBe("none");

    act(() => {
      result.current.togglePlay();
    });

    expect(result.current.currentSound).toBe("fireplace");
  });

  it("should change sound and unpause via setCurrentSound", () => {
    const { result } = renderHook(() => useAmbient());

    act(() => {
      result.current.setCurrentSound("ocean-waves");
    });

    expect(result.current.currentSound).toBe("ocean-waves");
    expect(result.current.isPlaying).toBe(true);
  });

  it("should persist sound choice to localStorage", () => {
    const { result } = renderHook(() => useAmbient());

    act(() => {
      result.current.setCurrentSound("night");
    });

    expect(localStorage.getItem(AMBIENT.STORAGE_KEY)).toBe("night");
  });

  it("should unload howl on unmount", () => {
    const { result, unmount } = renderHook(() => useAmbient());

    act(() => {
      result.current.setCurrentSound("rain-light");
    });

    unmount();

    expect(mockUnload).toHaveBeenCalled();
  });
});
