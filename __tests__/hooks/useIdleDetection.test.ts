import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIdleDetection } from "../../hooks/useIdleDetection";

// Mock isTouchDevice to return false (desktop behavior)
vi.mock("../../lib/utils/isTouchDevice", () => ({
  isTouchDevice: () => false,
}));

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

    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

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

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);

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

    act(() => {
      vi.advanceTimersByTime(2000);
      window.dispatchEvent(new MouseEvent("mousemove"));
    });

    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

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

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onIdle).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });

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

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });

    expect(onActive).toHaveBeenCalledTimes(1);
  });
});
