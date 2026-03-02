"use client"

import { Suspense, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { exchangeCodeForTokens } from "@/lib/spotify/auth"

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("Spotify auth error:", error)
      router.replace("/")
      return
    }

    if (!code) {
      router.replace("/")
      return
    }

    exchangeCodeForTokens(code)
      .then((tokens) => {
        sessionStorage.setItem("spotify_tokens", JSON.stringify(tokens))
        router.replace("/")
      })
      .catch((err) => {
        console.error("Token exchange failed:", err)
        router.replace("/")
      })
  }, [searchParams, router])

  return (
    <div className="flex h-dvh items-center justify-center bg-black">
      <p className="text-sm text-white/50">Connecting to Spotify...</p>
    </div>
  )
}

export default function SpotifyCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-black">
          <p className="text-sm text-white/50">Connecting to Spotify...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  )
}
