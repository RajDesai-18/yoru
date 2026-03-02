/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type SpotifyTokens,
  isTokenExpired,
  redirectToSpotifyAuth,
  refreshAccessToken,
} from "@/lib/spotify/auth";

const TOKENS_KEY = "spotify_tokens";

interface UseSpotifyReturn {
  isConnected: boolean;
  accessToken: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export function useSpotify(): UseSpotifyReturn {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback(
    (currentTokens: SpotifyTokens) => {
      clearRefreshTimer();

      const msUntilExpiry = currentTokens.expiresAt - Date.now() - 120_000;
      const delay = Math.max(msUntilExpiry, 0);

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          const refreshed = await refreshAccessToken(
            currentTokens.refreshToken
          );
          sessionStorage.setItem(TOKENS_KEY, JSON.stringify(refreshed));
          setTokens(refreshed);
          scheduleRefresh(refreshed);
        } catch {
          sessionStorage.removeItem(TOKENS_KEY);
          setTokens(null);
        }
      }, delay);
    },
    [clearRefreshTimer]
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKENS_KEY);
    if (!stored) return;

    try {
      const parsed: SpotifyTokens = JSON.parse(stored);

      if (isTokenExpired(parsed.expiresAt)) {
        refreshAccessToken(parsed.refreshToken)
          .then((refreshed) => {
            sessionStorage.setItem(TOKENS_KEY, JSON.stringify(refreshed));
            setTokens(refreshed);
            scheduleRefresh(refreshed);
          })
          .catch(() => {
            sessionStorage.removeItem(TOKENS_KEY);
          });
      } else {
        setTokens(parsed);
        scheduleRefresh(parsed);
      }
    } catch {
      sessionStorage.removeItem(TOKENS_KEY);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    return clearRefreshTimer;
  }, [clearRefreshTimer]);

  const connect = useCallback(async () => {
    await redirectToSpotifyAuth();
  }, []);

  const disconnect = useCallback(() => {
    clearRefreshTimer();
    sessionStorage.removeItem(TOKENS_KEY);
    setTokens(null);
  }, [clearRefreshTimer]);

  return {
    isConnected: tokens !== null,
    accessToken: tokens?.accessToken ?? null,
    connect,
    disconnect,
  };
}
