import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { useKeyboard } from "../../hooks/useKeyboard";

describe("useKeyboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call onSpace when Space key is pressed", () => {
    const onSpace = vi.fn();

    renderHook(() => useKeyboard({ onSpace }));

    const event = new KeyboardEvent("keydown", { code: "Space" });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    window.dispatchEvent(event);

    expect(onSpace).toHaveBeenCalledTimes(1);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("should call onLeft when ArrowLeft is pressed", () => {
    const onLeft = vi.fn();

    renderHook(() => useKeyboard({ onLeft }));

    const event = new KeyboardEvent("keydown", { code: "ArrowLeft" });
    window.dispatchEvent(event);

    expect(onLeft).toHaveBeenCalledTimes(1);
  });

  it("should call onRight when ArrowRight is pressed", () => {
    const onRight = vi.fn();

    renderHook(() => useKeyboard({ onRight }));

    const event = new KeyboardEvent("keydown", { code: "ArrowRight" });
    window.dispatchEvent(event);

    expect(onRight).toHaveBeenCalledTimes(1);
  });

  it("should call onKeyA when A key is pressed", () => {
    const onKeyA = vi.fn();

    renderHook(() => useKeyboard({ onKeyA }));

    const event = new KeyboardEvent("keydown", { code: "KeyA" });
    window.dispatchEvent(event);

    expect(onKeyA).toHaveBeenCalledTimes(1);
  });

  it("should call onKeyM when M key is pressed", () => {
    const onKeyM = vi.fn();

    renderHook(() => useKeyboard({ onKeyM }));

    const event = new KeyboardEvent("keydown", { code: "KeyM" });
    window.dispatchEvent(event);

    expect(onKeyM).toHaveBeenCalledTimes(1);
  });

  it("should call onKeyF when F key is pressed", () => {
    const onKeyF = vi.fn();

    renderHook(() => useKeyboard({ onKeyF }));

    const event = new KeyboardEvent("keydown", { code: "KeyF" });
    window.dispatchEvent(event);

    expect(onKeyF).toHaveBeenCalledTimes(1);
  });

  it("should not call callbacks when typing in an input", () => {
    const onSpace = vi.fn();
    const onKeyA = vi.fn();

    renderHook(() => useKeyboard({ onSpace, onKeyA }));

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", {
      code: "Space",
      bubbles: true,
    });
    Object.defineProperty(event, "target", { value: input, enumerable: true });

    window.dispatchEvent(event);

    expect(onSpace).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("should not call callbacks when typing in a textarea", () => {
    const onKeyA = vi.fn();

    renderHook(() => useKeyboard({ onKeyA }));

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const event = new KeyboardEvent("keydown", { code: "KeyA", bubbles: true });
    Object.defineProperty(event, "target", {
      value: textarea,
      enumerable: true,
    });

    window.dispatchEvent(event);

    expect(onKeyA).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("should not call callback if handler is not provided", () => {
    expect(() => {
      renderHook(() => useKeyboard({}));
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    }).not.toThrow();
  });

  it("should remove event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useKeyboard({ onSpace: vi.fn() }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  it("should handle multiple callbacks simultaneously", () => {
    const onSpace = vi.fn();
    const onLeft = vi.fn();
    const onKeyA = vi.fn();

    renderHook(() => useKeyboard({ onSpace, onLeft, onKeyA }));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA" }));

    expect(onSpace).toHaveBeenCalledTimes(1);
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onKeyA).toHaveBeenCalledTimes(1);
  });
});
