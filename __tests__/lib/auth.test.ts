import { describe, it, expect, vi, beforeEach } from "vitest";
import { isTokenExpired } from "@/lib/spotify/auth";

describe("isTokenExpired", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("returns false when token is still valid", () => {
    const expiresAt = Date.now() + 300_000;
    expect(isTokenExpired(expiresAt)).toBe(false);
  });

  it("returns true when token is expired", () => {
    const expiresAt = Date.now() - 1000;
    expect(isTokenExpired(expiresAt)).toBe(true);
  });

  it("returns true within 60-second buffer before expiry", () => {
    const expiresAt = Date.now() + 30_000;
    expect(isTokenExpired(expiresAt)).toBe(true);
  });

  it("returns false when exactly at 60-second buffer boundary", () => {
    const expiresAt = Date.now() + 60_001;
    expect(isTokenExpired(expiresAt)).toBe(false);
  });
});
