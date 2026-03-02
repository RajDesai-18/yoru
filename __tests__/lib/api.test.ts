import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { getUserPlaylists } from "@/lib/spotify/api";

describe("getUserPlaylists", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("maps playlist data with tracks field (legacy API)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: "playlist-1",
            name: "My Playlist",
            description: "A test playlist",
            images: [
              { url: "https://i.scdn.co/image/test", height: 300, width: 300 },
            ],
            tracks: { total: 25 },
            uri: "spotify:playlist:playlist-1",
          },
        ],
        total: 1,
        next: null,
      }),
    });

    const playlists = await getUserPlaylists("test-token");

    expect(playlists).toHaveLength(1);
    expect(playlists[0]).toEqual({
      id: "playlist-1",
      name: "My Playlist",
      description: "A test playlist",
      images: [
        { url: "https://i.scdn.co/image/test", height: 300, width: 300 },
      ],
      totalTracks: 25,
      uri: "spotify:playlist:playlist-1",
    });
  });

  it("maps playlist data with items field (Feb 2026 API)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: "playlist-2",
            name: "New API Playlist",
            description: "",
            images: null,
            items: { total: 42 },
            uri: "spotify:playlist:playlist-2",
          },
        ],
        total: 1,
        next: null,
      }),
    });

    const playlists = await getUserPlaylists("test-token");

    expect(playlists).toHaveLength(1);
    expect(playlists[0]!.totalTracks).toBe(42);
  });

  it("defaults to 0 tracks when both tracks and items are missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: "playlist-3",
            name: "Empty Playlist",
            description: "",
            images: null,
            uri: "spotify:playlist:playlist-3",
          },
        ],
        total: 1,
        next: null,
      }),
    });

    const playlists = await getUserPlaylists("test-token");

    expect(playlists[0]!.totalTracks).toBe(0);
  });

  it("filters out null items from response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          null,
          {
            id: "playlist-4",
            name: "Valid Playlist",
            description: "",
            images: null,
            tracks: { total: 10 },
            uri: "spotify:playlist:playlist-4",
          },
          null,
        ],
        total: 3,
        next: null,
      }),
    });

    const playlists = await getUserPlaylists("test-token");

    expect(playlists).toHaveLength(1);
    expect(playlists[0]!.name).toBe("Valid Playlist");
  });

  it("handles null images gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: "playlist-5",
            name: "No Image Playlist",
            description: "",
            images: null,
            tracks: { total: 5 },
            uri: "spotify:playlist:playlist-5",
          },
        ],
        total: 1,
        next: null,
      }),
    });

    const playlists = await getUserPlaylists("test-token");

    expect(playlists[0]!.images).toBeNull();
  });

  it("sends authorization header with access token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: [], total: 0, next: null }),
    });

    await getUserPlaylists("my-access-token");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-access-token",
        }),
      })
    );
  });

  it("throws on API error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Invalid token" } }),
    });

    await expect(getUserPlaylists("bad-token")).rejects.toThrow(
      "Invalid token"
    );
  });
});
