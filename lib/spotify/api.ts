const SPOTIFY_API = "https://api.spotify.com/v1";

async function spotifyFetch<T>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Spotify API error: ${response.status}`
    );
  }

  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text);
  } catch {
    return {} as T;
  }
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number | null; width: number | null }[] | null;
  totalTracks: number;
  uri: string;
}

export interface SpotifyPlaylistTrack {
  id: string;
  name: string;
  artists: string;
  duration: string;
  uri: string;
  albumArt: string;
}

interface RawPlaylistItem {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number | null; width: number | null }[] | null;
  tracks?: { total: number };
  items?: { total: number };
  uri: string;
}

interface RawPlaylistTrackItem {
  track: {
    id: string;
    name: string;
    uri: string;
    duration_ms: number;
    artists: { name: string }[];
    album: {
      images: { url: string; height: number | null; width: number | null }[];
    };
  } | null;
}

interface PlaylistsResponse {
  items: (RawPlaylistItem | null)[];
  total: number;
  next: string | null;
}

interface PlaylistTracksResponse {
  items: RawPlaylistTrackItem[];
  total: number;
  next: string | null;
}

function getTrackCount(item: RawPlaylistItem): number {
  if (item.tracks?.total !== undefined) return item.tracks.total;
  if (item.items?.total !== undefined) return item.items.total;
  return 0;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function getUserPlaylists(
  accessToken: string
): Promise<SpotifyPlaylist[]> {
  const data = await spotifyFetch<PlaylistsResponse>(
    "/me/playlists?limit=50",
    accessToken
  );
  return data.items
    .filter((item): item is RawPlaylistItem => item !== null)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      images: item.images,
      totalTracks: getTrackCount(item),
      uri: item.uri,
    }));
}

export async function getPlaylistTracks(
  accessToken: string,
  playlistId: string
): Promise<SpotifyPlaylistTrack[]> {
  const data = await spotifyFetch<PlaylistTracksResponse>(
    `/playlists/${playlistId}/tracks?limit=50`,
    accessToken
  );
  return data.items
    .filter((item): item is RawPlaylistTrackItem => item.track !== null)
    .map((item) => ({
      id: item.track!.id,
      name: item.track!.name,
      artists: item.track!.artists.map((a) => a.name).join(", "),
      duration: formatDuration(item.track!.duration_ms),
      uri: item.track!.uri,
      albumArt:
        item.track!.album.images[item.track!.album.images.length - 1]?.url ??
        "",
    }));
}

export async function startPlayback(
  accessToken: string,
  deviceId: string,
  contextUri: string,
  trackUri?: string
): Promise<void> {
  const body: Record<string, unknown> = { context_uri: contextUri };
  if (trackUri) {
    body.offset = { uri: trackUri };
  }
  await spotifyFetch(`/me/player/play?device_id=${deviceId}`, accessToken, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function transferPlayback(
  accessToken: string,
  deviceId: string
): Promise<void> {
  await spotifyFetch("/me/player", accessToken, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
}

export async function setShuffle(
  accessToken: string,
  state: boolean
): Promise<void> {
  await spotifyFetch(`/me/player/shuffle?state=${state}`, accessToken, {
    method: "PUT",
  });
}

export type RepeatMode = "off" | "context" | "track";

export async function setRepeat(
  accessToken: string,
  state: RepeatMode
): Promise<void> {
  await spotifyFetch(`/me/player/repeat?state=${state}`, accessToken, {
    method: "PUT",
  });
}
