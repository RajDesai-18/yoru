import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVisualFX } from "../../hooks/useVisualFX";
import { VISUAL_FX } from "../../lib/constants";

// Mock matchMedia
let mockReducedMotion = false;
let mediaChangeHandler: ((e: MediaQueryListEvent) => void) | null = null;

beforeEach(() => {
  mockReducedMotion = false;
  mediaChangeHandler = null;

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduced-motion") ? mockReducedMotion : false,
      media: query,
      addEventListener: vi.fn((_, handler) => {
        if (query.includes("reduced-motion")) {
          mediaChangeHandler = handler;
        }
      }),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("useVisualFX", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should default to no FX selected", () => {
    const { result } = renderHook(() => useVisualFX());

    expect(result.current.selectedFX).toBe("none");
    expect(result.current.activeFX).toBe("none");
    expect(result.current.isActive).toBe(false);
  });

  it("should set a specific FX", () => {
    const { result } = renderHook(() => useVisualFX());

    act(() => {
      result.current.setFX("bokeh");
    });

    expect(result.current.selectedFX).toBe("bokeh");
    expect(result.current.activeFX).toBe("bokeh");
    expect(result.current.isActive).toBe(true);
  });

  it("should toggle between none and particles", () => {
    const { result } = renderHook(() => useVisualFX());

    act(() => {
      result.current.toggleFX();
    });

    expect(result.current.selectedFX).toBe("particles");
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.toggleFX();
    });

    expect(result.current.selectedFX).toBe("none");
    expect(result.current.isActive).toBe(false);
  });

  it("should persist FX selection to localStorage", () => {
    const { result } = renderHook(() => useVisualFX());

    act(() => {
      result.current.setFX("fireflies");
    });

    expect(localStorage.getItem(VISUAL_FX.STORAGE_KEY)).toBe("fireflies");
  });

  it("should persist toggle to localStorage", () => {
    const { result } = renderHook(() => useVisualFX());

    act(() => {
      result.current.toggleFX();
    });

    expect(localStorage.getItem(VISUAL_FX.STORAGE_KEY)).toBe("particles");

    act(() => {
      result.current.toggleFX();
    });

    expect(localStorage.getItem(VISUAL_FX.STORAGE_KEY)).toBe("none");
  });

  it("should restore FX selection from localStorage", () => {
    localStorage.setItem(VISUAL_FX.STORAGE_KEY, "bokeh");

    const { result } = renderHook(() => useVisualFX());

    expect(result.current.selectedFX).toBe("bokeh");
    expect(result.current.isActive).toBe(true);
  });

  it("should ignore invalid localStorage values", () => {
    localStorage.setItem(VISUAL_FX.STORAGE_KEY, "invalid-fx");

    const { result } = renderHook(() => useVisualFX());

    expect(result.current.selectedFX).toBe("none");
  });

  it("should disable FX when prefers-reduced-motion is enabled", () => {
    mockReducedMotion = true;

    const { result } = renderHook(() => useVisualFX());

    act(() => {
      result.current.setFX("bokeh");
    });

    expect(result.current.selectedFX).toBe("bokeh");
    expect(result.current.activeFX).toBe("none");
    expect(result.current.isActive).toBe(false);
    expect(result.current.reducedMotion).toBe(true);
  });

  it("should respond to reduced motion media query changes", () => {
    const { result } = renderHook(() => useVisualFX());

    act(() => {
      result.current.setFX("particles");
    });

    expect(result.current.activeFX).toBe("particles");

    // Simulate user enabling reduced motion
    act(() => {
      mediaChangeHandler?.({
        matches: true,
      } as MediaQueryListEvent);
    });

    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.activeFX).toBe("none");
    expect(result.current.selectedFX).toBe("particles");
  });

  it("should cycle through all FX options with setFX", () => {
    const { result } = renderHook(() => useVisualFX());

    const fxIds = ["bokeh", "fireflies", "particles", "none"] as const;

    for (const id of fxIds) {
      act(() => {
        result.current.setFX(id);
      });
      expect(result.current.selectedFX).toBe(id);
    }
  });
});
