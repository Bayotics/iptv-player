"use client"

import { Suspense } from "react"
import { VideoPlayer } from "@/components/player/video-player"
import { Loader2 } from "lucide-react"

function PlayerContent() {
  return <VideoPlayer />
}

export default function PlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PlayerContent />
    </Suspense>
  )
}
