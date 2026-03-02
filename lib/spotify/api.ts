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

  if (response.status === 204) return {} as T;
  return response.json();
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; height: number | null; width: number | null }[] | null;
  totalTracks: number;
  uri: string;
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

interface PlaylistsResponse {
  items: (RawPlaylistItem | null)[];
  total: number;
  next: string | null;
}

function getTrackCount(item: RawPlaylistItem): number {
  if (item.tracks?.total !== undefined) return item.tracks.total;
  if (item.items?.total !== undefined) return item.items.total;
  return 0;
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

export async function startPlayback(
  accessToken: string,
  deviceId: string,
  contextUri: string
): Promise<void> {
  await spotifyFetch(`/me/player/play?device_id=${deviceId}`, accessToken, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context_uri: contextUri }),
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
