"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/main/main-nav"
import { LiveContent } from "@/components/main/live-content"
import { MoviesContent } from "@/components/main/movies-content"
import { SeriesContent } from "@/components/main/series-content"
import { UserAccount } from "@/components/main/user-account"
import { Loader2 } from "lucide-react"

type NavSection = "live" | "movies" | "series" | "account"

export default function MainPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<NavSection>("live")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user has a playlist
    const hasPlaylist = localStorage.getItem("hasPlaylist")
    if (hasPlaylist !== "true") {
      router.push("/activate")
      return
    }
    setIsLoading(false)
  }, [router])

  const handleChangePlaylist = () => {
    localStorage.removeItem("hasPlaylist")
    localStorage.removeItem("activePlaylistId")
    router.push("/activate")
  }

  const handleSettings = () => {
    router.push("/settings")
  }

  const handleReload = () => {
    window.location.reload()
  }

  const handleExit = () => {
    if (confirm("Are you sure you want to exit?")) {
      localStorage.clear()
      router.push("/activate")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onChangePlaylist={handleChangePlaylist}
        onSettings={handleSettings}
        onReload={handleReload}
        onExit={handleExit}
      />

      <main className="flex-1 p-6">
        {activeSection === "live" && <LiveContent />}
        {activeSection === "movies" && <MoviesContent />}
        {activeSection === "series" && <SeriesContent />}
        {activeSection === "account" && <UserAccount />}
      </main>
    </div>
  )
}
