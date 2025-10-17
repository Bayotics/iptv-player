"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a playlist
    const hasPlaylist = localStorage.getItem("hasPlaylist")

    if (hasPlaylist === "true") {
      router.push("/main")
    } else {
      router.push("/activate")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
