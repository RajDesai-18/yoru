import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVideoMode } from "../../hooks/useVideoMode";
import { VIDEO } from "../../lib/constants";

// Mock isTouchDevice
let mockIsTouch = false;
vi.mock("../../lib/utils/isTouchDevice", () => ({
  isTouchDevice: () => mockIsTouch,
}));

describe("useVideoMode", () => {
  beforeEach(() => {
    localStorage.clear();
    mockIsTouch = false;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should default to video disabled", () => {
    const { result } = renderHook(() => useVideoMode());

    expect(result.current.videoEnabled).toBe(false);
  });

  it("should toggle video on and off", () => {
    const { result } = renderHook(() => useVideoMode());

    act(() => {
      result.current.toggleVideo();
    });

    expect(result.current.videoEnabled).toBe(true);

    act(() => {
      result.current.toggleVideo();
    });

    expect(result.current.videoEnabled).toBe(false);
  });

  it("should persist video preference to localStorage", () => {
    const { result } = renderHook(() => useVideoMode());

    act(() => {
      result.current.toggleVideo();
    });

    expect(localStorage.getItem(VIDEO.STORAGE_KEY)).toBe("true");

    act(() => {
      result.current.toggleVideo();
    });

    expect(localStorage.getItem(VIDEO.STORAGE_KEY)).toBe("false");
  });

  it("should restore video preference from localStorage", () => {
    localStorage.setItem(VIDEO.STORAGE_KEY, "true");

    const { result } = renderHook(() => useVideoMode());

    expect(result.current.videoEnabled).toBe(true);
  });

  it("should not restore video preference on touch devices", () => {
    mockIsTouch = true;
    localStorage.setItem(VIDEO.STORAGE_KEY, "true");

    const { result } = renderHook(() => useVideoMode());

    expect(result.current.videoEnabled).toBe(false);
  });

  it("should detect touch device", () => {
    mockIsTouch = true;

    const { result } = renderHook(() => useVideoMode());

    expect(result.current.isTouch).toBe(true);
  });

  it("should report sceneHasVideo correctly", () => {
    const { result } = renderHook(() => useVideoMode());

    // rain-1 (index 0) has video
    expect(result.current.sceneHasVideo(0)).toBe(true);

    // night-1 (index 12) does not have video
    expect(result.current.sceneHasVideo(12)).toBe(false);
  });

  it("should return false for shouldShowVideo when video is disabled", () => {
    const { result } = renderHook(() => useVideoMode());

    // rain-1 has video but videoEnabled is false
    expect(result.current.shouldShowVideo(0)).toBe(false);
  });

  it("should return true for shouldShowVideo when video is enabled and scene has video", () => {
    const { result } = renderHook(() => useVideoMode());

    act(() => {
      result.current.toggleVideo();
    });

    // rain-1 (index 0) has video
    expect(result.current.shouldShowVideo(0)).toBe(true);
  });

  it("should return false for shouldShowVideo when scene has no video", () => {
    const { result } = renderHook(() => useVideoMode());

    act(() => {
      result.current.toggleVideo();
    });

    // night-1 (index 12) has no video
    expect(result.current.shouldShowVideo(12)).toBe(false);
  });

  it("should return false for shouldShowVideo on touch devices even when enabled", () => {
    mockIsTouch = true;

    const { result } = renderHook(() => useVideoMode());

    act(() => {
      result.current.toggleVideo();
    });

    expect(result.current.shouldShowVideo(0)).toBe(false);
  });

  it("should handle invalid scene index gracefully", () => {
    const { result } = renderHook(() => useVideoMode());

    expect(result.current.sceneHasVideo(-1)).toBe(false);
    expect(result.current.sceneHasVideo(999)).toBe(false);
    expect(result.current.shouldShowVideo(-1)).toBe(false);
  });
});
