"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface PlaylistUrlFormProps {
  onSubmit: (url: string, name: string) => Promise<void>
  isLoading: boolean
}

export function PlaylistUrlForm({ onSubmit, isLoading }: PlaylistUrlFormProps) {
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(url, name)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="playlist-name">Playlist Name</Label>
        <Input
          id="playlist-name"
          placeholder="My IPTV Playlist"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="playlist-url">Playlist URL</Label>
        <Input
          id="playlist-url"
          type="url"
          placeholder="https://example.com/playlist.m3u8"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">Enter the URL of your M3U or M3U8 playlist file</p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validating...
          </>
        ) : (
          "Add Playlist"
        )}
      </Button>
    </form>
  )
}
