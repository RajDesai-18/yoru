import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioSource } from "@/hooks/useAudioSource";

describe("useAudioSource", () => {
  it("defaults to builtin source", () => {
    const { result } = renderHook(() => useAudioSource());

    expect(result.current.source).toBe("builtin");
    expect(result.current.isSpotify).toBe(false);
  });

  it("switches to spotify source", () => {
    const { result } = renderHook(() => useAudioSource());

    act(() => {
      result.current.setSource("spotify");
    });

    expect(result.current.source).toBe("spotify");
    expect(result.current.isSpotify).toBe(true);
  });

  it("switches back to builtin from spotify", () => {
    const { result } = renderHook(() => useAudioSource());

    act(() => {
      result.current.setSource("spotify");
    });

    expect(result.current.isSpotify).toBe(true);

    act(() => {
      result.current.setSource("builtin");
    });

    expect(result.current.source).toBe("builtin");
    expect(result.current.isSpotify).toBe(false);
  });
});
