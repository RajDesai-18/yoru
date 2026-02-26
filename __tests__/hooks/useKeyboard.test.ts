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

  it("should call onUp when ArrowUp is pressed", () => {
    const onUp = vi.fn();

    renderHook(() => useKeyboard({ onUp }));

    const event = new KeyboardEvent("keydown", { code: "ArrowUp" });
    window.dispatchEvent(event);

    expect(onUp).toHaveBeenCalledTimes(1);
  });

  it("should call onDown when ArrowDown is pressed", () => {
    const onDown = vi.fn();

    renderHook(() => useKeyboard({ onDown }));

    const event = new KeyboardEvent("keydown", { code: "ArrowDown" });
    window.dispatchEvent(event);

    expect(onDown).toHaveBeenCalledTimes(1);
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

  it("should call onSlash when / is pressed", () => {
    const onSlash = vi.fn();

    renderHook(() => useKeyboard({ onSlash }));

    const event = new KeyboardEvent("keydown", { code: "Slash" });
    window.dispatchEvent(event);

    expect(onSlash).toHaveBeenCalledTimes(1);
  });

  it("should call onKeyV when V key is pressed", () => {
    const onKeyV = vi.fn();

    renderHook(() => useKeyboard({ onKeyV }));

    const event = new KeyboardEvent("keydown", { code: "KeyV" });
    window.dispatchEvent(event);

    expect(onKeyV).toHaveBeenCalledTimes(1);
  });

  it("should call onKeyX when X key is pressed", () => {
    const onKeyX = vi.fn();

    renderHook(() => useKeyboard({ onKeyX }));

    const event = new KeyboardEvent("keydown", { code: "KeyX" });
    window.dispatchEvent(event);

    expect(onKeyX).toHaveBeenCalledTimes(1);
  });

  it("should not call callbacks when typing in an input", () => {
    const onSpace = vi.fn();

    renderHook(() => useKeyboard({ onSpace }));

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
    const onKeyM = vi.fn();

    renderHook(() => useKeyboard({ onKeyM }));

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const event = new KeyboardEvent("keydown", { code: "KeyM", bubbles: true });
    Object.defineProperty(event, "target", {
      value: textarea,
      enumerable: true,
    });

    window.dispatchEvent(event);

    expect(onKeyM).not.toHaveBeenCalled();

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
    const onUp = vi.fn();

    renderHook(() => useKeyboard({ onSpace, onLeft, onUp }));

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp" }));

    expect(onSpace).toHaveBeenCalledTimes(1);
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onUp).toHaveBeenCalledTimes(1);
  });
});
