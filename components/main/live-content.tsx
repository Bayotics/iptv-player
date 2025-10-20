"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Play, Grid3x3, List } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Channel {
  id: string
  name: string
  logo?: string
  group?: string
  streamUrl: string
}

export function LiveContent() {
  const router = useRouter()
  const [channels, setChannels] = useState<Channel[]>([])
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchChannels()
  }, [])

  useEffect(() => {
    filterChannels()
  }, [searchQuery, selectedGroup, channels])

  const fetchChannels = async () => {
    try {
      const activePlaylistId = localStorage.getItem("activePlaylistId")

      if (!activePlaylistId) {
        setError("No active playlist found. Please add a playlist first.")
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/channels?type=live&playlistId=${activePlaylistId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch channels")
      }

      setChannels(data.channels || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels")
    } finally {
      setIsLoading(false)
    }
  }

  const filterChannels = () => {
    let filtered = channels

    if (selectedGroup !== "all") {
      filtered = filtered.filter((ch) => ch.group === selectedGroup)
    }

    if (searchQuery) {
      filtered = filtered.filter((ch) => ch.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredChannels(filtered)
  }

  const groups = ["all", ...Array.from(new Set(channels.map((ch) => ch.group).filter(Boolean)))]

  const handlePlayChannel = (channel: Channel) => {
    router.push(`/player?channelId=${channel.id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search live channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((group) => (
          <Badge
            key={group}
            variant={selectedGroup === group ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGroup(group)}
          >
            {group === "all" ? "All Channels" : group}
          </Badge>
        ))}
      </div>

      {filteredChannels.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No channels found</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredChannels.map((channel) => (
            <Card
              key={channel.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => handlePlayChannel(channel)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-video bg-muted">
                  {channel.logo ? (
                    <img
                      src={channel.logo || "/placeholder.svg"}
                      alt={channel.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold">{channel.name}</h3>
                  {channel.group && <p className="text-sm text-muted-foreground">{channel.group}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChannels.map((channel) => (
            <Card
              key={channel.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handlePlayChannel(channel)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                  {channel.logo ? (
                    <img
                      src={channel.logo || "/placeholder.svg"}
                      alt={channel.name}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Play className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{channel.name}</h3>
                  {channel.group && <p className="text-sm text-muted-foreground">{channel.group}</p>}
                </div>
                <Play className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
