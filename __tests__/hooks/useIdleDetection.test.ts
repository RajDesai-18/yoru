import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIdleDetection } from "../../hooks/useIdleDetection";

describe("useIdleDetection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should call onIdle after timeout", () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();

    renderHook(() =>
      useIdleDetection({
        onIdle,
        onActive,
        timeout: 3000,
        enabled: true,
      })
    );

    // Should not be idle initially
    expect(onIdle).not.toHaveBeenCalled();

    // Fast-forward time past timeout
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should call onIdle
    expect(onIdle).toHaveBeenCalledTimes(1);
    expect(onActive).not.toHaveBeenCalled();
  });

  it("should call onActive when user moves mouse after being idle", () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();

    renderHook(() =>
      useIdleDetection({
        onIdle,
        onActive,
        timeout: 3000,
        enabled: true,
      })
    );

    // Become idle
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);

    // Trigger mouse move
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });

    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it("should reset timer on user activity", () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();

    renderHook(() =>
      useIdleDetection({
        onIdle,
        onActive,
        timeout: 3000,
        enabled: true,
      })
    );

    // Move mouse at 2s (before timeout)
    act(() => {
      vi.advanceTimersByTime(2000);
      window.dispatchEvent(new MouseEvent("mousemove"));
    });

    // Should not be idle yet
    expect(onIdle).not.toHaveBeenCalled();

    // Wait another 2s (total 4s, but timer was reset)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should not be idle (only 2s since last activity)
    expect(onIdle).not.toHaveBeenCalled();

    // Wait 1 more second (3s since last activity)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now should be idle
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it("should not call onIdle when disabled", () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();

    renderHook(() =>
      useIdleDetection({
        onIdle,
        onActive,
        timeout: 3000,
        enabled: false,
      })
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onIdle).not.toHaveBeenCalled();
  });

  it("should call onActive when disabled while idle", () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();

    const { rerender } = renderHook(
      ({ enabled }) =>
        useIdleDetection({
          onIdle,
          onActive,
          timeout: 3000,
          enabled,
        }),
      { initialProps: { enabled: true } }
    );

    // Become idle
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);

    // Disable hook
    rerender({ enabled: false });

    // Should call onActive when disabled while idle
    expect(onActive).toHaveBeenCalledTimes(1);
  });

  it("should respond to keyboard events", () => {
    const onIdle = vi.fn();
    const onActive = vi.fn();

    renderHook(() =>
      useIdleDetection({
        onIdle,
        onActive,
        timeout: 3000,
        enabled: true,
      })
    );

    // Become idle
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Trigger keydown
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });

    expect(onActive).toHaveBeenCalledTimes(1);
  });
});
