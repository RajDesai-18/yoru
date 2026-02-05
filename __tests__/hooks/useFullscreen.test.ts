import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFullscreen } from "../../hooks/useFullscreen";

describe("useFullscreen", () => {
  beforeEach(() => {
    // Mock fullscreen APIs
    document.documentElement.requestFullscreen = vi
      .fn()
      .mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);

    // Mock fullscreenElement getter
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with isFullscreen as false", () => {
    const { result } = renderHook(() => useFullscreen());

    expect(result.current.isFullscreen).toBe(false);
  });

  it("should call requestFullscreen when toggling from non-fullscreen", async () => {
    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.toggleFullscreen();
    });

    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("should call exitFullscreen when toggling from fullscreen", async () => {
    // Set initial state to fullscreen
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: document.documentElement,
    });

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.toggleFullscreen();
    });

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it("should update isFullscreen state when fullscreenchange event fires", async () => {
    const { result } = renderHook(() => useFullscreen());

    // Enter fullscreen
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: document.documentElement,
    });

    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    await waitFor(() => {
      expect(result.current.isFullscreen).toBe(true);
    });

    // Exit fullscreen
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: null,
    });

    act(() => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });

    await waitFor(() => {
      expect(result.current.isFullscreen).toBe(false);
    });
  });

  it("should handle requestFullscreen errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("Fullscreen not allowed");

    document.documentElement.requestFullscreen = vi
      .fn()
      .mockRejectedValue(error);

    const { result } = renderHook(() => useFullscreen());

    await act(async () => {
      await result.current.toggleFullscreen();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Fullscreen error:", error);

    consoleErrorSpy.mockRestore();
  });

  it("should remove event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useFullscreen());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "fullscreenchange",
      expect.any(Function)
    );
  });
});
