"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Tv2, Film, Clapperboard, User, Menu, Settings, RefreshCw, LogOut, List, Check } from "lucide-react"
import Image from "next/image"

type NavSection = "live" | "movies" | "series" | "account"

interface MainNavProps {
  activeSection: NavSection
  onSectionChange: (section: NavSection) => void
  onChangePlaylist: () => void
  onSettings: () => void
  onReload: () => void
  onExit: () => void
  onPlaylistSwitch: () => void
}

export function MainNav({
  activeSection,
  onSectionChange,
  onChangePlaylist,
  onSettings,
  onReload,
  onExit,
  onPlaylistSwitch,
}: MainNavProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null)
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)

  const navItems = [
    { id: "live" as NavSection, label: "Live TV", icon: Tv2 },
    { id: "movies" as NavSection, label: "Movies", icon: Film },
    { id: "series" as NavSection, label: "Series", icon: Clapperboard },
    { id: "account" as NavSection, label: "Account", icon: User },
  ]

  useEffect(() => {
    fetchPlaylists()
    const storedPlaylistId = localStorage.getItem("activePlaylistId")
    setActivePlaylistId(storedPlaylistId)
  }, [])

  const fetchPlaylists = async () => {
    try {
      setIsLoadingPlaylists(true)
      const deviceKey = localStorage.getItem("deviceKey")
      if (!deviceKey) return

      const response = await fetch(`/api/playlists?deviceKey=${deviceKey}`)
      const data = await response.json()

      if (response.ok) {
        setPlaylists(data.playlists || [])
      }
    } catch (err) {
      console.error("Failed to fetch playlists:", err)
    } finally {
      setIsLoadingPlaylists(false)
    }
  }

  const handleSwitchPlaylist = async (playlistId: string) => {
    localStorage.setItem("activePlaylistId", playlistId)
    setPlaylists(playlists.map((p) => ({ ...p, isActive: p.id === playlistId })))
    setActivePlaylistId(playlistId)
    onPlaylistSwitch()
  }

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Supreme IPTU" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold">Supreme IPTU</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                onClick={() => onSectionChange(item.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <List className="h-4 w-4" />
                {activePlaylist ? activePlaylist.name : "Playlists"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Switch Playlist</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isLoadingPlaylists ? (
                <DropdownMenuItem disabled>Loading playlists...</DropdownMenuItem>
              ) : playlists.length === 0 ? (
                <DropdownMenuItem disabled>No playlists found</DropdownMenuItem>
              ) : (
                playlists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={() => handleSwitchPlaylist(playlist.id)}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate">{playlist.name}</span>
                    {playlist.id === activePlaylistId && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onChangePlaylist}>
                <List className="mr-2 h-4 w-4" />
                Manage Playlists
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExit} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Exit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-end gap-2 md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <DropdownMenuItem key={item.id} onClick={() => onSectionChange(item.id)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Playlists</DropdownMenuLabel>
              {isLoadingPlaylists ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : playlists.length === 0 ? (
                <DropdownMenuItem disabled>No playlists</DropdownMenuItem>
              ) : (
                playlists.slice(0, 3).map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={() => handleSwitchPlaylist(playlist.id)}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate text-sm">{playlist.name}</span>
                    {playlist.id === activePlaylistId && <Check className="h-3 w-3" />}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuItem onClick={onChangePlaylist}>
                <List className="mr-2 h-4 w-4" />
                Manage Playlists
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReload}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExit} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Exit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

interface Playlist {
  id: string
  name: string
  isActive: boolean
}
